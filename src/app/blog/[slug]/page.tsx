import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Shell } from "@/components/Shell";
import { SkillsCatalog } from "@/components/SkillsCatalog";
import { getAllAgentSkills } from "@/lib/agentSkills";
import { formatDate } from "@/lib/formatDate";
import { getAllPosts, getPostBySlug } from "@/lib/posts";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return getAllPosts({ includeDrafts: false }).map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    return { title: "未找到文章" };
  }
  return {
    title: post.title,
    description: post.description,
  };
}

export default async function PostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <Shell>
      <header className="page-header">
        <p className="codesoul-subtitle-sm">{formatDate(post.date)}</p>
        <h1>{post.title}</h1>
        <div className="post-tags">
          {post.tags.map((tag) => (
            <span key={tag} className="tag codesoul-subtitle-xs">
              {tag}
            </span>
          ))}
        </div>
      </header>
      {post.layout === "skills" ? (
        <SkillsCatalog post={post} skills={getAllAgentSkills({ includeDrafts: false })} />
      ) : (
        <article className="prose">
          <MDXRemote source={post.content} />
        </article>
      )}
    </Shell>
  );
}
