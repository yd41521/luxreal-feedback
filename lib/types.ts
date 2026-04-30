export type Category = "想法和建议" | "Bug 反馈" | "其他";

export type Status =
  | "待审核"
  | "已通过"
  | "计划中"
  | "开发中"
  | "已完成"
  | "已拒绝";

/**
 * 详情页可见的状态集合：包含「已完成」，确保已完成项目的直链 /items/[id] 不会 404。
 */
export const PUBLIC_STATUSES: Status[] = [
  "已通过",
  "计划中",
  "开发中",
  "已完成",
];

/**
 * 想法广场（首页）可见的状态集合：不含「已完成」。
 * 已完成的想法只出现在 /delivered 成就墙，避免和"还在路上"的内容混排。
 */
export const PLAZA_STATUSES: Status[] = [
  "已通过",
  "计划中",
  "开发中",
];

export const CATEGORIES: Category[] = ["想法和建议", "Bug 反馈", "其他"];

export interface FeedbackItem {
  id: string;
  title: string;
  content: string;
  category: Category;
  status: Status;
  visible: boolean;
  voteCount: number;
  submitterName?: string;
  createdAt: number;
  updatedAt: number;
  /** 完成时间（仅 status=已完成 且运营手动填了 completed_at 的项目才有）。ms 时间戳。 */
  completedAt?: number;
}

export interface DeliveredStats {
  total: number;
  totalVotes: number;
  /** 最近一次交付距今 ms。null 表示尚无任何交付。 */
  lastDeliveredAt: number | null;
}

export interface ListQuery {
  sort?: "trending" | "latest";
  category?: Category;
  status?: Status;
  q?: string;
  page?: number;
  pageSize?: number;
}

export interface ApiOk<T> {
  ok: true;
  data: T;
}
export interface ApiErr {
  ok: false;
  error: { code: string; message: string };
}
export type ApiResult<T> = ApiOk<T> | ApiErr;
