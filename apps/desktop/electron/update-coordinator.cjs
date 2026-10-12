"use strict";

function createUpdateCoordinator({
  dialog,
  getMainWindow,
  getCoreState,
  clearCoreState,
  setForceQuit,
  log = console.error,
}) {
  if (!dialog || typeof dialog.showMessageBoxSync !== "function" || typeof dialog.showErrorBox !== "function") {
    throw new Error("update coordinator requires Electron dialog methods");
  }
  if (typeof getCoreState !== "function" || typeof clearCoreState !== "function" || typeof setForceQuit !== "function") {
    throw new Error("update coordinator requires core/quit state callbacks");
  }

  function mainWindow() {
    return typeof getMainWindow === "function" ? getMainWindow() : null;
  }

  // The Windows updater spawns NSIS before Electron's normal quit sequence runs.
  // For asar=false packages, an owned core may still hold resources/app files at
  // that moment, so wait for the child process to exit before invoking NSIS.
  function stopOwnedCoreForUpdate(timeoutMs = 10000) {
    const state = getCoreState() || {};
    const child = state.child || null;

    if (!state.owned) return Promise.resolve({ stopped: false, reason: "shared-core" });
    if (!child || child.exitCode !== null || child.signalCode !== null) {
      clearCoreState();
      return Promise.resolve({ stopped: false, reason: "already-stopped" });
    }

    return new Promise((resolve, reject) => {
      let settled = false;
      const finish = (err) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        child.removeListener("exit", onExit);
        if (err) reject(err);
        else {
          clearCoreState();
          resolve({ stopped: true, reason: "owned-core-exited" });
        }
      };
      const onExit = () => finish(null);
      const timer = setTimeout(
        () => finish(new Error("Timed out waiting for the editor core to stop before update install")),
        timeoutMs,
      );

      child.once("exit", onExit);
      // Close the small race between the state check above and listener setup.
      if (child.exitCode !== null || child.signalCode !== null) {
        finish(null);
        return;
      }

      try {
        child.kill();
      } catch (err) {
        finish(err);
      }
    });
  }

  async function installDownloadedUpdate(autoUpdater) {
    const state = getCoreState() || {};
    if (!state.owned) {
      log("[aive] update install deferred: shared editor core is active");
      dialog.showMessageBoxSync(mainWindow(), {
        type: "info",
        buttons: ["OK"],
        defaultId: 0,
        noLink: true,
        title: "Update deferred",
        message: "The update is downloaded but cannot be installed while a shared editor session is active.",
        detail: "Close the AI/MCP session that is using the editor core, then reopen Tang AI Video Editor. The update will be offered again.",
      });
      return { installed: false, reason: "shared-core" };
    }

    try {
      await stopOwnedCoreForUpdate();
      setForceQuit(true);
      log("[aive] owned editor core stopped; starting update installer");
      autoUpdater.quitAndInstall(false, true);
      return { installed: true, reason: "owned-core-stopped" };
    } catch (err) {
      const message = err && err.message ? err.message : String(err);
      log(`[aive] update install blocked: ${message}`);
      dialog.showErrorBox(
        "Could not safely install the update",
        `${message}\n\nThe application was not replaced. Close Tang AI Video Editor and try again.`,
      );
      return { installed: false, reason: "core-stop-failed", error: message };
    }
  }

  return { stopOwnedCoreForUpdate, installDownloadedUpdate };
}

module.exports = { createUpdateCoordinator };
