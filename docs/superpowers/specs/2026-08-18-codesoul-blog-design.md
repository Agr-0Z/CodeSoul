# CodeSoul 个人站一期规格

**日期：** 2026-08-18  
**状态：** 已确认，进入实现  
**视觉：** 以本文第 7 节 token 与第 5 节布局为准（磨砂玻璃方案 D，焰橙，静止色团）。

---

## 1. 目标

做程序员个人站 **CodeSoul**：关于页当首页，再加技能、博客、项目、联系。一期可长期用本地 Markdown 写作、Git 推到 Vercel 即发布。看起来对齐方案 D：磨砂玻璃、焰橙、可切深浅色。

成功标准：

- 打开站点即是关于页，顶栏五入口可到各页。
- 新增一篇 `content/posts` 里的 MDX、构建后出现在博客列表。
- `draft: true` 的文章生产构建不出现。
- 深浅色切换后刷新仍保持。
- 视觉与第 5、7 节一致：胶囊导航、关于页左欢迎卡 + 右 2×2 数据、磨砂卡片、焰橙链接。

---

## 2. 用户

- **作者：** 自己。用编辑器写 MDX，提交即发布。
- **读者：** 认识作者、看技能和项目、读文章。不注册、不评论。
- **搜索引擎：** 每页有 title / description；文章有独立 URL。一期不做 RSS / sitemap 也可上线，但 sitemap 与 robots 成本低，列入 P1。

一期不做多作者、账号、后台。

---

## 3. 范围

### 做

- 方案 D 布局与材料；焰橙主题；深浅色。
- 页面：关于 `/`、技能 `/skills`、博客 `/blog`、文章 `/blog/[slug]`、项目 `/projects`、联系 `/contact`、404。
- 文章：MDX、frontmatter、草稿过滤、列表按日期倒序。
- 标签：只在列表和详情上展示，不做 `/tags` 筛选页。
- 技能、项目、首页四格、联系文案：占位，集中放在一份站点配置里，方便以后改。

### 不做（一期）

- 11 色切换盘
- 搜索、按年归档、RSS
- 评论（含空位文案）
- CMS、数据库、登录
- 友链、说说、邮件订阅

---

## 4. 信息架构

```
/                 关于（首页）
/skills           技能
/blog             文章列表
/blog/[slug]      文章详情
/projects         项目
/contact          联系
任意未知路径      404
```

顶栏（顺序固定）：Logo CodeSoul · 关于 · 技能 · 博客 · 项目 · 联系 · 深浅色按钮。当前页 `aria-current="page"`。窄屏顶栏可换行，不改入口集合。

---

## 5. 页面行为

### 关于 `/`

对齐第 5 节关于页：

- 芯片「关于我」
- 主标题、副标题来自站点配置
- 左：欢迎卡（标题 + 两段占位介绍）
- 右：2×2 数据卡（占位：年经验 / 项目构建 / 行代码 / 技术栈）

### 技能 `/skills`

玻璃卡网格。每项：名称 + 一句说明。数据来自配置数组，一期 6 条占位即可。

### 博客 `/blog`

按 `date` 倒序。每条：日期、标题、摘要、标签（纯展示，不可点进筛选页）。点标题进详情。无分页（一期文章少）；若超过 20 篇再加分页，不在一期验收。

### 文章 `/blog/[slug]`

日期、标题、标签（展示）、MDX 正文。支持标题、列表、引用、行内代码、代码块、链接、图片、分隔线。一期不要目录、不要相关文章、不要评论区。未知 slug → 404。

### 项目 `/projects`

项目卡：名称 + 简述。配置数组，一期 3 条占位。

### 联系 `/contact`

一段说明 + 占位 GitHub / 邮箱。不做表单。

### 404

一句话 + 回首页、去博客。

---

## 6. 内容模型

### 文章 `content/posts/*.mdx`

| 字段          | 必填 | 说明                                                                             |
| ------------- | ---- | -------------------------------------------------------------------------------- |
| `title`       | 是   | 标题                                                                             |
| `date`        | 是   | ISO 日期，列表排序                                                               |
| `description` | 是   | 列表摘要与 SEO description                                                       |
| `tags`        | 是   | 字符串数组，至少一个；只展示                                                     |
| `draft`       | 否   | 默认 false；true 时生产不输出                                                    |
| `slug`        | 否   | 缺省为文件名去掉扩展名；若文件名是 `yyyy-mm-dd-slug.mdx`，则 slug 为日期后的一段 |

日期展示统一：`2026年8月12日`。

构建时读文件系统，不在运行时读盘（`output: 'export'` 无 Node 服务）。

### 站点配置 `src/content/site.ts`（或等价）

集中：站点名、关于文案、四格数据、技能列表、项目列表、联系占位。改占位不改页面结构。

一期附 2–3 篇示例文章（可沿用原型里的技术笔记标题），便于验收列表和详情。

---

## 7. 视觉与主题

脚手架阶段才创建 `src/styles/`（现在仓库里不要提前放这些文件）。不要引入 Tailwind，也不要再发明第三套圆角。

**单位：** 布局、圆角、模糊用 **px**；字号用 **rem**（根字号跟浏览器默认走，不要写死 `html { font-size: 16px }`）。组件与页面 CSS 不要写裸色值、不要直接写 `font-size`。

### 7.1 颜色

主题色在 `src/styles/colors.css` 里按深浅色赋值。命名用正确英文全称；对话里的示例拼写不作正式 token。`--primary` 是色块/品牌，`--link` 是可读链接，二者不要混用。

| 变量          | 用途               | 浅色      | 深色      |
| ------------- | ------------------ | --------- | --------- |
| `--primary`   | 强调 / 品牌焰橙    | `#EB5C20` | `#EB5C20` |
| `--secondary` | 次要字、说明、标签 | `#71717A` | `#A1A1AA` |
| `--text`      | 正文、标题默认字色 | `#1C1C1E` | `#F4F4F5` |
| `--link`      | 正文链接（对比度） | `#C44A12` | `#FF9A6A` |

浅色链接用 `var(--link)`，不要把 `--primary` 当浅色正文链。强调色块上的字用 `#FFFFFF`。

材料色（随深浅赋值，不是第四套主题色盘）同样写在 `colors.css`：

| 变量            | 浅色                            | 深色                     |
| --------------- | ------------------------------- | ------------------------ |
| `--background`  | `#EEF2F6`                       | `#0C0D12`                |
| `--glass`       | `rgba(255,255,255,0.62)`        | `rgba(22,24,32,0.55)`    |
| `--pill`        | `rgba(255,255,255,0.78)`        | `rgba(22,24,32,0.72)`    |
| `--border`      | `rgba(255,255,255,0.7)`         | `rgba(255,255,255,0.14)` |
| `--on-primary`  | `#FFFFFF`                       | 同                       |
| `--radius-card` | `8px`（`--media-lg` 起 `16px`） | 同                       |

深浅色：`html[data-mode]`，localStorage 键 `codesoul-mode`，值为 `light` | `dark`。无系统偏好也可先读 `prefers-color-scheme`，用户点过按钮后以存储为准。禁止生产环境出现 11 色圆点盘。

### 7.2 字号：流体标题 + 副标题类

`src/styles/typography.css` 定义变量。**h1–h6 绑元素选择器**（含文章内标题），MDX 不用给标题挂类。页标题用 `clamp()`，一般不必再为字号写 lg/xl 媒体查询。变量仍保留，以后可在同一选择器上加字重、字距。

| 变量                     | 选择器 | 值（根 16px 时约等于）                     |
| ------------------------ | ------ | ------------------------------------------ |
| `--codesoul-headline-h1` | `h1`   | `clamp(2rem, 4vw, 3rem)`（32–48px）        |
| `--codesoul-headline-h2` | `h2`   | `clamp(1.75rem, 3vw, 2.25rem)`（28–36px）  |
| `--codesoul-headline-h3` | `h3`   | `clamp(1.5rem, 2.5vw, 1.75rem)`（24–28px） |
| `--codesoul-headline-h4` | `h4`   | `clamp(1.25rem, 2vw, 1.375rem)`（20–22px） |
| `--codesoul-headline-h5` | `h5`   | `1.125rem`（18px）                         |
| `--codesoul-headline-h6` | `h6`   | `1rem`（16px）                             |

副标题、日期、标签不是标题标签，挂全局类：

| 变量                     | 全局类                  | 值                       |
| ------------------------ | ----------------------- | ------------------------ |
| `--codesoul-subtitle-lg` | `.codesoul-subtitle-lg` | `1.125rem`（页级副标题） |
| `--codesoul-subtitle-md` | `.codesoul-subtitle-md` | `1rem`（正文辅助）       |
| `--codesoul-subtitle-sm` | `.codesoul-subtitle-sm` | `0.875rem`（日期、说明） |
| `--codesoul-subtitle-xs` | `.codesoul-subtitle-xs` | `0.75rem`（标签、芯片）  |

标题默认 `color: var(--text)`；副标题类默认 `color: var(--secondary)`。字体：Plus Jakarta Sans。代码：JetBrains Mono。

### 7.3 响应式：`media.css` + `@media (--media-*)`

端点对齐 Tailwind 常用值，**跳过 md**。布局断点用 px。像素值**只出现**在脚手架时的 `src/styles/media.css`，其它样式禁止写 `min-width: 640px`。不要用 `media.ts`。

```css
@custom-media --media-sm (min-width: 640px);
@custom-media --media-lg (min-width: 1024px);
@custom-media --media-xl (min-width: 1280px);
```

构建用 `postcss-custom-media` + `@csstools/postcss-global-data`（全局读入 `media.css`），让各 CSS 文件都能写自定义媒体。栅格、分栏写在对应样式文件里：

```css
.about-grid {
  display: grid;
  grid-template-columns: 1fr;
}

@media (--media-lg) {
  .about-grid {
    grid-template-columns: 1fr 1fr;
  }
}
```

关于页左右分栏从 `--media-lg` 开始。

背景：静止丁香 / 焰橙浅染径向色团，**不流动**，不要薄荷。卡片 `backdrop-filter: blur(18px) saturate(140%)`。卡片圆角 `--radius-card`：窄屏 / `sm` 为 `8px`，`lg` 及以上为 `16px`。

---

## 8. 架构

**栈：** Next.js（App Router）+ TypeScript + MDX。脚手架后再建 `src/styles/`：入口 `index.css`（由 `src/app/globals.css` 引入），不引入 Tailwind。`next.config`：`output: 'export'`。MDX 用构建时读取 + `next-mdx-remote` 编译，不要运行时读盘。部署 Vercel。

**边界：**

- `src/content/site.ts`：站点占位数据。只被页面读取。
- `src/lib/posts.ts`：读文章、按日期排序、过滤草稿。只在构建时使用。
- `src/components/Shell.tsx`：色团底、胶囊导航、深浅色按钮。各页包一层。
- `src/app/**/page.tsx`：各路由。页面不直接读文件系统，走 `posts` / `site`。
- `src/styles/colors.css`：（脚手架时）`--primary` / `--secondary` / `--text` / `--link` 与材料色。
- `src/styles/typography.css`：（脚手架时）headline 变量绑 `h1–h6`；副标题 `.codesoul-subtitle-*`。
- `src/styles/media.css`：（脚手架时）唯一端点源，`@custom-media --media-sm|lg|xl`。
- `src/app/globals.css`：只 `@import` `src/styles/index.css`，可附色团等规则；断点写法一律 `@media (--media-lg)`。

数据流：MDX 文件 → 构建时 `posts.ts` → 列表/详情 props → 静态 HTML。深浅色只在客户端改 `data-mode`。

**错误：** 缺 frontmatter 的文章构建失败（不要静默跳过）。未知 slug 渲染 404 静态页。图片无 alt 的 MDX 在 lint 阶段警告，不挡构建。

**测试：** 构建必须成功；用示例文章断言列表含标题、草稿不出现。手动对照第 5、7 节：首页栅格、胶囊、磨砂、焰橙链接。

---

## 9. 非功能

- 文章正文栏仍限制可读宽度（约 65–75ch），卡片页可以更宽。
- 对比度：浅色链接用 `var(--link)`（`#C44A12`），不用 `--primary` 当正文链。
- 字号用 rem / clamp；不要写死根字号为 16px。
- 动效：仅按钮/链接 150–300ms；`prefers-reduced-motion` 关掉非必要过渡。
- SEO：每页 `title` + `description`；文章用 frontmatter。P1：`sitemap.xml`、`robots.txt`。
- 无障碍：跳过链接、可见 focus、深浅色按钮有 `aria-label`、当前导航可被读屏识别。

---

## 10. 二期（登记，不实现）

搜索、年归档、RSS、标签筛选页、Giscus、11 色盘、CMS、真实个人数据替换占位。

---

## 11. 验收清单

- [ ] 五页 + 文章详情 + 404，顶栏无多余入口
- [ ] 视觉对齐第 5、7 节，焰橙，无换色盘
- [ ] 深浅色刷新保持
- [ ] 示例文章可列出、可打开；草稿不可见
- [ ] `next build` 静态导出成功，可部署 Vercel
