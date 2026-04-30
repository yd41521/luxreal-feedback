// 一次性 CDP 驱动脚本：启动 headless Chrome → 加载页面 → 滚动 600px → 截图。
// 用于验证 scroll-aware Header backing 切换。
import { spawn } from "node:child_process";
import { writeFileSync, rmSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const URL = process.argv[2] || "http://localhost:3001/";
const OUT = process.argv[3] || "verify-header-scrolled.png";
const SCROLL_Y = Number(process.argv[4] || 600);
// 可选：点击 selector（CSS 选择器）后再截图，用于验证 popover 等需要交互的视觉。
const CLICK_SELECTOR = process.argv[5] || "";
const PORT = 9333;

const userDataDir = mkdtempSync(join(tmpdir(), "cdp-shot-"));
const chrome = spawn(CHROME, [
  "--headless=new",
  "--disable-gpu",
  "--hide-scrollbars",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${userDataDir}`,
  "--window-size=1280,900",
  "about:blank",
], { stdio: ["ignore", "pipe", "pipe"] });

const cleanup = () => {
  try { chrome.kill(); } catch {}
  try { rmSync(userDataDir, { recursive: true, force: true }); } catch {}
};
process.on("exit", cleanup);

// Wait for CDP to come up
async function waitReady() {
  for (let i = 0; i < 50; i++) {
    try {
      const r = await fetch(`http://localhost:${PORT}/json/version`);
      if (r.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error("Chrome CDP not ready");
}

async function getTab() {
  const r = await fetch(`http://localhost:${PORT}/json`);
  const tabs = await r.json();
  const t = tabs.find((x) => x.type === "page");
  if (!t) throw new Error("no page tab");
  return t;
}

let msgId = 0;
function send(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++msgId;
    const onMsg = (ev) => {
      const m = JSON.parse(ev.data);
      if (m.id === id) {
        ws.removeEventListener("message", onMsg);
        if (m.error) reject(new Error(m.error.message));
        else resolve(m.result);
      }
    };
    ws.addEventListener("message", onMsg);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

function waitEvent(ws, name) {
  return new Promise((resolve) => {
    const onMsg = (ev) => {
      const m = JSON.parse(ev.data);
      if (m.method === name) {
        ws.removeEventListener("message", onMsg);
        resolve(m.params);
      }
    };
    ws.addEventListener("message", onMsg);
  });
}

(async () => {
  await waitReady();
  const tab = await getTab();
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener("open", r, { once: true }));

  await send(ws, "Page.enable");
  const loaded = waitEvent(ws, "Page.loadEventFired");
  await send(ws, "Page.navigate", { url: URL });
  await loaded;
  // Give React/SWR a generous tick to hydrate + fetch + paint hero image
  await new Promise((r) => setTimeout(r, 2500));
  await send(ws, "Runtime.evaluate", {
    expression: `window.scrollTo({top:${SCROLL_Y}, behavior:'auto'});`,
  });
  // Wait for color transition (200ms) + paint
  await new Promise((r) => setTimeout(r, 600));
  if (CLICK_SELECTOR) {
    await send(ws, "Runtime.evaluate", {
      expression: `document.querySelector(${JSON.stringify(CLICK_SELECTOR)})?.click();`,
    });
    // Wait for popover animate-in
    await new Promise((r) => setTimeout(r, 350));
    // 可选：HIGHLIGHT_INDEX 环境变量 → 模拟键盘 ArrowDown 高亮指定 item
    const hlIdx = Number(process.env.HIGHLIGHT_INDEX || 0);
    if (hlIdx > 0) {
      for (let i = 0; i < hlIdx; i++) {
        await send(ws, "Input.dispatchKeyEvent", {
          type: "rawKeyDown",
          key: "ArrowDown",
          code: "ArrowDown",
          windowsVirtualKeyCode: 40,
        });
        await send(ws, "Input.dispatchKeyEvent", {
          type: "keyUp",
          key: "ArrowDown",
          code: "ArrowDown",
          windowsVirtualKeyCode: 40,
        });
        await new Promise((r) => setTimeout(r, 50));
      }
      await new Promise((r) => setTimeout(r, 100));
    }
  }
  // Probe state for debug
  const probe = await send(ws, "Runtime.evaluate", {
    expression: `JSON.stringify({y: window.scrollY, bodyH: document.body.scrollHeight, heroAlt: document.querySelector('main img')?.alt || null, headerCls: document.querySelector('header')?.className || null})`,
  });
  console.log("probe:", probe.result?.value);
  const shot = await send(ws, "Page.captureScreenshot", {
    format: "png",
  });
  writeFileSync(OUT, Buffer.from(shot.data, "base64"));
  console.log(`saved ${OUT}`);
  ws.close();
  cleanup();
  process.exit(0);
})().catch((e) => {
  console.error(e);
  cleanup();
  process.exit(1);
});
