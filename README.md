# Interview Prep — Notion-powered website(官方 API 版)

基于 Next.js + 官方 Notion API + react-notion-x,把 Notion 页面渲染成自定义蓝色风格网站。

## 为什么用官方 API

非官方 API(notion-client 直接爬 notion.site)会被 Notion 持续限流(429),无法稳定构建。
官方 API 有正式配额(~3 req/s)、Notion 官方支持,且可精确控制哪些页面可见。

## ⚠️ 必做:配置 Token(否则抓不到数据)

1. 确认你已创建 Notion Integration 并**连接到 `Interview Prep (Public)` 页面**
   (页面右上 ··· → Connections → 选你的 integration)
2. 复制 `.env.local.example` 为 `.env.local`
3. 把你的 Integration Token 填进去:
   ```
   NOTION_TOKEN=ntn_xxxxxxxxxxxxx
   ```

## 本地预览

```bash
npm install
npm run build      # 官方 API 限速,首次构建较慢属正常
npx serve out      # 预览生产版本
```

## 工作方式(全自动,和之前一致)

- 首页 = 根页面下所有子页面的卡片网格
- 任何有子页面的页面 → 自动卡片网格(递归,无限层级)
- 纯内容页 → 美化文档(白卡 + TOC,隐藏 banner)
- 卡片样式在 `lib/config.ts` 的 `cardStyles` 配置(可选)

## 部署到 Cloudflare Pages

1. 推 GitHub(注意:`.env.local` 已在 .gitignore,不会上传 token)
2. Cloudflare → Pages → 连接 repo
3. Build command: `npm run build`,Output: `out`
4. **关键**:在 Cloudflare 项目的 Settings → Environment variables 里
   添加 `NOTION_TOKEN` = 你的 token(构建时需要)
5. Custom domains → 绑 `prep.ldvyyc.com`

## 安全提醒

- `NOTION_TOKEN` 是密钥,绝不要提交到 git(已在 .gitignore)
- Cloudflare 上通过环境变量注入,不写进代码
