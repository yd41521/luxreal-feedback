# 部署指南（Vercel / Cloudflare Pages）

推荐 **Vercel**：与 Next.js 同公司，原生支持 App Router、Route Handlers、ISR。

**认证说明**：用 Git 连接 Vercel 时，在浏览器里完成账号 / Git 托管授权即可，**不需要**把所谓「Vercel Key」写进仓库。只有在 **CI / 脚本非交互部署** 时，才需要在 Vercel 账号 **Settings → Tokens** 创建 **Personal Access Token**，以环境变量 `VERCEL_TOKEN` 使用（勿提交到 git）。

---

## 1. 推到 Git 远端（GitHub / GitLab 等）

在仓库根目录确认远端：

```bash
git remote -v
```

- **若已有 `origin`**：直接推送当前分支（以下为常见分支名，按实际替换）：
  ```bash
  git push -u origin master
  # 或
  git push -u origin main
  ```
- **若无任何 remote**：先在 GitHub / GitLab 新建**空仓库**，再执行（把 URL 换成你的）：
  ```bash
  git remote add origin https://github.com/<org>/<repo>.git
  # 或 SSH：git remote add origin git@github.com:<org>/<repo>.git
  git push -u origin master
  ```
  若托管平台默认分支为 `main`，可 `git branch -M main` 后再 `git push -u origin main`。

勿将 `.env.local` 推送到远端；密钥只在 Vercel 控制台配置。

---

## 2. 创建 Vercel 项目

1. 打开 [vercel.com/new](https://vercel.com/new)
2. **Import Git Repository** → 选你的仓库并完成 Git 授权（若首次使用 Vercel）
3. Framework Preset：**Next.js**（通常自动识别；本项目无 `vercel.json` 亦可构建）
4. **Environment Variables**：见下文 [§3. 环境变量清单](#3-环境变量清单)（至少在 **Production** 填齐飞书相关项）
5. **Deploy**

首次部署完成后会得到一个 `xxx.vercel.app` 域名。随后把 **Production** 的 `NEXT_PUBLIC_SITE_URL` 改成该 HTTPS 地址（或自定义域名），并 **Redeploy** 一次，避免站内链接仍指向 localhost。

---

## 3. 环境变量清单

在 Vercel：**Project → Settings → Environment Variables**。建议 **Production** 与 **Preview** 分别配置（Preview 见下方说明）。

| 变量 | 必填 | 说明 |
|------|------|------|
| `FEISHU_APP_ID` | 是 | 飞书企业自建应用 |
| `FEISHU_APP_SECRET` | 是 | 同上 |
| `FEISHU_APP_TOKEN` | 是 | 多维表格 app token |
| `FEISHU_TABLE_ITEMS` | 是 | 反馈条目表 ID |
| `FEISHU_TABLE_VOTES` | 是 | 投票表 ID |
| `UPSTASH_REDIS_REST_URL` | 否 | Upstash Redis（限频）；不配则用内存兜底 |
| `UPSTASH_REDIS_REST_TOKEN` | 否 | 同上 |
| `ALLOWED_ORIGINS` | 建议 | 逗号分隔的 **完整 Origin**（含协议），须与浏览器地址栏一致；见 [§6](#6-allowed_origins-与-preview-部署) |
| `NEXT_PUBLIC_SITE_NAME` | 否 | 默认 `LuxReal` |
| `NEXT_PUBLIC_SITE_URL` | 建议 | **线上公网 URL**（如 `https://xxx.vercel.app` 或自定义域），勿留 `http://localhost:3000` |

填写值时请对照 [.env.example](../.env.example) 与 [FEISHU_SETUP.md](./FEISHU_SETUP.md)。

---

## 4. 接入 Upstash Redis（限频，可选但推荐）

Vercel 已内置 Upstash 集成：

1. 项目 → **Storage** → **Create Database** → 选 **Upstash Redis (Serverless)**
2. 选最近区域（中国用户优先选 `Singapore`），点 **Create**
3. Vercel 会自动注入两个环境变量：`UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`
4. **Redeploy** 当前项目即生效

未配置时代码会自动 fallback 到进程内存限频（多函数实例下不准确，仅适合低流量）。

---

## 5. 绑定自定义域名

1. Vercel 项目 → **Settings → Domains** → **Add**
2. 输入 `feedback.luxreal.com`（或你想要的子域名）
3. Vercel 给出 DNS 记录（CNAME 指向 `cname.vercel-dns.com.`）
4. 到你的 DNS 服务商（阿里云/Cloudflare/腾讯云）添加这条 CNAME
5. 等待传播（通常 5–30 分钟），Vercel 会自动签发 HTTPS 证书

绑定后把 `NEXT_PUBLIC_SITE_URL` 与 `ALLOWED_ORIGINS` 中的生产地址一并更新为自定义域，并 **Redeploy**。

---

## 6. ALLOWED_ORIGINS 与 Preview 部署

应用使用 **精确匹配** Origin（见 [`lib/utils.ts`](../lib/utils.ts) 中 `isAllowedOrigin`）：`ALLOWED_ORIGINS` 为空时不校验来源（仅适合临时调试）；一旦配置，请求头 `Origin` 必须在列表中。

**Production** 建议配置示例：

```
ALLOWED_ORIGINS=https://feedback.luxreal.com,https://www.luxreal.com,https://你的项目.vercel.app
```

**Preview**（每次 PR 可能是不同 `*.vercel.app` 子域）：任选其一 —

- 在 **Preview** 环境单独把 `ALLOWED_ORIGINS` 设为当前预览完整 URL（部署后在浏览器地址栏复制，含 `https://`）；或
- 在 **Preview** 将 `ALLOWED_ORIGINS` 留空（若可覆盖 Production 继承），利用「未配置则不强制」便于内测（生产环境勿留空）。

改完后对对应环境 **Redeploy**。

---

## 7. 验证

部署完成后（可先用 `https://xxx.vercel.app`）：

- **首页**：列表与筛选、搜索正常；从首屏向下滚动后，底部居中「+」浮动按钮出现且可打开提交对话框。
- **已上线**：打开 `/delivered`，成就墙与统计正常（飞书中需有 `status=已完成` 且可见条目）。
- **提交**：提交一条测试想法 → 飞书多维表格出现 `status=待审核` 新行。
- **公开**：在飞书将 `status` 改为 `已通过` 等 → 约 30s 内列表可见（见缓存说明）。
- **投票**：点击投票 → 数字 +1，飞书投票表有对应记录。

若 API 返回与跨域相关错误，优先检查 `ALLOWED_ORIGINS` 是否包含当前访问的完整 Origin。

---

## 8. 切换到 Cloudflare Pages（备选）

如果你更想用 Cloudflare Pages：

```bash
npm i -D @cloudflare/next-on-pages
npx @cloudflare/next-on-pages
```

按 [Cloudflare 官方文档](https://developers.cloudflare.com/pages/framework-guides/nextjs/ssr/get-started/) 配置 build command：`npx @cloudflare/next-on-pages` 与 build output：`.vercel/output/static`。

注：Cloudflare Workers 的 fetch 行为与 Vercel 略有差异，飞书 API 可能需要把 `cache: "no-store"` 改成 `headers: { "cache-control": "no-store" }`。先用 Vercel 上线，需要再迁移。

---

## 9. 监控

- **流量**：Vercel Analytics（项目 → Analytics → Enable）
- **日志**：Vercel Logs（项目 → Logs，可看到 console.error）
- **错误告警**：可加 Sentry，篇幅外，按需扩展
