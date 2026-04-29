# 飞书多维表格 + 企业自建应用配置指南

> 这一步需要你（管理员）手动操作。完成后把 5 个值填到 `.env.local` 即可。

---

## 1. 创建多维表格

1. 打开 [feishu.cn](https://www.feishu.cn) 或飞书客户端
2. 进入 **多维表格** → **新建** → 选择空白模板，重命名为 `LuxReal 用户反馈`
3. 复制浏览器地址栏 URL，形如：
   ```
   https://xxxx.feishu.cn/base/AAA...BBB?table=tblXxx&view=vewYyy
   ```
   - 其中 `AAA...BBB` 部分就是 `app_token` → 这是 `FEISHU_APP_TOKEN`
   - `tblXxx` 是默认表的 `table_id`

---

## 2. 创建主表 `feedback_items`

将默认表重命名为 `feedback_items`，按下表创建字段（**字段名要与代码完全一致**）：

| 字段名 | 字段类型 | 备注 |
|--------|---------|------|
| `title` | 文本 | 必填，主字段 |
| `content` | 文本 | 多行 |
| `category` | 单选 | 选项：`想法和建议` / `Bug 反馈` / `其他` |
| `status` | 单选 | 选项：`待审核` / `已通过` / `计划中` / `开发中` / `已完成` / `已拒绝`；默认 `待审核` |
| `visible` | 复选框 | 默认勾选 |
| `vote_count` | 数字 | 整数，默认 0 |
| `submitter_name` | 文本 | |
| `submitter_contact` | 文本 | |
| `submitter_fingerprint` | 文本 | |
| `submitter_ip` | 文本 | |
| `completed_at` | 日期 | **运营手动填**：把 `status` 改为 `已完成` 时填上当天日期。空表示尚未上线，已上线成就墙不会展示 |
| `created_at` | 创建时间 | 自动 |
| `updated_at` | 最后更新时间 | 自动 |

> 状态选项颜色建议：待审核=灰，已通过=蓝，计划中=蓝紫，开发中=橙，已完成=绿，已拒绝=红。

记下这张表的 `table_id`（点表名右上角"复制 ID"或从 URL 取）→ `FEISHU_TABLE_ITEMS`。

---

## 3. 创建辅表 `votes`

新建一张表 `votes`，字段如下：

| 字段名 | 字段类型 |
|--------|---------|
| `item_id` | 文本（主字段） |
| `voter_fingerprint` | 文本 |
| `voter_ip` | 文本 |
| `created_at` | 创建时间 |

记下 `table_id` → `FEISHU_TABLE_VOTES`。

---

## 4. 创建企业自建应用

1. 打开 [飞书开放平台](https://open.feishu.cn/app)
2. 右上角 **创建企业自建应用**
3. 填写名称（如 `LuxReal 反馈平台`），上传图标，提交
4. 进入应用详情，记下 **App ID** 与 **App Secret**：
   - App ID → `FEISHU_APP_ID`
   - App Secret → `FEISHU_APP_SECRET`

---

## 5. 给应用授予多维表格权限

1. 应用详情页 → **权限管理** → 搜索"多维表格"
2. 勾选并申请以下权限：
   - `bitable:app` 查看、评论、编辑和管理多维表格
   - `bitable:app:readonly`（自动包含）
3. 在右上角点击 **创建版本并发布**（首次需走管理员审批；如是测试可先用 **应用可用范围** → "全员可用" 简化）

---

## 6. 把应用加为多维表格的协作者

这一步**很关键**，否则即便有权限，应用也访问不了你创建的那张多维表格。

1. 回到刚才的 `LuxReal 用户反馈` 多维表格
2. 右上角 **`···`** → **添加协作者**
3. 搜索你的应用名字（如 `LuxReal 反馈平台`），添加为 **可编辑** 协作者

---

## 7. 验证（可选）

复制下面这段命令到终端，替换三个值后执行，应能拿到 token：

```bash
curl -X POST https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal \
  -H "Content-Type: application/json" \
  -d '{"app_id":"<你的 App ID>","app_secret":"<你的 App Secret>"}'
```

成功响应类似：

```json
{ "code": 0, "msg": "ok", "tenant_access_token": "t-xxxxx", "expire": 7200 }
```

---

## 8. 把 5 个值填到 `.env.local`

回到本项目根目录，复制 `.env.example` 为 `.env.local`，填入：

```
FEISHU_APP_ID=cli_xxxxxxxxxxxxxxxx
FEISHU_APP_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FEISHU_APP_TOKEN=AAA...BBB
FEISHU_TABLE_ITEMS=tblXxxxxxxxxxxxx
FEISHU_TABLE_VOTES=tblYyyyyyyyyyyyy
```

---

## 9. 运营 SOP（审核日常）

打开多维表格后建议建 4 个视图：

- **待审核**：筛选 `status = 待审核`，运营每天处理
- **公开**：筛选 `status ∈ {已通过, 计划中, 开发中, 已完成} 且 visible = true`，与前端主列表一致
- **已上线**：筛选 `status = 已完成 且 completed_at 非空`，对应前端 `/delivered` 成就墙
- **已隐藏**：筛选 `visible = false`，看哪些被下架

日常操作：
- 通过想法 → 把 `status` 改为 `已通过`
- 不当内容 → 取消 `visible` 勾选（不删除，留痕）
- 排期 → 改 `status` 为 `计划中` / `开发中`
- **上线**（重要）→ 改 `status` 为 `已完成` 的同时，**手动把 `completed_at` 填上今天的日期**。两个动作缺一不可，否则成就墙看不到这条
