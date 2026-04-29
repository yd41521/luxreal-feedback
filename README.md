# LuxReal · 反馈广场

> LuxReal 专业版的用户反馈征集平台。免登录、社区投票、官方在飞书后台一键审核。

## 技术栈

- **前端**：Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **后端**：Next.js Route Handlers（作为飞书 API 安全代理）
- **数据库**：飞书多维表格（Bitable）
- **限频**：Upstash Redis（可选）+ 进程内存兜底
- **指纹**：FingerprintJS（用于免登录幂等投票）

## 目录结构

```
.
├── app/                       Next.js App Router
│   ├── api/feedback/...       API Route Handlers（列表/详情/投票/已上线）
│   ├── api/stats/delivered/   已上线统计端点
│   ├── delivered/             已上线成就墙页面
│   ├── items/[id]/            详情页
│   ├── HomeClient.tsx         列表页（客户端组件）
│   ├── layout.tsx             根布局
│   └── page.tsx               列表页入口
├── components/                UI 组件
├── lib/
│   ├── feishu.ts              飞书多维表格 SDK 封装
│   ├── ratelimit.ts           限频
│   ├── fingerprint.ts         浏览器指纹（客户端）
│   ├── types.ts               TS 类型
│   └── utils.ts               通用工具
├── docs/
│   ├── PRD.md                 完整需求文档
│   ├── FEISHU_SETUP.md        飞书配置指南
│   ├── DEPLOYMENT.md          部署指南
│   └── EMBEDDING.md           主站嵌入方案
├── public/                    静态资源
└── .env.example               环境变量样板
```

## 本地开发

```bash
# 1. 安装依赖
npm install

# 2. 复制环境变量
cp .env.example .env.local
# 然后按 docs/FEISHU_SETUP.md 把 5 个飞书相关的值填进去

# 3. 启动开发服务器
npm run dev
```

打开 `http://localhost:3000` 即可看到列表页。

## 上线流程

1. 跟着 [docs/FEISHU_SETUP.md](docs/FEISHU_SETUP.md) 配好飞书多维表格与企业自建应用
2. 跟着 [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) 部署到 Vercel
3. 跟着 [docs/EMBEDDING.md](docs/EMBEDDING.md) 把入口接入主站

## 验收清单（参见 PRD §11）

- [ ] 免登录提交
- [ ] 同 IP 60s 内重复提交被拦截
- [ ] 飞书改 status 后前端 30s 内更新
- [ ] visible=false 立即隐藏
- [ ] 投票乐观更新 + 刷新保留
- [ ] 同指纹仅 1 票
- [ ] Trending / Latest 可切换
- [ ] 类别 / 状态 / 关键字过滤
- [ ] 360px 移动端适配
- [ ] iframe `?embed=1` 嵌入
