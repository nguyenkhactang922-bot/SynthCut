import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const repoRoot = resolve(".");
const harnessDir = join(repoRoot, ".tmp", "tve-imp-007-ui-harness");
rmSync(harnessDir, { recursive: true, force: true });
mkdirSync(harnessDir, { recursive: true });

writeFileSync(join(harnessDir, "index.html"), `<!doctype html>
<html><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>TVE-IMP-007</title></head>
<body><div id="root"></div><script type="module" src="/src.tsx"></script></body></html>\n`, "utf8");

writeFileSync(join(harnessDir, "src.tsx"), `import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Timeline } from "../../apps/desktop/src/timeline";
import { createPlaybackStore } from "../../apps/desktop/src/playback";
import type { MediaAsset, Project } from "../../apps/desktop/src/types";
import "../../apps/desktop/src/styles.css";

(Element.prototype as any).setPointerCapture = () => {};
(Element.prototype as any).releasePointerCapture = () => {};
document.documentElement.style.height = "100%";
document.body.style.height = "100%";
document.body.style.margin = "0";
(document.getElementById("root") as HTMLElement).style.height = "100%";

const FPS = 30;
const CLIP_SEC = 6;
const CLIP_FRAMES = FPS * CLIP_SEC;
const CLIP_COUNT = 300;
const appStart = performance.now();

const asset: MediaAsset = {
  id: "asset-fixture", path: "fixture.mp4", name: "fixture", duration: CLIP_SEC,
  width: 1920, height: 1080, fps: FPS, hasVideo: true, hasAudio: false, addedAt: Date.now(),
};

function makeProject(): Project {
  const clips = Array.from({ length: CLIP_COUNT }, (_, i) => ({
    id: \`clip-\${i}\`,
    assetId: asset.id,
    startFrame: i * CLIP_FRAMES,
    sourceInFrame: 0,
    sourceOutFrame: CLIP_FRAMES,
    overlays: [{ id: \`ov-\${i}\`, text: \`T\${i}\`, startFrame: 0, endFrame: CLIP_FRAMES }],
  }));
  const now = Date.now();
  return {
    id: "ui300", name: "UI 300", width: 1920, height: 1080, fps: FPS,
    assets: [asset], tracks: [{ id: "v0", kind: "video", index: 0, clips }],
    revision: 1, schemaVersion: 1, createdAt: now, updatedAt: now,
  };
}

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
const twoFrames = async () => { await nextFrame(); await nextFrame(); };
const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
const percentile = (xs: number[], p: number) => {
  if (!xs.length) return 0;
  const sorted = [...xs].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * p) - 1))];
};

let lastMoveCommitAt = 0;

function Harness() {
  const [project, setProject] = useState<Project>(() => makeProject());
  const [selectedClip, setSelectedClip] = useState<string | null>(null);
  const store = useRef(createPlaybackStore()).current;

  useEffect(() => { store.set({ duration: CLIP_COUNT * CLIP_SEC }); }, [store]);

  const onMoveClip = (clipId: string, startFrame: number, trackIndex: number) => {
    lastMoveCommitAt = performance.now();
    setProject((prev) => ({
      ...prev,
      revision: prev.revision + 1,
      updatedAt: Date.now(),
      tracks: prev.tracks.map((track) => track.index !== trackIndex ? track : ({
        ...track,
        clips: track.clips.map((clip) => clip.id === clipId ? { ...clip, startFrame } : clip),
      })),
    }));
  };

  const onTrimClip = (clipId: string, sourceInFrame: number | undefined, sourceOutFrame: number | undefined) => {
    setProject((prev) => ({
      ...prev,
      revision: prev.revision + 1,
      tracks: prev.tracks.map((track) => ({
        ...track,
        clips: track.clips.map((clip) => clip.id === clipId ? {
          ...clip,
          sourceInFrame: sourceInFrame ?? clip.sourceInFrame,
          sourceOutFrame: sourceOutFrame ?? clip.sourceOutFrame,
        } : clip),
      })),
    }));
  };

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await twoFrames();
      if (cancelled) return;
      const firstPaintMs = performance.now() - appStart;
      const initialRenderedClips = document.querySelectorAll(".tl-clip").length;
      const initialRenderedElements = document.querySelectorAll(".tl-elbar").length;
      const authoritativeClipCount = project.tracks.reduce((n, t) => n + t.clips.length, 0);

      const longTasks: number[] = [];
      let observer: PerformanceObserver | null = null;
      if ((PerformanceObserver as any).supportedEntryTypes?.includes("longtask")) {
        observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) longTasks.push(entry.duration);
        });
        observer.observe({ entryTypes: ["longtask"] });
      }

      const scroll = document.querySelector(".tl-scroll") as HTMLElement | null;
      const ruler = document.querySelector(".tl-ruler") as HTMLElement | null;
      if (!scroll || !ruler) throw new Error("timeline scroll/ruler missing");

      const samples: number[] = [];
      let maxRenderedClips = initialRenderedClips;
      let maxRenderedElements = initialRenderedElements;
      const traceStart = performance.now();
      let step = 0;
      while (performance.now() - traceStart < 30_000) {
        await wait(70);
        const t0 = performance.now();
        if (step % 3 === 0) {
          const maxScroll = Math.max(0, scroll.scrollWidth - scroll.clientWidth);
          scroll.scrollLeft = maxScroll > 0 ? (step * 173) % maxScroll : 0;
        } else if (step % 3 === 1) {
          const r = scroll.getBoundingClientRect();
          scroll.dispatchEvent(new WheelEvent("wheel", {
            bubbles: true, cancelable: true, ctrlKey: true,
            deltaY: step % 2 === 0 ? -90 : 90,
            clientX: r.left + r.width * 0.55,
            clientY: r.top + 20,
          }));
        } else {
          const r = ruler.getBoundingClientRect();
          const x = r.left + 60 + ((step * 31) % Math.max(80, Math.floor(r.width - 120)));
          ruler.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true, pointerId: 7, clientX: x, clientY: r.top + 8, buttons: 1 }));
          ruler.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, cancelable: true, pointerId: 7, clientX: x, clientY: r.top + 8, buttons: 0 }));
        }
        await nextFrame();
        samples.push(performance.now() - t0);
        maxRenderedClips = Math.max(maxRenderedClips, document.querySelectorAll(".tl-clip").length);
        maxRenderedElements = Math.max(maxRenderedElements, document.querySelectorAll(".tl-elbar").length);
        step += 1;
      }
      const traceDurationMs = performance.now() - traceStart;
      observer?.disconnect();

      scroll.scrollLeft = 0;
      await twoFrames();
      const firstClip = document.querySelector(".tl-clip") as HTMLElement | null;
      if (!firstClip) throw new Error("first visible clip missing");
      firstClip.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
      await nextFrame();
      const selectedVisible = document.querySelectorAll(".tl-clip.selected").length;
      scroll.scrollLeft = Math.max(0, scroll.scrollWidth - scroll.clientWidth);
      await twoFrames();
      const selectedOffscreen = document.querySelectorAll(".tl-clip.selected").length;

      scroll.scrollLeft = 0;
      await twoFrames();
      const dragClip = document.querySelector(".tl-clip") as HTMLElement | null;
      if (!dragClip) throw new Error("drag clip missing");
      const beforeLeft = parseFloat(dragClip.style.left || "0");
      const rect = dragClip.getBoundingClientRect();
      const cx = rect.left + Math.max(10, Math.min(rect.width - 10, rect.width * 0.45));
      const cy = rect.top + Math.max(8, rect.height * 0.5);
      dragClip.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true, pointerId: 11, clientX: cx, clientY: cy, buttons: 1 }));
      await nextFrame();
      window.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, cancelable: true, pointerId: 11, clientX: cx + 84, clientY: cy, buttons: 1 }));
      await nextFrame();
      const releaseAt = performance.now();
      window.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, cancelable: true, pointerId: 11, clientX: cx + 84, clientY: cy, buttons: 0 }));

      let dragReflectionMs = Number.POSITIVE_INFINITY;
      const reflectionDeadline = performance.now() + 1500;
      while (performance.now() < reflectionDeadline) {
        await nextFrame();
        const selected = document.querySelector(".tl-clip.selected") as HTMLElement | null;
        if (selected && Math.abs(parseFloat(selected.style.left || "0") - beforeLeft) > 4) {
          dragReflectionMs = performance.now() - releaseAt;
          break;
        }
      }

      const p95 = percentile(samples, 0.95);
      const maxInteractionMs = samples.length ? Math.max(...samples) : 0;
      const longestLongTaskMs = longTasks.length ? Math.max(...longTasks) : 0;
      const memory = (performance as any).memory;
      const result = {
        status: "PASS",
        firstPaintMs,
        authoritativeClipCount,
        initialRenderedClips,
        initialRenderedElements,
        maxRenderedClips,
        maxRenderedElements,
        traceDurationMs,
        interactionSamples: samples.length,
        interactionP95Ms: p95,
        interactionMaxMs: maxInteractionMs,
        longTaskCount: longTasks.length,
        longestLongTaskMs,
        selectedVisible,
        selectedOffscreen,
        lastMoveCommitDelayMs: lastMoveCommitAt > 0 ? Math.max(0, lastMoveCommitAt - releaseAt) : null,
        dragReflectionMs,
        usedJSHeapSize: memory?.usedJSHeapSize ?? null,
        totalJSHeapSize: memory?.totalJSHeapSize ?? null,
        jsHeapSizeLimit: memory?.jsHeapSizeLimit ?? null,
      } as any;
      const failures: string[] = [];
      if (firstPaintMs > 5000) failures.push(\`first paint \${firstPaintMs.toFixed(1)}ms > 5000ms\`);
      if (authoritativeClipCount !== 300) failures.push(\`authoritative clips \${authoritativeClipCount} != 300\`);
      if (initialRenderedClips >= 60) failures.push(\`initial rendered clips \${initialRenderedClips} not culled\`);
      if (maxRenderedClips >= 60) failures.push(\`max rendered clips \${maxRenderedClips} not bounded\`);
      if (initialRenderedElements >= 60 || maxRenderedElements >= 60) failures.push(\`element bars not bounded (\${initialRenderedElements}/\${maxRenderedElements})\`);
      if (p95 > 100) failures.push(\`interaction p95 \${p95.toFixed(1)}ms > 100ms\`);
      if (longestLongTaskMs > 500) failures.push(\`long task \${longestLongTaskMs.toFixed(1)}ms > 500ms\`);
      if (dragReflectionMs > 250) failures.push(\`drag reflection \${dragReflectionMs.toFixed(1)}ms > 250ms\`);
      if (selectedVisible !== 1 || selectedOffscreen !== 1) failures.push(\`selection parity visible/offscreen \${selectedVisible}/\${selectedOffscreen}\`);
      result.failures = failures;
      result.status = failures.length === 0 ? "PASS" : "FAIL";
      (window as any).__UI300_RESULT__ = result;
    })().catch((error) => {
      (window as any).__UI300_RESULT__ = { status: "FAIL_EXCEPTION", error: error instanceof Error ? error.stack ?? error.message : String(error) };
    });
    return () => { cancelled = true; };
  }, []);

  return <Timeline
    project={project}
    assetById={new Map([[asset.id, asset]])}
    thumbs={{}}
    store={store}
    selectedClip={selectedClip}
    justUpdated={false}
    connected={true}
    onSelectClip={setSelectedClip}
    onSeek={(time) => store.set({ playhead: time })}
    onSplit={() => {}}
    onMoveClip={onMoveClip}
    onTrimClip={onTrimClip}
    onRemove={() => {}}
    onRippleDelete={() => {}}
    onSetTrack={() => {}}
    onAddTrack={() => {}}
    onRemoveTrack={() => {}}
    onSetElementWindow={() => {}}
    onSetMarkers={(markers) => setProject((prev) => ({ ...prev, markers, revision: prev.revision + 1 }))}
    />;
}

createRoot(document.getElementById("root")!).render(<Harness />);
`, "utf8");

writeFileSync(join(harnessDir, "main.cjs"), `const { app, BrowserWindow } = require("electron");
const path = require("node:path");
app.setPath("userData", path.join(__dirname, "user-data"));
console.log("UI300_MAIN_START");
let win;
let finished = false;
app.commandLine.appendSwitch("disable-background-timer-throttling");
app.commandLine.appendSwitch("disable-renderer-backgrounding");
app.commandLine.appendSwitch("disable-backgrounding-occluded-windows");
app.commandLine.appendSwitch("disable-frame-rate-limit");
app.commandLine.appendSwitch("disable-gpu-vsync");
app.commandLine.appendSwitch("disable-features", "CalculateNativeWinOcclusion");
function finish(code, payload) {
  if (finished) return;
  finished = true;
  require("node:fs").writeSync(1, "UI300_PRODUCTION_RESULT " + JSON.stringify(payload) + String.fromCharCode(10));
  try { win?.destroy(); } catch {}
  process.exit(code);
}
app.whenReady().then(async () => {
  console.log("UI300_READY");
  win = new BrowserWindow({
    width: 1360, height: 880, show: true, alwaysOnTop: true,
    webPreferences: { contextIsolation: true, nodeIntegration: false, backgroundThrottling: false },
  });
  win.webContents.on("render-process-gone", (_event, details) => finish(2, { status: "FAIL_RENDERER_GONE", details }));
  win.webContents.on("console-message", (_event, level, message) => {
    if (level >= 2) console.error("renderer-console:", message);
  });
  win.setAlwaysOnTop(true);
  win.show();
  win.focus();
  await win.loadFile(path.join(__dirname, "dist", "index.html"));
  console.log("UI300_LOADED");
  win.show();
  win.focus();
  const timeout = setTimeout(() => finish(3, { status: "FAIL_TIMEOUT" }), 90_000);
  const poll = setInterval(async () => {
    if (finished || win.isDestroyed()) return;
    try {
      const result = await win.webContents.executeJavaScript("window.__UI300_RESULT__ || null", true);
      if (result) {
        clearInterval(poll); clearTimeout(timeout);
        finish(result.status === "PASS" ? 0 : 1, { ...result, rendererCrashed: false });
      }
    } catch (error) {
      clearInterval(poll); clearTimeout(timeout);
      finish(4, { status: "FAIL_POLL", error: String(error) });
    }
  }, 250);
});
app.on("window-all-closed", () => { if (!finished) finish(5, { status: "FAIL_WINDOW_CLOSED" }); });
`, "utf8");

const generatedMain = join(harnessDir, "main.cjs");
const mainCheck = spawnSync(process.execPath, ["--check", generatedMain], { cwd: repoRoot, encoding: "utf8", windowsHide: true });
process.stdout.write(mainCheck.stdout ?? "");
process.stderr.write(mainCheck.stderr ?? "");
if (mainCheck.status !== 0) process.exit(mainCheck.status ?? 9);

const viteCli = join(repoRoot, "node_modules", "vite", "bin", "vite.js");
const build = spawnSync(process.execPath, [viteCli, "build", harnessDir, "--outDir", "dist", "--base", "./"], {
  cwd: repoRoot, encoding: "utf8", windowsHide: true, maxBuffer: 20 * 1024 * 1024,
});
process.stdout.write(build.stdout ?? "");
process.stderr.write(build.stderr ?? "");
if (build.status !== 0) process.exit(build.status ?? 10);

const electronExe = join(repoRoot, "node_modules", "electron", "dist", "electron.exe");
const run = spawnSync(electronExe, [join(harnessDir, "main.cjs")], {
  cwd: repoRoot, encoding: "utf8", windowsHide: true, timeout: 100_000, maxBuffer: 20 * 1024 * 1024,
  env: { ...process.env, ELECTRON_DISABLE_SECURITY_WARNINGS: "true" },
});
process.stdout.write(run.stdout ?? "");
process.stderr.write(run.stderr ?? "");
if (run.error) {
  console.error(run.error);
  process.exit(11);
}
process.exit(run.status ?? 12);
