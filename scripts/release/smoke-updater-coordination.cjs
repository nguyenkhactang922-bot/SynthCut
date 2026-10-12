"use strict";

const assert = require("node:assert/strict");
const { EventEmitter } = require("node:events");
const { createUpdateCoordinator } = require("../../apps/desktop/electron/update-coordinator.cjs");

function makeHarness(initialState) {
  const events = [];
  let coreState = { ...initialState };
  let forceQuit = false;
  const dialogs = [];
  const errors = [];
  const updater = {
    quitAndInstall(isSilent, isForceRunAfter) {
      events.push(`quitAndInstall:${isSilent}:${isForceRunAfter}`);
    },
  };
  const coordinator = createUpdateCoordinator({
    dialog: {
      showMessageBoxSync(_win, options) {
        dialogs.push(options);
        return 0;
      },
      showErrorBox(title, message) {
        errors.push({ title, message });
      },
    },
    getMainWindow: () => ({ id: "test-window" }),
    getCoreState: () => coreState,
    clearCoreState: () => {
      events.push("clearCoreState");
      coreState = { owned: false, child: null };
    },
    setForceQuit: (value) => {
      forceQuit = !!value;
      events.push(`forceQuit:${forceQuit}`);
    },
    log: (message) => events.push(`log:${message}`),
  });
  return { coordinator, updater, events, dialogs, errors, get forceQuit() { return forceQuit; }, get coreState() { return coreState; } };
}

async function testSharedCoreDefers() {
  const h = makeHarness({ owned: false, child: null });
  const result = await h.coordinator.installDownloadedUpdate(h.updater);
  assert.equal(result.installed, false);
  assert.equal(result.reason, "shared-core");
  assert.equal(h.forceQuit, false);
  assert.equal(h.dialogs.length, 1);
  assert.equal(h.errors.length, 0);
  assert.equal(h.events.some((e) => e.startsWith("quitAndInstall:")), false);
}

async function testOwnedCoreExitsBeforeInstaller() {
  const child = new EventEmitter();
  child.exitCode = null;
  child.signalCode = null;
  child.kill = () => {
    h.events.push("child.kill");
    setImmediate(() => {
      child.exitCode = 0;
      h.events.push("child.exit");
      child.emit("exit", 0, null);
    });
    return true;
  };
  const h = makeHarness({ owned: true, child });
  const result = await h.coordinator.installDownloadedUpdate(h.updater);
  assert.equal(result.installed, true);
  assert.equal(h.forceQuit, true);
  assert.equal(h.errors.length, 0);
  const kill = h.events.indexOf("child.kill");
  const exit = h.events.indexOf("child.exit");
  const clear = h.events.indexOf("clearCoreState");
  const force = h.events.indexOf("forceQuit:true");
  const install = h.events.indexOf("quitAndInstall:false:true");
  assert.ok(kill >= 0 && exit > kill && clear > exit && force > clear && install > force, h.events.join(" | "));
}

async function testAlreadyStoppedOwnedCoreIsSafe() {
  const child = new EventEmitter();
  child.exitCode = 0;
  child.signalCode = null;
  child.kill = () => { throw new Error("kill should not be called"); };
  const h = makeHarness({ owned: true, child });
  const result = await h.coordinator.installDownloadedUpdate(h.updater);
  assert.equal(result.installed, true);
  assert.equal(h.events.includes("clearCoreState"), true);
  assert.equal(h.events.includes("quitAndInstall:false:true"), true);
}

async function testTimeoutFailsClosed() {
  const child = new EventEmitter();
  child.exitCode = null;
  child.signalCode = null;
  child.kill = () => true;
  const h = makeHarness({ owned: true, child });
  await assert.rejects(
    h.coordinator.stopOwnedCoreForUpdate(15),
    /Timed out waiting for the editor core to stop before update install/,
  );
  assert.equal(h.forceQuit, false);
  assert.equal(h.events.some((e) => e.startsWith("quitAndInstall:")), false);
}

(async () => {
  await testSharedCoreDefers();
  await testOwnedCoreExitsBeforeInstaller();
  await testAlreadyStoppedOwnedCoreIsSafe();
  await testTimeoutFailsClosed();
  console.log("REL009_UPDATER_COORDINATION_SMOKE=PASS");
})().catch((err) => {
  console.error(err && err.stack ? err.stack : err);
  process.exit(1);
});
