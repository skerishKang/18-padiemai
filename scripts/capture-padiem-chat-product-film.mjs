import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const target = "https://chat.padiem.net/";
const outDir = resolve("capture-artifacts");
await mkdir(resolve(outDir, "raw"), { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  locale: "ko-KR",
  timezoneId: "Asia/Seoul",
  recordVideo: {
    dir: resolve(outDir, "raw"),
    size: { width: 1440, height: 900 },
  },
});

const page = await context.newPage();
const consoleErrors = [];
const pageErrors = [];
page.on("console", message => {
  if (message.type() === "error") consoleErrors.push(message.text());
});
page.on("pageerror", error => pageErrors.push(String(error?.message || error)));

const response = await page.goto(target, {
  waitUntil: "domcontentloaded",
  timeout: 45_000,
});
if (!response || response.status() >= 400) {
  throw new Error(`Public Padiem Chat failed to load: HTTP ${response?.status() ?? "NO_RESPONSE"}`);
}
await page.waitForLoadState("networkidle", { timeout: 20_000 }).catch(() => {});
await page.waitForTimeout(4_000);

if (new URL(page.url()).hostname !== "chat.padiem.net") {
  throw new Error(`Capture left the canonical public host: ${page.url()}`);
}
if (!(await page.title()).includes("Padiem Chat")) {
  throw new Error(`Unexpected public title: ${await page.title()}`);
}

const composer = page.locator("#messageInput");
const tier = page.locator(".model-pill");
const settings = page.locator("#settingsButton");
await composer.waitFor({ state: "visible", timeout: 20_000 });
await tier.waitFor({ state: "visible", timeout: 20_000 });
await settings.waitFor({ state: "visible", timeout: 20_000 });

const tierText = (await tier.innerText()).trim();
if (!/Padiem Plus/i.test(tierText)) {
  throw new Error(`Unexpected public tier presentation: ${tierText}`);
}

// Scene 1 — real public front door.
await page.waitForTimeout(3_500);

// Scene 2 — reveal the real tier chooser without selecting another tier.
await tier.click();
await page.waitForTimeout(3_500);
await page.keyboard.press("Escape");
await page.waitForTimeout(1_500);

// Scene 3 — open the real Settings surface without mutating theme/language.
await settings.click();
const settingsDialog = page.locator("#settingsDialog");
await settingsDialog.waitFor({ state: "visible", timeout: 10_000 });
await page.waitForTimeout(5_000);
const settingsClose = page.locator("#settingsCloseButton");
if (await settingsClose.isVisible()) await settingsClose.click();
else await page.keyboard.press("Escape");
await page.waitForTimeout(2_000);

// Scene 4 — demonstrate the real composer only; do not submit or call a model.
await composer.fill("실제 공개 화면에서 작성 중인 제품 데모입니다.");
await page.waitForTimeout(4_000);
await composer.fill("");
await page.waitForTimeout(3_000);

// Finish on the clean public product front door and capture the Album cover.
await page.screenshot({
  path: resolve(outDir, "padiem-chat-product-still-v1.png"),
  fullPage: false,
});

// Privacy guard: this is a fresh logged-out context. Fail if visible page text unexpectedly
// contains an email address, which would indicate account/private state leaked into capture.
const visibleText = await page.locator("body").innerText();
const visibleEmail = visibleText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
if (visibleEmail) {
  throw new Error(`Privacy guard found an unexpected visible email address: ${visibleEmail[0]}`);
}

const evidence = {
  target,
  finalUrl: page.url(),
  title: await page.title(),
  viewport: { width: 1440, height: 900 },
  tierText,
  composerVisible: await composer.isVisible(),
  settingsVisibleDuringCapture: true,
  promptSubmitted: false,
  loginPerformed: false,
  filePickerOpened: false,
  clawOpened: false,
  consoleErrors,
  pageErrors,
};
await writeFile(
  resolve(outDir, "capture-evidence.json"),
  JSON.stringify(evidence, null, 2) + "\n",
  "utf8",
);

const video = page.video();
await context.close();
if (!video) throw new Error("Playwright did not create a capture video.");
await video.saveAs(resolve(outDir, "padiem-chat-product-film-v1.webm"));
await browser.close();
