import assert from "node:assert/strict";
import { getAllAgentSkills, parseAgentSkillSource } from "./agentSkills";

const grilling = parseAgentSkillSource(
  "grilling",
  `---
name: grilling
description: Grill the user relentlessly about a plan.
date: 2026-08-24
tags:
  - Cursor
  - 工作流
---

Ask one question at a time.
`,
);

assert.equal(grilling.slug, "grilling");
assert.equal(grilling.name, "grilling");
assert.equal(grilling.title, "grilling");
assert.equal(grilling.description, "Grill the user relentlessly about a plan.");
assert.equal(grilling.date, "2026-08-24");
assert.deepEqual(grilling.tags, ["Cursor", "工作流"]);
assert.equal(grilling.draft, false);
assert.equal(grilling.content.trim(), "Ask one question at a time.");
assert.match(grilling.raw, /^---\nname: grilling/);

const titled = parseAgentSkillSource(
  "grilling",
  `---
name: grilling
title: 拷问式头脑风暴
description: Grill the user.
date: 2026-08-24
tags: [Cursor]
---

Body
`,
);
assert.equal(titled.title, "拷问式头脑风暴");

const cursorNative = parseAgentSkillSource(
  "grill-me",
  `---
name: grill-me
description: A relentless interview to sharpen a plan or design.
---

Run a grilling session.
`,
  "2026-08-24",
);
assert.equal(cursorNative.title, "grill-me");
assert.equal(cursorNative.date, "2026-08-24");
assert.deepEqual(cursorNative.tags, ["Cursor"]);

assert.throws(() =>
  parseAgentSkillSource(
    "broken",
    `---
name: broken
date: 2026-01-01
---
`,
  ),
);

const published = getAllAgentSkills({ includeDrafts: false });
const gitConflict = published.find((skill) => skill.slug === "git-conflict-merge");
assert.ok(gitConflict);
assert.equal(gitConflict.title, "分支合并冲突处理");
assert.equal(gitConflict.name, "git-conflict-merge");
assert.deepEqual(gitConflict.tags, ["Git", "GitLab", "工作流"]);

const grillMe = published.find((skill) => skill.slug === "grill-me");
assert.ok(grillMe);
assert.equal(grillMe.title, "拷问入口");
assert.ok(published.every((skill) => !skill.draft));

const drafted = parseAgentSkillSource(
  "hidden-skill",
  `---
name: hidden-skill
description: 草稿
date: 2026-01-01
tags: [Cursor]
draft: true
---

Draft body
`,
);
assert.equal(drafted.draft, true);

console.log("agentSkills.test.ts ok");
