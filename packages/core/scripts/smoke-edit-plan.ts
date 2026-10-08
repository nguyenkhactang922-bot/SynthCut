import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { EditorEngine } from "../src/engine.js";
import { dispatch } from "../src/rpc.js";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`ASSERTION FAILED: ${message}`);
  console.log(`  ok   ${message}`);
}

function snapshot(engine: EditorEngine): string {
  return JSON.stringify(engine.getProject());
}

async function expectReject(
  engine: EditorEngine,
  plan: Record<string, unknown>,
  messagePart: string,
  label: string,
  baseline: string,
): Promise<void> {
  let error: unknown;
  try {
    await dispatch(engine, "dry_run_edit_plan", plan);
  } catch (caught) {
    error = caught;
  }
  assert(error instanceof Error, `${label} rejects`);
  assert(error.message.includes(messagePart), `${label} reports expected reason`);
  assert(snapshot(engine) === baseline, `${label} causes zero project mutation`);
}

async function main(): Promise<void> {
  const runRoot = join(process.cwd(), ".tmp", `tve-imp-004-${process.pid}-${Date.now()}`);
  const dataDir = join(runRoot, "data");
  mkdirSync(dataDir, { recursive: true });
  let passed = false;
  try {
    const engine = new EditorEngine(dataDir);
    const clip = engine.addAdjustmentClip({ startFrame: 0, durationFrames: 300 });
    const project = engine.getProject();
    const revision = project.revision;
    const baseline = snapshot(engine);

    const validPlan = {
      planId: "plan-valid-1",
      projectId: project.id,
      basedOnRevision: revision,
      scope: { startFrame: 0, endFrame: 300 },
      operations: [
        {
          id: "op-volume",
          rpcMethod: "set_clip_volume",
          params: { clipId: clip.id, volume: 0.7 },
          rationale: "lower the selected clip volume",
          affectedRangeEstimate: { startFrame: 0, endFrame: 300 },
          evidenceRefs: ["review:audio-1"],
        },
        {
          id: "op-move",
          rpcMethod: "move_clip",
          params: { clipId: clip.id, startFrame: 30, trackIndex: 0 },
          rationale: "move the clip within the reviewed range",
          evidenceRefs: [],
        },
      ],
      expectedEffects: ["volume adjusted", "clip shifted"],
      qaChecks: ["rendered frame review"],
      riskLevel: "medium",
    };

    console.log("1. valid dry-run is deterministic and non-mutating...");
    const dry1 = await dispatch(engine, "dry_run_edit_plan", validPlan) as any;
    const dry2 = await dispatch(engine, "dry_run_edit_plan", validPlan) as any;
    assert(JSON.stringify(dry1) === JSON.stringify(dry2), "identical plan produces deterministic dry-run output");
    assert(snapshot(engine) === baseline, "valid dry-run leaves project state/revision unchanged");
    assert(engine.getProject().revision === revision, "revision is unchanged after valid dry-run");
    assert(dry1.operationCount === 2, "dry-run reports both ordered operations");
    assert(dry1.prediction.clipIds.includes(clip.id), "prediction includes affected clip id");
    assert(dry1.prediction.trackIndexes.includes(0), "prediction includes affected track index");
    assert(dry1.prediction.ranges.some((r: any) => r.startFrame === 0 && r.endFrame === 300), "prediction includes reviewed frame range");

    console.log("2. stale revision fails closed...");
    await expectReject(engine, { ...validPlan, planId: "plan-stale", basedOnRevision: Math.max(0, revision - 1) }, "STALE_EDIT_PLAN", "stale revision", baseline);

    console.log("3. project mismatch fails closed...");
    await expectReject(engine, { ...validPlan, planId: "plan-project-mismatch", projectId: "wrong-project" }, "projectId mismatch", "project mismatch", baseline);

    console.log("4. unknown clip reference fails closed...");
    await expectReject(engine, {
      ...validPlan,
      planId: "plan-bad-clip",
      operations: [{ ...validPlan.operations[0], id: "op-bad-clip", params: { clipId: "missing-clip", volume: 0.5 } }],
    }, "Unknown clipId", "unknown clip", baseline);

    console.log("5. illegal clip-local range fails closed...");
    await expectReject(engine, {
      ...validPlan,
      planId: "plan-bad-range",
      operations: [{
        id: "op-bad-range",
        rpcMethod: "cut_range",
        params: { clipId: clip.id, startFrame: 50, endFrame: 400 },
        rationale: "invalid cut must not mutate",
        evidenceRefs: [],
      }],
    }, "outside clip", "invalid range", baseline);

    console.log("6. unsupported side-effecting method fails closed...");
    await expectReject(engine, {
      ...validPlan,
      planId: "plan-unsupported",
      operations: [{ id: "op-save", rpcMethod: "save", params: {}, rationale: "unsupported in v1", evidenceRefs: [] }],
    }, "not supported inside EditPlan v1", "unsupported method", baseline);

    console.log("7. existing RPC schema validation is reused before mutation...");
    await expectReject(engine, {
      ...validPlan,
      planId: "plan-invalid-rpc-params",
      operations: [{ ...validPlan.operations[0], id: "op-invalid-volume", params: { clipId: clip.id, volume: -1 } }],
    }, "Invalid params for EditPlan operation", "invalid RPC params", baseline);

    passed = true;
    console.log("TVE-IMP-004 EDIT PLAN DRY RUN SMOKE PASSED");
  } finally {
    if (passed) rmSync(runRoot, { recursive: true, force: true });
    else console.error(`Failure artifacts preserved under ${runRoot}`);
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.stack ?? err.message : String(err));
  process.exit(1);
});