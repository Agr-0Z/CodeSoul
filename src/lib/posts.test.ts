import assert from "node:assert/strict";
import { getAllPosts, parsePostSource } from "./posts";

const published = getAllPosts({ includeDrafts: false });
const titles = published.map((post) => post.title);

assert.ok(titles.includes("为什么我把个人博客做成静态站点"));
assert.ok(titles.includes("一份找不到方的 PDF，和一个只服务自己的检索器"));
assert.equal(titles.length, 2);
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

console.log("posts.test.ts ok");
