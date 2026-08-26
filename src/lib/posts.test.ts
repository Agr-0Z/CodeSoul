import assert from "node:assert/strict";
import { getAllPosts, parsePostSource } from "./posts";

const published = getAllPosts({ includeDrafts: false });
const titles = published.map((post) => post.title);

assert.ok(titles.includes("为什么我把个人博客做成静态站点"));
assert.ok(titles.includes("一份找不到方的 PDF，和一个只服务自己的检索器"));
assert.ok(titles.includes("我写的 Agent Skill"));
assert.ok(titles.includes("我常用的实用网站"));
assert.equal(titles.length, 4);
assert.equal(titles.includes("这篇不该出现在生产列表"), false);

const withDrafts = getAllPosts({ includeDrafts: true });
assert.ok(withDrafts.some((post) => post.draft));

assert.throws(() =>
  parsePostSource(
    "broken.mdx",
    `---
title: 缺字段
date: 2026-01-01
---
`,
  ),
);

const article = parsePostSource(
  "note.mdx",
  `---
title: 普通
date: 2026-01-01
description: 摘要
tags: [笔记]
---
`,
);
assert.equal(article.layout, "article");

const skills = parsePostSource(
  "agent-skills.mdx",
  `---
title: 我写的 Agent Skill
date: 2026-08-24
description: 摘要
tags: [Cursor]
layout: skills
---
`,
);
assert.equal(skills.layout, "skills");

const linksPost = parsePostSource(
  "useful-sites.mdx",
  `---
title: 我常用的实用网站
date: 2026-08-26
description: 摘要
tags: [资源]
layout: links
links:
  - name: Example
    url: https://example.com
    description: 示例站点
    category: 工具
---
`,
);
assert.equal(linksPost.layout, "links");
assert.equal(linksPost.links?.length, 1);
assert.equal(linksPost.links?.[0]?.name, "Example");

assert.throws(() =>
  parsePostSource(
    "links-empty.mdx",
    `---
title: 空链接
date: 2026-08-26
description: 摘要
tags: [资源]
layout: links
links: []
---
`,
  ),
);

console.log("posts.test.ts ok");
