/**
 * 向 feedback_items 批量写入演示数据（标题/正文/分类/状态/票数）。
 * 读取仓库根目录 .env.local，不修改仓库其它代码。
 *
 * 用法（在项目根目录）：
 *   node scripts/seed-luxreal-demo.mjs
 *
 * 可选：先 dry-run 只看将写入条数
 *   node scripts/seed-luxreal-demo.mjs --dry-run
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const FEISHU_BASE = "https://open.feishu.cn/open-apis";
const dryRun = process.argv.includes("--dry-run");

function loadEnvLocal() {
  const path = resolve(ROOT, ".env.local");
  let raw;
  try {
    raw = readFileSync(path, "utf8");
  } catch (e) {
    throw new Error(`无法读取 ${path}：${e.message}`);
  }
  if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const s = line.trim();
    if (!s || s.startsWith("#")) continue;
    const eq = s.indexOf("=");
    if (eq <= 0) continue;
    const key = s.slice(0, eq).trim();
    let v = s.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))
      v = v.slice(1, -1);
    env[key] = v;
  }
  return env;
}

const env = loadEnvLocal();
function need(k) {
  const v = env[k];
  if (!v) throw new Error(`缺少 .env.local 中的 ${k}`);
  return v;
}

let tokenCache = { token: "", expireAt: 0 };

async function getToken() {
  if (tokenCache.expireAt - 5 * 60_000 > Date.now()) return tokenCache.token;
  const res = await fetch(`${FEISHU_BASE}/auth/v3/tenant_access_token/internal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      app_id: need("FEISHU_APP_ID"),
      app_secret: need("FEISHU_APP_SECRET"),
    }),
  });
  const json = await res.json();
  if (json.code !== 0 || !json.tenant_access_token) {
    throw new Error(`获取 token 失败: ${json.msg}`);
  }
  tokenCache = {
    token: json.tenant_access_token,
    expireAt: Date.now() + (json.expire ?? 7200) * 1000,
  };
  return tokenCache.token;
}

async function feishu(path, init = {}) {
  const token = await getToken();
  const res = await fetch(`${FEISHU_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.headers || {}),
    },
  });
  const json = await res.json();
  if (json.code !== 0) {
    throw new Error(`飞书 API [${json.code}] ${json.msg} :: ${path}`);
  }
  return json.data;
}

const appToken = need("FEISHU_APP_TOKEN");
const tableItems = need("FEISHU_TABLE_ITEMS");
const itemsPath = `/bitable/v1/apps/${appToken}/tables/${tableItems}/records`;
const fieldsPath = `/bitable/v1/apps/${appToken}/tables/${tableItems}/fields`;

let fieldTypeCache = null;
async function getFieldTypes() {
  if (fieldTypeCache) return fieldTypeCache;
  const data = await feishu(`${fieldsPath}?page_size=100`);
  const map = {};
  for (const f of data.items ?? []) map[f.field_name] = f.type;
  fieldTypeCache = map;
  return map;
}

async function normalizeSelect(fieldName, value) {
  const types = await getFieldTypes();
  const t = types[fieldName];
  if (t === 4) return [value];
  return value;
}

/** 从内部规划/LuxReal 工单抽象成「用户口吻」的 16 条 */
const ROWS = [
  {
    title: "希望产品更像「专业工作流」而不是抽签工具",
    content:
      "核心是确定性和可预期：界面和动线再强化「取代抽卡师」的心智——每一步知道会得到什么、失败怎么重试，而不是碰运气。",
    category: "想法和建议",
    status: "已通过",
    votes: 3,
  },
  {
    title: "资产库：模型选择与提示词模版（最好能自定义）",
    content:
      "自由度要对齐 tapnow/libtv：需要风格反推、扩写/润色模版、批量生成时的模型选择（例如 MJ 一次四张）。优先级可以按你们内部分 P0/P1。",
    category: "想法和建议",
    status: "已通过",
    votes: 3,
  },
  {
    title: "Beat 详情里支持提示词模版 + 自定义",
    content: "写 beat 时经常有固定套路，希望能套模版又能自己改，减少重复劳动。",
    category: "想法和建议",
    status: "开发中",
    votes: 2,
  },
  {
    title: "规划视频任务的提示词模版，也能自定义",
    content: "从规划到成片链路里，规划这一步希望有模版；复杂场景再支持手动规划。",
    category: "想法和建议",
    status: "计划中",
    votes: 2,
  },
  {
    title: "加结构化检测节点，跑完一眼知道哪一步有问题",
    content: "长链路里希望有关键节点的检测/校验，卡住时能定位，而不是只剩「一直在转」。",
    category: "想法和建议",
    status: "已通过",
    votes: 2,
  },
  {
    title: "Shot 润色支持模版 + 自定义",
    content: "分镜/镜头文案润色希望有团队统一模版，也允许个人保存常用片段。",
    category: "想法和建议",
    status: "计划中",
    votes: 1,
  },
  {
    title: "参考 tapnow/libtv：截帧、扩图、擦除等编辑能力",
    content:
      "短期可以只做最常用的几项；截帧优先，后面再扩图、擦除。希望交互别比竞品难用。",
    category: "想法和建议",
    status: "计划中",
    votes: 1,
  },
  {
    title: "排队失败时要有清晰反馈，并支持自动/手动重试",
    content:
      "经常遇到生成失败或进度卡死，希望错误信息可读，并能一键重试或自动排队重跑，别让我猜是不是网坏了。",
    category: "Bug 反馈",
    status: "已通过",
    votes: 3,
  },
  {
    title: "分镜生成卡在 99% 且无法删除任务",
    content:
      "复现：某任务长时间停在 99%，列表里又删不掉，只能干等。希望至少能取消/删除并重试。task 示例：OTZC6FAUVQOTULUFX73XNBI8。",
    category: "Bug 反馈",
    status: "开发中",
    votes: 2,
  },
  {
    title: "写分镜提示词时输入框频繁失焦，打字被打断",
    content:
      "国内环境复现：在分镜里输入提示词，刚打几个字焦点就跳走，要重新点回去，非常影响效率。",
    category: "Bug 反馈",
    status: "已通过",
    votes: 3,
  },
  {
    title: "智能分镜/智能镜头失败时能看到具体失败原因",
    content:
      "叙事单元里智能分镜失败，只知道失败了，不知道超时、模型拒答还是参数问题。希望错误信息可追踪（可附带 projectId）。",
    category: "Bug 反馈",
    status: "计划中",
    votes: 1,
  },
  {
    title: "智能镜头弹窗：切换模式几次后提示词模版错乱",
    content:
      "多宫格/视频帧切换两三次后，模板内容和当前模式对不上（显示串了）。环境：国内。",
    category: "Bug 反馈",
    status: "开发中",
    votes: 2,
  },
  {
    title: "8s 镜头重新编辑，面板仍显示 4s",
    content: "选择 8 秒镜头进入编辑，参数区时长仍显示 4s，容易误导导出参数。",
    category: "Bug 反馈",
    status: "计划中",
    votes: 0,
  },
  {
    title: "长剧本拆分希望更智能、少人工断句",
    content: "篇幅一上来就累，希望系统自动按节拍/场景拆，人工只做校对。",
    category: "想法和建议",
    status: "已通过",
    votes: 3,
  },
  {
    title: "音色控制与多人物台词更稳定",
    content: "提示词里自动带音色、或多人物时音色别串，需要可先内部测一轮再给上线节奏。",
    category: "想法和建议",
    status: "开发中",
    votes: 1,
  },
  {
    title: "定价与付费卡点要早定，别等功能全了再改",
    content:
      "订阅还是按次、heroshot 是否防下载/扣费，希望有明确策略，避免后期大改伤害老用户。",
    category: "想法和建议",
    status: "计划中",
    votes: 0,
  },
];

async function createOne(row) {
  const [cat, st] = await Promise.all([
    normalizeSelect("category", row.category),
    normalizeSelect("status", row.status),
  ]);
  const fields = {
    title: row.title,
    content: row.content,
    category: cat,
    status: st,
    visible: true,
    vote_count: row.votes,
    submitter_name: "演示用户",
    submitter_fingerprint: `seed-demo-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    submitter_ip: "127.0.0.1",
  };
  if (dryRun) {
    console.log("[dry-run]", row.title.slice(0, 40), "|", row.votes, "票");
    return;
  }
  await feishu(itemsPath, {
    method: "POST",
    body: JSON.stringify({ fields }),
  });
  console.log("已写入:", row.title.slice(0, 48), "|", row.votes, "票");
}

async function main() {
  console.log(`准备写入 ${ROWS.length} 条（分类/状态已按广场可见配置）…`);
  if (dryRun) console.log("（dry-run 不会调用飞书）\n");
  await getFieldTypes();
  for (const row of ROWS) {
    await createOne(row);
    if (!dryRun) await new Promise((r) => setTimeout(r, 120));
  }
  console.log(dryRun ? "\n结束 dry-run。" : "\n全部完成。刷新反馈广场即可看到（可能需稍等缓存）。");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
