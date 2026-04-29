export type Category = "想法和建议" | "Bug 反馈" | "其他";

export type Status =
  | "待审核"
  | "已通过"
  | "计划中"
  | "开发中"
  | "已完成"
  | "已拒绝";

export const PUBLIC_STATUSES: Status[] = [
  "已通过",
  "计划中",
  "开发中",
  "已完成",
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
