# 部署指南（Vercel / Cloudflare Pages）

推荐 **Vercel**：与 Next.js 同公司，原生支持 App Router、Route Handlers、ISR。

---

## 1. 推到 GitHub

```bash
git init
git add .
git commit -m "init: luxreal feedback platform"
git branch -M main
git remote add origin git@github.com:<your-org>/luxreal-feedback.git
git push -u origin main
```

---

## 2. 创建 Vercel 项目

1. 打开 [vercel.com/new](https://vercel.com/new)
2. **Import Git Repository** → 选你的仓库
3. Framework Preset：**Next.js**（自动识别）
4. **Environment Variables**：把 `.env.example` 里的所有项加进去（值参考 `docs/FEISHU_SETUP.md`）
5. **Deploy**

首次部署完成后会得到一个 `xxx.vercel.app` 域名。

---

## 3. 接入 Upstash Redis（限频，可选但推荐）

Vercel 已内置 Upstash 集成：

1. 项目 → **Storage** → **Create Database** → 选 **Upstash Redis (Serverless)**
2. 选最近区域（中国用户优先选 `Singapore`），点 **Create**
3. Vercel 会自动注入两个环境变量：`UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`
4. **Redeploy** 当前项目即生效

未配置时代码会自动 fallback 到进程内存限频（多函数实例下不准确，仅适合低流量）。

---

## 4. 绑定自定义域名

1. Vercel 项目 → **Settings → Domains** → **Add**
2. 输入 `feedback.luxreal.com`（或你想要的子域名）
3. Vercel 给出 DNS 记录（CNAME 指向 `cname.vercel-dns.com.`）
4. 到你的 DNS 服务商（阿里云/Cloudflare/腾讯云）添加这条 CNAME
5. 等待传播（通常 5–30 分钟），Vercel 会自动签发 HTTPS 证书

---

## 5. ALLOWED_ORIGINS 收紧

部署后回到 Vercel 环境变量，把 `ALLOWED_ORIGINS` 改为你真实使用的域名：

```
ALLOWED_ORIGINS=https://feedback.luxreal.com,https://www.luxreal.com
```

`Redeploy` 让新值生效。

---

## 6. 验证

- 访问 `https://feedback.luxreal.com/` 能看到列表页
- 提交一条测试想法 → 飞书多维表格里能看到 `status=待审核` 的新行
- 在飞书把 `status` 改为 `已通过` → 30s 后前端列表里出现这条
- 投票按钮点击 → 数字 +1，飞书 `votes` 表里多一行

---

## 7. 切换到 Cloudflare Pages（备选）

如果你更想用 Cloudflare Pages：

```bash
npm i -D @cloudflare/next-on-pages
npx @cloudflare/next-on-pages
```

按 [Cloudflare 官方文档](https://developers.cloudflare.com/pages/framework-guides/nextjs/ssr/get-started/) 配置 build command：`npx @cloudflare/next-on-pages` 与 build output：`.vercel/output/static`。

注：Cloudflare Workers 的 fetch 行为与 Vercel 略有差异，飞书 API 可能需要把 `cache: "no-store"` 改成 `headers: { "cache-control": "no-store" }`。先用 Vercel 上线，需要再迁移。

---

## 8. 监控

- **流量**：Vercel Analytics（项目 → Analytics → Enable）
- **日志**：Vercel Logs（项目 → Logs，可看到 console.error）
- **错误告警**：可加 Sentry，篇幅外，按需扩展
