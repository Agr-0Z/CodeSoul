# CodeSoul 一期 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 按规格做出可静态导出的 Next.js 个人站：方案 D 磨砂玻璃、焰橙、深浅色，页面为关于 / 技能 / 博客 / 项目 / 联系。

**Architecture:** App Router 构建时读取 `content/posts` 与 `src/content/site.ts`，输出静态 HTML。`layout` 提供字体、防闪脚本、`lang="zh-CN"`。服务端 `Shell` 包色团底；客户端 `Nav` / `ThemeToggle` 负责当前页与深浅色。页面不直接读盘。MDX 用 `next-mdx-remote/rsc` 在构建时编译。

**Tech Stack:** Next.js App Router, TypeScript, next-mdx-remote, gray-matter, 全局 CSS, PostCSS custom-media。`output: 'export'`。部署 Vercel。本地预览静态目录，不要 `next start`。

## Global Constraints

- 视觉：规格第 7 节。布局 px，字号 rem/clamp。颜色 `--primary` / `--secondary` / `--text` / `--link` / `--on-primary`。标题绑 `h1–h6`，副标题用 `.codesoul-subtitle-*`。端点只写在 `src/styles/media.css`，样式用 `@media (--media-sm|lg|xl)`。焰橙 `#EB5C20`；卡片圆角 sm `8px`、lg+ `16px`；磨砂 blur 18px；色团静止，无薄荷。
- 顶栏仅：关于、技能、博客、项目、联系 + 深浅色。无 11 色盘、无搜索/归档/RSS/评论。
- 深浅色 localStorage 键 `codesoul-mode`。`html[data-mode]`。`lang="zh-CN"`。
- 标签只展示。草稿生产不可见：`getAllPosts` 与 `generateStaticParams` 在生产都不含 `draft: true`。
- 日期：`formatDate` 按 `YYYY-MM-DD` 拆字符串，禁止 `new Date("2026-08-12")`。展示 `2026年8月12日`。
- 字体：`next/font/google` 加载 Plus Jakarta Sans、JetBrains Mono，注入 `--codesoul-font-sans` / `--codesoul-font-mono`。
- 一期不做 sitemap、robots、RSS、搜索、标签页、评论、11 色盘。
- 不引入 Tailwind。不提交密钥。用户未要求则不 git commit。

**规格：** [docs/superpowers/specs/2026-08-18-codesoul-blog-design.md](../specs/2026-08-18-codesoul-blog-design.md)

---

### Task 1: Next.js 脚手架

**Files:**

- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `next-env.d.ts`, `eslint.config.mjs`, `.gitignore`, `postcss.config.mjs`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`

目录已有 `docs/`。在仓库根执行 `create-next-app` 时用 `.` 并允许非空；若向导失败则手写同等文件，不要另开子目录。

- [ ] 脚手架：src dir、App Router、TS、ESLint、无 Tailwind、无 `next start` 作为验收手段
- [ ] `next.config.ts`：

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
```

- [ ] 安装：`next-mdx-remote` `gray-matter` `postcss` `postcss-custom-media` `@csstools/postcss-global-data`；dev：`tsx`
- [ ] `package.json` 增加 `"test": "tsx src/lib/posts.test.ts"`
- [ ] `postcss.config.mjs`（Task 3 会指向 `media.css`，此处先建文件占位也可等 Task 3 一并写完）

---

### Task 2: 站点配置与文章库

**Files:**

- Create: `src/lib/formatDate.ts`
- Create: `src/lib/formatDate.test.ts`
- Create: `src/content/site.ts`
- Create: `src/lib/posts.ts`
- Create: `src/lib/posts.test.ts`
- Create: `content/posts/2026-08-12-static-blog.mdx`（含标题、列表、引用、代码块、链接）
- Create: `content/posts/2026-07-28-contrast.mdx`
- Create: `content/posts/_draft-hidden.mdx`（`draft: true`）

**Interfaces:**

- `formatDate(iso: string): string`
- `getAllPosts(options?: { includeDrafts?: boolean }): PostMeta[]`
- `getPostBySlug(slug: string, options?: { includeDrafts?: boolean }): Post | null`
- 生产默认 `includeDrafts: process.env.NODE_ENV !== "production"`

- [ ] **先写失败测试** `formatDate.test.ts`：`formatDate("2026-08-12") === "2026年8月12日"`
- [ ] 实现 `formatDate`：用 `/^(\d{4})-(\d{2})-(\d{2})/` 拆，不要 `new Date(iso)`
- [ ] 写 `posts.test.ts`：在 `includeDrafts: false` 下含两篇正式标题、不含「这篇不该出现在生产列表」；缺 frontmatter 的文件应 throw（可用临时夹具或注释说明对真实缺字段文件构建失败）
- [ ] 用 `NODE_ENV=production npx tsx src/lib/posts.test.ts` 验证生产过滤
- [ ] `site.ts` 导出 `name`、`description`、`about`、`stats`、`skills`（6）、`projects`（3）、`contact`

---

### Task 3: 全局样式与 Shell

**Files:**

- Create: `src/styles/media.css`
- Create: `src/styles/colors.css`
- Create: `src/styles/typography.css`
- Create: `src/styles/shell.css`
- Create: `src/styles/pages.css`
- Create: `src/styles/prose.css`
- Create: `src/styles/index.css`
- Modify: `src/app/globals.css`（只 `@import "../styles/index.css"`）
- Create: `src/components/ThemeToggle.tsx`（client）
- Create: `src/components/Nav.tsx`（client）
- Create: `src/components/Shell.tsx`（server：skip link、aurora、children）
- Modify: `src/app/layout.tsx`

- [ ] `media.css` 仅：

```css
@custom-media --media-sm (min-width: 640px);
@custom-media --media-lg (min-width: 1024px);
@custom-media --media-xl (min-width: 1280px);
```

其它 CSS 禁止裸 `min-width: 640px`。

- [ ] `postcss.config.mjs`：

```js
const config = {
  plugins: {
    "@csstools/postcss-global-data": {
      files: ["./src/styles/media.css"],
    },
    "postcss-custom-media": {},
  },
};
export default config;
```

- [ ] `colors.css`：浅/深 `--primary` `--secondary` `--text` `--link` `--on-primary` `#ffffff` 与 `--background` `--glass` `--pill` `--border` `--radius-card`
- [ ] `typography.css`：headline 变量绑 `h1–h6`（clamp/rem）；`.codesoul-subtitle-*`；`font-family: var(--codesoul-font-sans)`
- [ ] `layout.tsx`：`next/font/google` 设 `--codesoul-font-sans` / `--codesoul-font-mono`；`<html lang="zh-CN">`；`<head>` 内联防闪脚本读 `codesoul-mode`，无存储则 `prefers-color-scheme`；可见 focus；`prefers-reduced-motion` 在 CSS 中关掉过渡
- [ ] `Shell` 服务端 + `Nav`/`ThemeToggle` 客户端。顶栏顺序：Logo CodeSoul · 关于 · 技能 · 博客 · 项目 · 联系 · 深浅色。当前页 `aria-current="page"`。Toggle `aria-label`。无色盘。
- [ ] `pages.css`：`.about-grid` 默认 1 列，`@media (--media-lg)` 两列；技能/项目默认 1 列，`@media (--media-sm)` 两列
- [ ] `prose.css`：文章栏 65–75ch；列表、引用、代码、链接 `var(--link)`、图片、分隔线
- [ ] `index.css` 按序引入：colors → typography → shell → pages → prose（`media.css` 只给 PostCSS global-data，不必再 @import 以免重复输出）

---

### Task 4: 页面

**Files:**

- Modify: `src/app/page.tsx`（关于）
- Create: `src/app/skills/page.tsx`
- Create: `src/app/blog/page.tsx`
- Create: `src/app/blog/[slug]/page.tsx`
- Create: `src/app/projects/page.tsx`
- Create: `src/app/contact/page.tsx`
- Create: `src/app/not-found.tsx`

- [ ] 各页 `metadata` 的 `title` + `description`；文章用 frontmatter
- [ ] 各页包 `Shell`，数据来自 `site` / `posts`，不读文件系统
- [ ] `generateStaticParams` 调用 `getAllPosts({ includeDrafts: false })`
- [ ] 文章页：`getPostBySlug` 为 null 则 `notFound()`；正文 `MDXRemote` from `next-mdx-remote/rsc`
- [ ] `not-found.tsx`：一句话 + 回首页、去博客

---

### Task 5: 验收构建

- [ ] `NODE_ENV=production npx tsx src/lib/posts.test.ts`（及 formatDate 测试）通过
- [ ] `npm run build` 成功
- [ ] `out/` 含首页与五入口静态文件；含 `404.html`
- [ ] `out/` 不含草稿 slug 的 HTML
- [ ] 对照规格第 11 节：顶栏无多余入口、无换色盘、焰橙、磨砂。深浅色刷新保持靠防闪脚本（手动点一次即可记入验收，不强制 E2E）
- [ ] 不要用 `next start` 验收；需要预览时对 `out/` 起静态服务器
