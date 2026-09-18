/**
 * Runtime resilience smoke check.
 *
 * Issue #56 acceptance: storage restrictions must not break navigation or language state,
 * hidden/non-active scenes must not perform per-frame work, and reduced motion must stay static.
 * `static/js/padiem-runtime-v1.js` is executed in a sandbox with the hostile environments it has
 * to survive:
 *
 *   1. private browsing      — `localStorage` throws on access
 *   2. blocked storage       — `localStorage` is missing entirely
 *   3. hidden tab            — `document.visibilityState === 'hidden'`
 *   4. off-screen element    — `IntersectionObserver` reports no intersection
 *   5. reduced motion        — `(prefers-reduced-motion: reduce)` matches
 *
 * Static sweeps then enforce that no runtime reaches around the adapter, that copy pairs are
 * complete, and that every per-frame loop is scheduled through the gated helper.
 *
 * Usage: node scripts/smoke-runtime-resilience.mjs
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";

const root = process.cwd();
const failures = [];
const check = (label, condition, detail) => {
  if (!condition) failures.push(`${label}: ${detail}`);
};

const read = relativePath => {
  const absolute = join(root, relativePath);
  if (!existsSync(absolute)) {
    failures.push(`missing file: ${relativePath}`);
    return "";
  }
  return readFileSync(absolute, "utf8");
};

const runtimePath = "static/js/padiem-runtime-v1.js";
const runtimeSource = read(runtimePath);

/** Build a sandbox window/document pair for one hostile environment. */
const createEnvironment = ({ storage = "ok", reducedMotion = false, hidden = false } = {}) => {
  const state = {
    frames: 0,
    cancelled: 0,
    listeners: new Map(),
    intersectionCallback: null,
    observed: [],
  };

  const backing = new Map();
  const store = {
    getItem: key => (backing.has(key) ? backing.get(key) : null),
    setItem: (key, value) => backing.set(key, String(value)),
    removeItem: key => backing.delete(key),
  };
  if (storage === "throwing") {
    store.getItem = () => {
      throw new DOMException("access denied");
    };
    store.setItem = () => {
      throw new DOMException("access denied");
    };
    store.removeItem = () => {
      throw new DOMException("access denied");
    };
  }

  const mediaQuery = {
    matches: reducedMotion,
    addEventListener() {},
    removeEventListener() {},
  };

  const documentStub = {
    visibilityState: hidden ? "hidden" : "visible",
    addEventListener: (type, handler) => {
      state.listeners.set(type, handler);
    },
    removeEventListener: type => {
      state.listeners.delete(type);
    },
  };

  const windowStub = {
    requestAnimationFrame: handler => {
      state.frames += 1;
      state.pendingFrame = handler;
      return state.frames;
    },
    cancelAnimationFrame: () => {
      state.cancelled += 1;
    },
    matchMedia: () => mediaQuery,
  };
  if (storage !== "missing") windowStub.localStorage = store;

  const sandbox = {
    window: windowStub,
    document: documentStub,
    DOMException,
    console,
  };
  sandbox.globalThis = sandbox;

  const drain = (limit = 6) => {
    for (let index = 0; index < limit; index += 1) {
      const pending = state.pendingFrame;
      state.pendingFrame = null;
      if (!pending) break;
      pending(0);
    }
  };

  return { sandbox, state, drain, windowStub, documentStub };
};

const loadRuntime = env => {
  vm.runInNewContext(runtimeSource, env.sandbox);
  return env.sandbox.window.PADIEM_RUNTIME;
};

// 1 — private browsing: storage access throws, the adapter must still work.
{
  const env = createEnvironment({ storage: "throwing" });
  const runtime = loadRuntime(env);
  check("private mode", runtime && runtime.storage, "PADIEM_RUNTIME.storage was not published");
  if (runtime) {
    check("private mode", runtime.storage.available === false, "available must be false when storage throws");
    let threw = null;
    try {
      runtime.storage.write("padiem-language", "en");
      if (runtime.storage.read("padiem-language") !== "en") threw = "in-memory value was not returned";
    } catch (error) {
      threw = `access threw (${error && error.name})`;
    }
    check("private mode", !threw, threw || "unknown failure");
    check("private mode", env.sandbox.window.PADIEM_STORAGE === runtime.storage, "PADIEM_STORAGE alias is missing");
  }
}

// 2 — storage API missing entirely.
{
  const env = createEnvironment({ storage: "missing" });
  const runtime = loadRuntime(env);
  let failure = null;
  try {
    runtime.storage.write("padiem-font-choice", "serif");
    if (runtime.storage.read("padiem-font-choice") !== "serif") failure = "session value was not returned";
  } catch (error) {
    failure = `access threw (${error && error.name})`;
  }
  check("missing storage", !failure, failure || "unknown failure");
}

// 3 — working storage keeps persisting values.
{
  const env = createEnvironment({});
  const runtime = loadRuntime(env);
  runtime.storage.write("padiem-language", "ko");
  check("persistent storage", runtime.storage.available === true, "available must be true when storage works");
  check("persistent storage", runtime.storage.read("padiem-language") === "ko", "stored value was not read back");
}

// 4 — a visible, on-screen loop runs; it must stop when the tab is hidden.
{
  const env = createEnvironment({});
  const runtime = loadRuntime(env);
  let steps = 0;
  runtime.frameLoop(null, () => { steps += 1; });
  env.drain();
  check("visible loop", steps > 0, "an on-screen loop did not advance");
  const before = steps;
  env.sandbox.document.visibilityState = "hidden";
  env.state.listeners.get("visibilitychange")?.();
  env.drain();
  check("hidden tab", steps === before, "a hidden tab still performed per-frame work");
}

// 5 — a tab that starts hidden stays idle until it becomes visible.
{
  const env = createEnvironment({ hidden: true });
  const runtime = loadRuntime(env);
  let steps = 0;
  runtime.frameLoop(null, () => { steps += 1; });
  env.drain();
  check("hidden start", steps === 0, "a hidden tab performed per-frame work before becoming visible");
  env.sandbox.document.visibilityState = "visible";
  env.state.listeners.get("visibilitychange")?.();
  env.drain();
  check("hidden start", steps > 0, "the loop did not resume after the tab became visible");
}

// 6 — an off-screen element must not drive frames.
{
  const env = createEnvironment({});
  env.windowStub.IntersectionObserver = class {
    constructor(callback) {
      env.state.intersectionCallback = callback;
    }
    observe(element) {
      env.state.observed.push(element);
    }
    disconnect() {
      env.state.observed = [];
    }
  };
  const runtime = loadRuntime(env);
  let steps = 0;
  runtime.frameLoop({ id: "wall" }, () => { steps += 1; });
  env.drain();
  check("off-screen scene", steps === 0, "an element outside the viewport performed per-frame work");
  check("off-screen scene", env.state.observed.length === 1, "the element was not observed");
  env.state.intersectionCallback([{ isIntersecting: true }]);
  env.drain();
  check("off-screen scene", steps > 0, "the loop did not start once the element entered the viewport");
  const whileVisible = steps;
  env.state.intersectionCallback([{ isIntersecting: false }]);
  env.drain();
  check("off-screen scene", steps === whileVisible, "the loop kept running after the element left the viewport");
}

// 7 — reduced motion never schedules a frame, even on-screen and visible.
{
  const env = createEnvironment({ reducedMotion: true });
  const runtime = loadRuntime(env);
  let steps = 0;
  const controller = runtime.frameLoop(null, () => { steps += 1; });
  env.drain();
  check("reduced motion", steps === 0, "per-frame work ran under prefers-reduced-motion");
  check("reduced motion", controller.isRunning() === false, "the loop reported itself as running");
  controller.stop();
}

// 8 — static sweeps: no runtime reaches around the adapter, every loop is gated.
{
  const runtimeFiles = readdirSync(join(root, "static/js"))
    .filter(name => name.startsWith("padiem-") && name.endsWith(".js"))
    .map(name => `static/js/${name}`);

  for (const file of runtimeFiles) {
    const source = read(file);
    if (file === runtimePath) continue;
    if (/\blocalStorage\b/.test(source)) {
      failures.push(`static sweep: ${file} touches localStorage directly instead of PADIEM_RUNTIME.storage`);
    }
    if (source.includes("requestAnimationFrame(") && !source.includes("frameLoop")) {
      failures.push(`static sweep: ${file} schedules animation frames without the gated frameLoop helper`);
    }
  }

  const copySources = [...runtimeFiles, "static/html/index1.html", "static/html/pages/design.html", "static/html/pages/products.html"];
  for (const file of copySources) {
    const source = read(file);
    const ko = [...source.matchAll(/data-copy-ko=/g)].length;
    const en = [...source.matchAll(/data-copy-en=/g)].length;
    if (ko !== en) failures.push(`static sweep: ${file} has ${ko} ko / ${en} en copy attributes`);
    if (/data-copy-html/.test(source)) {
      const html = [...source.matchAll(/data-copy-html/g)].length;
      if (html < ko) failures.push(`static sweep: ${file} marks ${html} of ${ko} copy pairs as html`);
    }
  }

  const consumers = [
    "padiem-cinematic-v2-1.js",
    "padiem-cinematic-v2-2.js",
    "padiem-cinematic-worlds-v1.js",
    "padiem-scroll-scrub-v1.js",
    "padiem-live-exhibits-v1.js",
    "padiem-product-exhibits-v1.js",
    "padiem-exhibit-config-v1.js",
  ];

  for (const page of ["public/index.html", "public/design/index.html", "public/products/index.html"]) {
    if (!existsSync(join(root, page))) continue;
    const built = read(page);
    const runtimeAt = built.indexOf("padiem-runtime-v1.js");
    if (runtimeAt < 0) {
      failures.push(`static sweep: ${page} does not load the shared runtime`);
      continue;
    }
    for (const consumer of consumers) {
      const consumerAt = built.indexOf(consumer);
      if (consumerAt >= 0 && consumerAt < runtimeAt) {
        failures.push(`static sweep: ${page} loads ${consumer} before the shared runtime`);
      }
    }
  }
}

if (failures.length) {
  console.error("Runtime resilience smoke check failed:");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log(
  "Runtime resilience smoke check passed: private mode, missing storage, hidden tab, off-screen scene and reduced motion all gated.",
);
