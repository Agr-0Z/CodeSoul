import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type AgentSkillMeta = {
  slug: string;
  name: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  draft: boolean;
};

export type AgentSkill = AgentSkillMeta & {
  content: string;
  raw: string;
};

const skillsDir = path.join(process.cwd(), "content/skills");

function toIsoDate(value: unknown, filename: string): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const year = value.getUTCFullYear();
    const month = String(value.getUTCMonth() + 1).padStart(2, "0");
    const day = String(value.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  const raw = String(value).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    throw new Error(`${filename} 的 date 必须是 YYYY-MM-DD：${String(value)}`);
  }
  return raw;
}

export function parseAgentSkillSource(
  slug: string,
  raw: string,
  fallbackDate = "1970-01-01",
): AgentSkill {
  const filename = `${slug}/SKILL.md`;
  const { data, content } = matter(raw);
  const missing = ["name", "description"].filter((key) => data[key] == null);
  if (missing.length) {
    throw new Error(`${filename} 缺少 frontmatter：${missing.join(", ")}`);
  }
  const tags =
    Array.isArray(data.tags) && data.tags.length > 0 ? data.tags.map(String) : ["Cursor"];
  const name = String(data.name);
  const title = typeof data.title === "string" && data.title ? data.title : name;
  return {
    slug,
    name,
    title,
    description: String(data.description),
    date: data.date == null ? fallbackDate : toIsoDate(data.date, filename),
    tags,
    draft: Boolean(data.draft),
    content,
    raw,
  };
}

function fileFallbackDate(filePath: string): string {
  const mtime = fs.statSync(filePath).mtime;
  const year = mtime.getFullYear();
  const month = String(mtime.getMonth() + 1).padStart(2, "0");
  const day = String(mtime.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function listSkillDirs(): string[] {
  if (!fs.existsSync(skillsDir)) {
    throw new Error("找不到 content/skills");
  }
  return fs
    .readdirSync(skillsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((slug) => fs.existsSync(path.join(skillsDir, slug, "SKILL.md")));
}

function parseSkill(slug: string): AgentSkill {
  const filePath = path.join(skillsDir, slug, "SKILL.md");
  const raw = fs.readFileSync(filePath, "utf8");
  return parseAgentSkillSource(slug, raw, fileFallbackDate(filePath));
}

export function getAllAgentSkills(options?: { includeDrafts?: boolean }): AgentSkill[] {
  const includeDrafts = options?.includeDrafts ?? process.env.NODE_ENV !== "production";
  return listSkillDirs()
    .map((slug) => parseSkill(slug))
    .filter((skill) => includeDrafts || !skill.draft)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}
