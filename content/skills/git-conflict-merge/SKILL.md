---
name: git-conflict-merge
title: 分支合并冲突处理
description: 分支合并与冲突解决工具。一次性询问源分支和目标分支，从目标分支切出conflict 临时分支，执行合并并自动解决可自动化的冲突。无法自动判断的冲突提示用户手动处理，全部解决后推送 conflict 分支，生成 GitLab MR 创建链接，最后回到原分支。优先自动处理，减少用户确认。
date: 2026-08-24
tags:
  - Git
  - GitLab
  - 工作流
---

# 分支合并冲突处理

从目标分支切出 conflict 分支，将源分支合并进来并解决冲突，优先自动解决，无法判断时才提示用户手动处理，最后推送。**推送完成后输出 GitLab MR 创建链接供用户点击，然后回到合并前的分支。**

## 交互规范（强制）

- **优先自动处理**：能AI 判断解决的冲突直接处理，不提前问用户
- **只在必要时询问**：仅当AI 无法判断业务意图时才提示用户手动解决
- **确认后再验证**：用户说「已解决」后才检查冲突是否真的清零
- **无冲突快速路径**：合并无冲突时直接生成 MR 链接，无需创建 conflict 分支
- 选择器仅用于**决策型**询问（如分支选择、方案确认），不用于冲突处理

## 执行流程

### 步骤 0：记录起始分支

流程开始时记录当前所在分支，供最后回退使用：

```bash
ORIGINAL_BRANCH=$(git rev-parse --abbrev-ref HEAD)
```

### 步骤 1：一次性收集分支信息

先收集候选分支用于生成选项：

```bash
git fetch --all --prune
git branch -a --sort=-committerdate --format='%(refname:short)' | head -20
git symbolic-ref refs/remotes/origin/HEAD --short 2>/dev/null
```

用**一次** `ask_user` 调用同时提出两个问题：

**问题 1：需要合并的分支（源分支）**

选项从最近3~4 个分支中生成，格式：`<分支名> [最后提交者/时间]`，最后一项为 `自定义输入`。

**问题 2：目标分支（base 分支）**

选项：默认主干、`develop`、其他常用分支，最后一项为 `自定义输入`。

校验两个分支在远端均存在；不存在则用选择器让用户重新选择。

### 步骤 2：生成 conflict 分支名

```bash
SRC_LAST="${SOURCE_BRANCH##⁠*⁠/}"
TS="$(date +%Y%m%d-%H%M)"
DEFAULT_CONFLICT_BRANCH="conflict/$${SRC_LAST}-$${TS}"
```

### 步骤 3：方案确认（选择器，含自定义分支名选项）

用`ask_user` 展示汇总信息并确认：

```
源分支：<source>
目标分支：<base>
conflict 分支：<default_conflict_branch>
操作：从<base> 切出 conflict 分支 → 合并 <source> → 解决冲突 → 推送
```

选项：
- `确认执行` — 使用默认生成的 conflict 分支名
- `自定义分支名` — 用户输入自定义 conflict 分支名称
- `重新选分支` — 回到步骤 1

若用户选择 `自定义分支名`，用`ask_user` 询问：

```
请输入自定义 conflict 分支名（例如：conflict/my-merge-20250611-1432）
```

等待用户输入后，记录为`CONFLICT_BRANCH`；若未输入或为空，使用默认值。

若用户选择 `确认执行`，使用 `DEFAULT_CONFLICT_BRANCH`。

未得到确认前不得修改仓库状态。

### 步骤 4：更新引用 + 检查工作区

```bash
git fetch --all --prune
git status --porcelain
```

若**有未提交变更**，用 `ask_user` 询问：

选项：
- `stash 后继续` — 记录 `DID_STASH=true`
- `直接继续` — 保留变更继续
- `中止操作` — 停止
- `自定义输入`

工作区干净时直接继续，无需询问。

### 步骤 5：临时创建分支并尝试合并（探测冲突）

```bash
git checkout -B "$CONFLICT_BRANCH" "origin/$BASE_BRANCH"
git merge --no-ff "origin/$SOURCE_BRANCH" 2>&1
MERGE_RESULT=$?
```

### 步骤 6：判断是否有冲突

```bash
git diff --name-only --diff-filter=U | wc -l
```

- **为 0（无冲突）** → 进入快速路径（步骤 7A）
- **大于 0（有冲突）** → 进入冲突解决（步骤 7B）

---

## 快速路径（无冲突）

### 步骤 7A：直接推送 + 生成 MR 链接

无冲突时无需创建 conflict 分支，直接使用合并结果推送。

**7A.1 推送分支**

```bash
git push -u origin "$CONFLICT_BRANCH"
```

**7A.2 生成 GitLab MR 创建链接**

```bash
REPO_URL=$(git remote get-url origin)

if [[ "$REPO_URL" == git@⁠* ]]; then
  HOST=$(echo "$REPO_URL" | cut -d: -f1 | sed 's/git@//')
  PROJECT_PATH=$(echo "$$REPO_URL" | cut -d: -f2 | sed 's/.git$$//')
else
  HOST=$(echo "$REPO_URL" | cut -d/ -f3)
fi

PROJECT_PATH_FULL=$(echo "$$REPO_URL" | sed -E 's|.⁠*⁠/(.+?)(.git)?/?$$|\1|')

GITLAB_HOST="https://${HOST}"
CONFLICT_BRANCH_URL_ENCODED=$(echo "$CONFLICT_BRANCH" | sed 's/\//%2F/g')
BASE_BRANCH_URL_ENCODED=$(echo "$BASE_BRANCH" | sed 's/\//%2F/g')

MR_CREATE_URL="$${GITLAB_HOST}/$${PROJECT_PATH_FULL}/-/merge_requests/new"
MR_CREATE_URL+="?merge_request%5Bsource_branch%5D=${CONFLICT_BRANCH_URL_ENCODED}"
MR_CREATE_URL+="&merge_request%5Btarget_branch%5D=${BASE_BRANCH_URL_ENCODED}"
```

**7A.3 输出总结与链接**

```
✅ 合并完成（无冲突）

分支：$${CONFLICT_BRANCH}（基于 $${BASE_BRANCH}）
已合并：${SOURCE_BRANCH}
冲突文件：0 个
已推送：origin/${CONFLICT_BRANCH}

📋 创建 Merge Request：
${MR_CREATE_URL}

点击上方链接可在GitLab 直接创建 MR。
```

若之前有stash，额外提示：

```
💾 本地改动已暂存，恢复方式：git stash pop
```

**7A.4 回到原分支**

```bash
git checkout "$ORIGINAL_BRANCH"
echo "✓ 已回到原分支：$ORIGINAL_BRANCH"
```

**流程结束。**

---

## 冲突处理路径（有冲突）

### 步骤 7B：自动解决冲突

**7B.1 列出冲突文件**

```bash
CONFLICT_FILES=($(git diff --name-only --diff-filter=U | sort))
TOTAL_CONFLICTS=${#CONFLICT_FILES[@]}
```

输出文本（非选择器）：

```
检测到 ${TOTAL_CONFLICTS} 个冲突文件，开始自动解决...
```

**7B.2 逐文件处理**

对每个冲突文件：

1. **读取完整内容** — `read_file`冲突部分
2. **分析双方意图** — 用 AI 判断改动含义
3. **应用解决策略** — 按下表优先级处理

| 优先级 | 冲突类型 | 处理方式 | AI 能否判断 |
|---|---|---|---|
| 1 | 锁文件（`package-lock.json` 等） | 取base 版本重生成 | ✅ 是 |
| 2 | 生成物（`dist/`、`.min.js`） | 取 base 版本或重新构建 | ✅ 是 |
| 3 | 双方新增互不相关内容（import、路由、配置项） | 合并两侧，去重排序 | ✅ 是 |
| 4 | CHANGELOG / i18n 列表 | 两侧条目合并倒序 | ✅ 是 |
| 5 | 仅格式/空白差异 | 采用有实质改动的一侧 | ✅ 是 |
| 6 | 同一文件但不同位置的改动 | 两侧都保留 | ✅ 是 |
| 7 | 同一行被双方修改为语义相同的结果 | 保留任一侧，删除冲突标记 | ✅ 是（通常） |
| 8 | 一方删除、另一方微调内容 | 遵循删除意图 | ✅ 是 |
| 9 | **同一函数/业务逻辑被双方以不同方式改动** | 手动解决 | ❌ 否 |
| 10 | **业务配置值冲突**（端口、API 地址、开关） | 手动解决 | ❌ 否 |
| 11 | **业务意图不明确**的改动 | 手动解决 | ❌ 否 |
| 12 |二进制文件冲突 | 手动解决 | ❌ 否 |

**7B.3 自动解决实现**

对每个文件自动判断和处理，记录解决结果。若能自动解决则`git add`；若无法判断则记录为需要手动处理。

**7B.4 检查是否全部自动解决**

```bash
git diff --name-only --diff-filter=U | wc -l
```

-为 0：所有冲突已自动解决，进入步骤 7B.5
- 大于 0：有需要手动处理的冲突，进入步骤 7B.6

**7B.5 全部自动解决 — 提交**

```bash
git add -A
git commit --no-edit
```

进入步骤 8（推送）。

**7B.6 需要手动处理 — 提示用户**

输出格式（纯文本，不是选择器）：

```
⚠ 以下 N 个冲突需要你手动处理（其余已自动解决）：

【文件】src/config/api.js (第 42-48 行)
  Base侧（<base>）:
    BASE_URL = 'https://api.prod.com'
  Source 侧（<source>）:
    BASE_URL = 'https://api.gateway.com'
  分析：双方指向不同的业务地址，无法自动判断。

【文件】src/service/order.ts (第 120-165 行)
  Base 侧（<base>）:
    [对calculatePrice 的改动]
  Source 侧（<source>）:
    [对 calculatePrice 的不同改动]
  分析：同一函数被双方以不同逻辑修改，需要业务判断。

建议处理方式：
1. 编辑上述文件，保留或调整内容至满意为止
2. 执行 git add <文件> 标记已解决（或用 git checkout --ours/--theirs <文件>）
3. 完成后回复「已解决」或「已完成手动解决」

未解决的冲突文件（可复制粘贴进终端）：
git checkout --ours src/config/api.js     # 用 base 版本
git checkout --theirs src/service/order.ts # 用 source 版本
git add src/config/api.js src/service/order.ts
```

然后用 `ask_user` 给出唯一选项：

选项：
- `已解决` — 用户完成手动处理

等待用户选择后，进入步骤 7B.7。

**7B.7 验证冲突已解决**

```bash
REMAINING=$(git diff --name-only --diff-filter=U)
if [ -z "$REMAINING" ]; then
  echo "✓ 所有冲突已解决"
  git add -A
  git commit --no-edit
else
  echo "⚠ 仍有未解决的冲突："
  echo "$REMAINING"
  # 回到7B.6，再次提示用户
fi
```

若仍有冲突，告知用户并回到7B.6 的手动处理提示。

### 步骤 8：推送 conflict 分支

```bash
git push -u origin "$CONFLICT_BRANCH"
```

### 步骤 9：生成 GitLab MR 创建链接

**9.1 获取必要信息**

```bash
REPO_URL=$(git remote get-url origin)

if [[ "$REPO_URL" == git@⁠* ]]; then
  HOST=$(echo "$REPO_URL" | cut -d: -f1 | sed 's/git@//')
  PROJECT_PATH=$(echo "$$REPO_URL" | cut -d: -f2 | sed 's/.git$$//')
else
  HOST=$(echo "$REPO_URL" | cut -d/ -f3)
fi

PROJECT_PATH_FULL=$(echo "$$REPO_URL" | sed -E 's|.⁠*⁠/(.+?)(.git)?/?$$|\1|')

GITLAB_HOST="https://${HOST}"
CONFLICT_BRANCH_URL_ENCODED=$(echo "$CONFLICT_BRANCH" | sed 's/\//%2F/g')
BASE_BRANCH_URL_ENCODED=$(echo "$BASE_BRANCH" | sed 's/\//%2F/g')

MR_CREATE_URL="$${GITLAB_HOST}/$${PROJECT_PATH_FULL}/-/merge_requests/new"
MR_CREATE_URL+="?merge_request%5Bsource_branch%5D=${CONFLICT_BRANCH_URL_ENCODED}"
MR_CREATE_URL+="&merge_request%5Btarget_branch%5D=${BASE_BRANCH_URL_ENCODED}"
```

**9.2 输出总结与链接**

```
✅ 合并完成

conflict 分支：$${CONFLICT_BRANCH}（基于 $${BASE_BRANCH}）
已合并：${SOURCE_BRANCH}
冲突文件：${TOTAL_CONFLICTS} 个
  - 自动解决：${AUTO_RESOLVED} 个
  - 手动解决：${MANUAL_RESOLVED} 个
已推送：origin/${CONFLICT_BRANCH}

📋 创建 Merge Request：
${MR_CREATE_URL}

点击上方链接可在GitLab 直接创建 MR。
```

若之前有 stash，额外提示：

```
💾 本地改动已暂存，恢复方式：git stash pop
```

### 步骤 10：回到合并前的分支

```bash
git checkout "$ORIGINAL_BRANCH"
echo "✓ 已回到原分支：$ORIGINAL_BRANCH"
```

---

# 使用示例

## 场景 1：无冲突合并（快速路径）

**用户输入：**
```
帮我合并 feature/ui-refactor 到 main
```

**Skill 执行流程：**

1. 用户选择分支 — `feature/ui-refactor` 和 `main`
2. 方案确认 — 用户选择 `确认执行`，使用默认 conflict 分支名`conflict/ui-refactor-20250611-1432`
3. 更新引用 — 工作区干净，直接继续
4. 尝试合并 — **无冲突**，跳过冲突解决流程

**直接输出：**

```
✅ 合并完成（无冲突）

分支：conflict/ui-refactor-20250611-1432（基于 main）
已合并：feature/ui-refactor
冲突文件：0 个
已推送：origin/conflict/ui-refactor-20250611-1432

📋 创建 Merge Request：
https://code.djicorp.com/fe/brandsite-reactor-ui/-/merge_requests/new?merge_request%5Bsource_branch%5D=conflict%2Fui-refactor-20250611-1432&merge_request%5Btarget_branch%5D=main

点击上方链接可在 GitLab 直接创建 MR。

✓ 已回到原分支：develop
流程完成！
```

**优势**：无冲突时30秒内完成，无需手动干预。

---

## 场景 2：有冲突，自定义分支名

**用户输入：**
```
合并 version/0.2.147 到 test，但我要自定义分支名
```

**Skill 执行流程：**

1. 用户选择分支 — `version/0.2.147-20260827-bjc` 和 `test`
2. 方案确认 — 用户选择 `自定义分支名`

```
请输入自定义 conflict 分支名（例如：conflict/my-merge-20250611-1432）

用户输入：conflict/v0.2.147-fix-20250611-1432
```

3. 生成的链接中会使用用户自定义的分支名

```
✅ 合并完成

conflict 分支：conflict/v0.2.147-fix-20250611-1432（基于 test）
已合并：version/0.2.147-20260827-bjc
冲突文件：3 个
  - 自动解决：3 个
  - 手动解决：0 个
已推送：origin/conflict/v0.2.147-fix-20250611-1432

📋 创建 Merge Request：
https://code.djicorp.com/fe/brandsite-reactor-ui/-/merge_requests/new?merge_request%5Bsource_branch%5D=conflict%2Fv0.2.147-fix-20250611-1432&merge_request%5Btarget_branch%5D=test
```

---

## 场景 3：有冲突，需手动处理

**用户输入：**
```
合并 feature/payment到 main
```

**Skill 执行流程：**

1-3. 同前面步骤
4. 尝试合并 — **检测到冲突**

```
检测到 5 个冲突文件，开始自动解决...

✓ src/api/constants.ts双方新增不同的 API 端点，已合并去重

✓ CHANGELOG.md
  两侧条目已合并倒序

⚠ 以下 2 个冲突需要你手动处理（其余已自动解决）：

【文件】src/service/payment.ts (第 120-165 行)
  Main侧：[支付流程 A逻辑]
  Feature 侧：
    [支付流程 B 逻辑]分析：同一函数被双方以不同逻辑修改，需要业务判断。

已解决？ [用户选择：已解决]
```

5. 用户手动编辑文件后选择「已解决」
6. Skill 验证冲突已清零，提交合并
7. 推送并返回 MR 链接

```
✅ 合并完成

conflict 分支：conflict/payment-20250611-1432（基于 main）
已合并：feature/payment
冲突文件：5 个
  - 自动解决：3 个
  - 手动解决：2 个
已推送：origin/conflict/payment-20250611-1432

📋 创建 Merge Request：
https://code.djicorp.com/fe/brandsite-reactor-ui/-/merge_requests/new?merge_request%5Bsource_branch%5D=conflict%2Fpayment-20250611-1432&merge_request%5Btarget_branch%5D=main

点击上方链接可在 GitLab 直接创建 MR。

✓ 已回到原分支：develop
流程完成！
```

---

## 快速参考

| 场景 | 分支名 | 冲突 | 用户介入 | 时间 |
|---|---|---|---|---|
| 快速合并 | 默认生成 | 无 | 0 次 | ~30 秒 |
| 快速合并 + 自定义名 | 用户输入 | 无 | 1 次 | ~1 分钟 |
| 有冲突全自动 | 默认或自定义 | 有，全自动解决 | 0 次 | ~2 分钟 |
| 有冲突需手动 | 默认或自定义 | 有，部分手动 | 1 次 | ~5 分钟 |
| 中止流程 | 任意 | 任意 | 立即中止 | ~10 秒 |

## 约束

- 优先自动处理，不要提前问「用哪个版本」
- 仅在**无法判断**的情况下才提示用户手动处理
- 冲突文件必须全部解决（`--diff-filter=U` 为空）才提交
- 中止流程时执行 `git merge --abort` 回到原分支
- 不使用 `-Xours/-X theirs` 全局策略
- 不向源分支或目标分支推送，仅推送 conflict 分支
- 减少选择器使用，优先文本输出+ 自动处理
- **无冲突时跳过 conflict 分支流程，直接推送并生成 MR 链接**
