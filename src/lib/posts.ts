import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type PostLayout = "article" | "skills";

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  draft: boolean;
  layout: PostLayout;
};

export type Post = PostMeta & {
  content: string;
};

const postsDir = path.join(process.cwd(), "content/posts");

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

function slugFromFilename(filename: string): string {
  const base = filename.replace(/\.mdx$/, "");
  const dated = /^(\d{4}-\d{2}-\d{2})-(.+)$/.exec(base);
  return dated ? dated[2] : base;
}

export function parsePostSource(filename: string, raw: string): Post {
  const { data, content } = matter(raw);
  const missing = ["title", "date", "description", "tags"].filter((key) => data[key] == null);
  if (missing.length) {
    throw new Error(`${filename} 缺少 frontmatter：${missing.join(", ")}`);
  }
  if (!Array.isArray(data.tags) || data.tags.length === 0) {
    throw new Error(`${filename} 的 tags 必须是非空数组`);
  }
  const layout = parseLayout(data.layout, filename);
  const slug = typeof data.slug === "string" && data.slug ? data.slug : slugFromFilename(filename);
  return {
    slug,
    title: String(data.title),
    date: toIsoDate(data.date, filename),
    description: String(data.description),
    tags: data.tags.map(String),
    draft: Boolean(data.draft),
    layout,
    content,
  };
}

function parseLayout(value: unknown, filename: string): PostLayout {
  if (value == null || value === "article") return "article";
  if (value === "skills") return "skills";
  throw new Error(`${filename} 的 layout 必须是 article 或 skills：${String(value)}`);
}

function listMdxFiles(): string[] {
  if (!fs.existsSync(postsDir)) {
    throw new Error("找不到 content/posts");
  }
  return fs.readdirSync(postsDir).filter((name) => name.endsWith(".mdx"));
}

function parsePost(filename: string): Post {
  const raw = fs.readFileSync(path.join(postsDir, filename), "utf8");
  return parsePostSource(filename, raw);
}

export function getAllPosts(options?: { includeDrafts?: boolean }): PostMeta[] {
  const includeDrafts = options?.includeDrafts ?? process.env.NODE_ENV !== "production";
  return listMdxFiles()
    .map((file) => parsePost(file))
    .filter((post) => includeDrafts || !post.draft)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map((post) => ({
      slug: post.slug,
      title: post.title,
      date: post.date,
      description: post.description,
      tags: post.tags,
      draft: post.draft,
      layout: post.layout,
    }));
}

export function getPostBySlug(slug: string, options?: { includeDrafts?: boolean }): Post | null {
  const includeDrafts = options?.includeDrafts ?? process.env.NODE_ENV !== "production";
  const post = listMdxFiles()
    .map((file) => parsePost(file))
    .find((item) => item.slug === slug);
  if (!post) return null;
  if (post.draft && !includeDrafts) return null;
  return post;
}
