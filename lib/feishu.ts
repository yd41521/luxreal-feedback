import type {
  Category,
  DeliveredStats,
  FeedbackItem,
  ListQuery,
  Status,
} from "./types";
import { PLAZA_STATUSES, PUBLIC_STATUSES } from "./types";

/**
 * 飞书多维表格 SDK 简易封装。
 * - 自动维护 tenant_access_token（内存级缓存，提前 5 分钟刷新）
 * - 提供 feedback_items / votes 两张表的 CRUD + 业务方法
 */

const FEISHU_BASE = "https://open.feishu.cn/open-apis";

interface TokenCache {
  token: string;
  expireAt: number; // ms epoch
}

let tokenCache: TokenCache | null = null;

function envOrThrow(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`缺少环境变量：${name}`);
  return v;
}

async function getTenantAccessToken(): Promise<string> {
  if (tokenCache && tokenCache.expireAt - 5 * 60_000 > Date.now()) {
    return tokenCache.token;
  }
  const res = await fetch(
    `${FEISHU_BASE}/auth/v3/tenant_access_token/internal`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        app_id: envOrThrow("FEISHU_APP_ID"),
        app_secret: envOrThrow("FEISHU_APP_SECRET"),
      }),
      cache: "no-store",
    }
  );
  const json = (await res.json()) as {
    code: number;
    msg: string;
    tenant_access_token?: string;
    expire?: number;
  };
  if (json.code !== 0 || !json.tenant_access_token) {
    throw new Error(`获取飞书 token 失败：${json.msg}`);
  }
  tokenCache = {
    token: json.tenant_access_token,
    expireAt: Date.now() + (json.expire ?? 7200) * 1000,
  };
  return tokenCache.token;
}

async function feishuFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const token = await getTenantAccessToken();
  const url = `${FEISHU_BASE}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.headers || {}),
    },
    cache: "no-store",
  });
  const json = (await res.json()) as {
    code: number;
    msg: string;
    data?: T;
  };
  if (json.code !== 0) {
    throw new Error(`飞书 API 错误 [${json.code}] ${json.msg} :: ${path}`);
  }
  return json.data as T;
}

// =========== feedback_items ===========

interface BitableRecord<F> {
  record_id: string;
  fields: F;
  created_time?: number;
  last_modified_time?: number;
}

interface ItemFields {
  title: string;
  content: string;
  category: Category;
  status: Status;
  visible: boolean;
  vote_count: number;
  submitter_name?: string;
  submitter_contact?: string;
  submitter_fingerprint?: string;
  submitter_ip?: string;
  /** 飞书日期字段返回 ms 时间戳（数字），未填时为 undefined / null。 */
  completed_at?: number | null;
}

const itemsTablePath = () =>
  `/bitable/v1/apps/${envOrThrow(
    "FEISHU_APP_TOKEN"
  )}/tables/${envOrThrow("FEISHU_TABLE_ITEMS")}/records`;

const votesTablePath = () =>
  `/bitable/v1/apps/${envOrThrow(
    "FEISHU_APP_TOKEN"
  )}/tables/${envOrThrow("FEISHU_TABLE_VOTES")}/records`;

const itemsFieldsPath = () =>
  `/bitable/v1/apps/${envOrThrow(
    "FEISHU_APP_TOKEN"
  )}/tables/${envOrThrow("FEISHU_TABLE_ITEMS")}/fields`;

/**
 * 飞书字段 type 编码：
 *   3  = 单选
 *   4  = 多选
 *   7  = 复选框
 *   2  = 数字
 *   1  = 多行文本
 */
let fieldTypeCache: Record<string, number> | null = null;

async function getItemFieldTypes(): Promise<Record<string, number>> {
  if (fieldTypeCache) return fieldTypeCache;
  const data = await feishuFetch<{
    items?: Array<{ field_name: string; type: number }>;
  }>(`${itemsFieldsPath()}?page_size=100`);
  const map: Record<string, number> = {};
  for (const f of data.items ?? []) map[f.field_name] = f.type;
  fieldTypeCache = map;
  return map;
}

/** 按字段类型把值规整成飞书可接受的格式：多选 → 数组；单选 → 字符串。 */
async function normalizeSelect(
  fieldName: string,
  value: string
): Promise<string | string[]> {
  const types = await getItemFieldTypes();
  const t = types[fieldName];
  if (t === 4) return [value];
  return value;
}

function recordToItem(r: BitableRecord<ItemFields>): FeedbackItem {
  const f = r.fields;
  const completedAtRaw = f.completed_at;
  const completedAt =
    typeof completedAtRaw === "number" && completedAtRaw > 0
      ? completedAtRaw
      : undefined;
  return {
    id: r.record_id,
    title: typeof f.title === "string" ? f.title : extractText(f.title),
    content:
      typeof f.content === "string" ? f.content : extractText(f.content),
    category: pickSelectValue(f.category) as Category,
    status: pickSelectValue(f.status) as Status,
    visible: f.visible !== false,
    voteCount: Number(f.vote_count ?? 0),
    submitterName: f.submitter_name
      ? typeof f.submitter_name === "string"
        ? f.submitter_name
        : extractText(f.submitter_name)
      : undefined,
    createdAt: r.created_time ?? 0,
    updatedAt: r.last_modified_time ?? 0,
    completedAt,
  };
}

/** 兼容飞书"单选"返回字符串、"多选"返回数组的两种格式。 */
function pickSelectValue(v: unknown): string {
  if (!v) return "";
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return String(v[0] ?? "");
  return String(v);
}

/** 飞书多行文本字段返回的是 `[{ text, type: "text" }]` 数组，做兼容。 */
function extractText(v: unknown): string {
  if (!v) return "";
  if (typeof v === "string") return v;
  if (Array.isArray(v)) {
    return v
      .map((seg: { text?: string }) => (seg && seg.text) || "")
      .join("");
  }
  return String(v);
}

export async function listItems(query: ListQuery): Promise<{
  items: FeedbackItem[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 20));

  // 飞书 search records 接口的 filter 操作符受限（无 isAnyOf）；
  // MVP 数据量不大，统一拉一页（最多 500 条），筛选/排序/分页在内存中完成，简单可靠。
  const all = await fetchAllItemsRaw();

  // 想法广场：不展示「已完成」（它们在 /delivered 成就墙单独陈列）
  let items = all.filter(
    (it) => it.visible && PLAZA_STATUSES.includes(it.status)
  );
  if (query.status) {
    items = items.filter((it) => it.status === query.status);
  }
  if (query.category) {
    items = items.filter((it) => it.category === query.category);
  }
  if (query.q) {
    const q = query.q.toLowerCase();
    items = items.filter(
      (it) =>
        it.title.toLowerCase().includes(q) ||
        it.content.toLowerCase().includes(q)
    );
  }

  if (query.sort === "latest") {
    items.sort((a, b) => b.createdAt - a.createdAt);
  } else {
    items.sort(
      (a, b) =>
        b.voteCount - a.voteCount || b.createdAt - a.createdAt
    );
  }

  const total = items.length;
  const offset = (page - 1) * pageSize;
  return {
    items: items.slice(offset, offset + pageSize),
    total,
    page,
    pageSize,
  };
}

/** 拉取主表全部记录（飞书每页最多 500，MVP 期一页够用；超过再做循环分页）。 */
async function fetchAllItemsRaw(): Promise<FeedbackItem[]> {
  const result: FeedbackItem[] = [];
  let pageToken: string | undefined;
  for (let i = 0; i < 10; i++) {
    const qs = new URLSearchParams({
      page_size: "500",
      automatic_fields: "true",
    });
    if (pageToken) qs.set("page_token", pageToken);
    const data = await feishuFetch<{
      items?: BitableRecord<ItemFields>[];
      page_token?: string;
      has_more?: boolean;
    }>(`${itemsTablePath()}?${qs.toString()}`);
    for (const r of data.items ?? []) result.push(recordToItem(r));
    if (!data.has_more || !data.page_token) break;
    pageToken = data.page_token;
  }
  return result;
}

export async function getItem(id: string): Promise<FeedbackItem | null> {
  try {
    const data = await feishuFetch<{
      record: BitableRecord<ItemFields>;
    }>(`${itemsTablePath()}/${id}`, { method: "GET" });
    const it = recordToItem(data.record);
    if (!it.visible || !PUBLIC_STATUSES.includes(it.status)) return null;
    return it;
  } catch {
    return null;
  }
}

/**
 * 已上线成就墙：返回 status=已完成 && visible=true 的项目。
 * 按 effective 时间 desc 排序：completed_at 为空时用 updated_at 兜底。
 * 这样运营改 status=已完成 而忘记填 completed_at 也能正常上墙。
 */
function effectiveDeliveredAt(it: FeedbackItem): number {
  return typeof it.completedAt === "number" && it.completedAt > 0
    ? it.completedAt
    : it.updatedAt || it.createdAt;
}

export async function listDeliveredItems(query: {
  page?: number;
  pageSize?: number;
}): Promise<{
  items: FeedbackItem[];
  total: number;
  page: number;
  pageSize: number;
  stats: DeliveredStats;
}> {
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 20));

  const all = await fetchAllItemsRaw();
  const delivered = all
    .filter((it) => it.visible && it.status === "已完成")
    .sort((a, b) => effectiveDeliveredAt(b) - effectiveDeliveredAt(a));

  const stats: DeliveredStats = {
    total: delivered.length,
    totalVotes: delivered.reduce((sum, it) => sum + (it.voteCount || 0), 0),
    lastDeliveredAt:
      delivered.length > 0 ? effectiveDeliveredAt(delivered[0]) : null,
  };

  const offset = (page - 1) * pageSize;
  return {
    items: delivered.slice(offset, offset + pageSize),
    total: delivered.length,
    page,
    pageSize,
    stats,
  };
}

/** 仅统计已交付想法数量与总票数，用于 Header 徽章等轻量场景。 */
export async function getDeliveredStats(): Promise<DeliveredStats> {
  const all = await fetchAllItemsRaw();
  const delivered = all.filter((it) => it.visible && it.status === "已完成");
  delivered.sort((a, b) => effectiveDeliveredAt(b) - effectiveDeliveredAt(a));
  return {
    total: delivered.length,
    totalVotes: delivered.reduce((sum, it) => sum + (it.voteCount || 0), 0),
    lastDeliveredAt:
      delivered.length > 0 ? effectiveDeliveredAt(delivered[0]) : null,
  };
}

export async function createItem(input: {
  title: string;
  content: string;
  category: Category;
  submitter_name?: string;
  submitter_contact?: string;
  submitter_fingerprint: string;
  submitter_ip: string;
}): Promise<{ id: string }> {
  const [categoryValue, statusValue] = await Promise.all([
    normalizeSelect("category", input.category),
    normalizeSelect("status", "待审核"),
  ]);
  const data = await feishuFetch<{
    record: BitableRecord<ItemFields>;
  }>(itemsTablePath(), {
    method: "POST",
    body: JSON.stringify({
      fields: {
        title: input.title,
        content: input.content,
        category: categoryValue,
        status: statusValue,
        visible: true,
        vote_count: 0,
        submitter_name: input.submitter_name || undefined,
        submitter_contact: input.submitter_contact || undefined,
        submitter_fingerprint: input.submitter_fingerprint,
        submitter_ip: input.submitter_ip,
      },
    }),
  });
  return { id: data.record.record_id };
}

async function updateItemFields(
  id: string,
  fields: Partial<ItemFields>
): Promise<void> {
  await feishuFetch<unknown>(`${itemsTablePath()}/${id}`, {
    method: "PUT",
    body: JSON.stringify({ fields }),
  });
}

// =========== votes ===========

interface VoteFields {
  item_id: string;
  voter_fingerprint: string;
  voter_ip: string;
}

export async function findVote(
  itemId: string,
  fingerprint: string
): Promise<{ recordId: string } | null> {
  const data = await feishuFetch<{
    items?: BitableRecord<VoteFields>[];
  }>(`${votesTablePath()}/search?page_size=1`, {
    method: "POST",
    body: JSON.stringify({
      filter: {
        conjunction: "and",
        conditions: [
          { field_name: "item_id", operator: "is", value: [itemId] },
          {
            field_name: "voter_fingerprint",
            operator: "is",
            value: [fingerprint],
          },
        ],
      },
      automatic_fields: false,
      field_names: ["item_id"],
    }),
  });
  const r = data.items?.[0];
  return r ? { recordId: r.record_id } : null;
}

/** 飞书 number 字段读出来可能是 string，强制转 number 防止字符串拼接。 */
function readVoteCount(rec: BitableRecord<ItemFields> | null): number {
  const raw = rec?.fields.vote_count;
  const n = Number(raw ?? 0);
  return Number.isFinite(n) ? n : 0;
}

export async function addVote(input: {
  itemId: string;
  fingerprint: string;
  ip: string;
}): Promise<{ voteCount: number }> {
  const exists = await findVote(input.itemId, input.fingerprint);
  if (exists) {
    const it = await getItemRaw(input.itemId);
    return { voteCount: readVoteCount(it) };
  }
  await feishuFetch<unknown>(votesTablePath(), {
    method: "POST",
    body: JSON.stringify({
      fields: {
        item_id: input.itemId,
        voter_fingerprint: input.fingerprint,
        voter_ip: input.ip,
      },
    }),
  });
  const it = await getItemRaw(input.itemId);
  const next = readVoteCount(it) + 1;
  await updateItemFields(input.itemId, { vote_count: next });
  return { voteCount: next };
}

export async function removeVote(input: {
  itemId: string;
  fingerprint: string;
}): Promise<{ voteCount: number }> {
  const exists = await findVote(input.itemId, input.fingerprint);
  if (!exists) {
    const it = await getItemRaw(input.itemId);
    return { voteCount: readVoteCount(it) };
  }
  await feishuFetch<unknown>(`${votesTablePath()}/${exists.recordId}`, {
    method: "DELETE",
  });
  const it = await getItemRaw(input.itemId);
  const next = Math.max(0, readVoteCount(it) - 1);
  await updateItemFields(input.itemId, { vote_count: next });
  return { voteCount: next };
}

async function getItemRaw(id: string) {
  try {
    const data = await feishuFetch<{
      record: BitableRecord<ItemFields>;
    }>(`${itemsTablePath()}/${id}`);
    return data.record;
  } catch {
    return null;
  }
}
