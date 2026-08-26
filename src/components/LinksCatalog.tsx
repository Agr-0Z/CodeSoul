import type { LinkItem, Post } from "@/lib/posts";
import { MDXRemote } from "next-mdx-remote/rsc";
import { LinkFavicon } from "./LinkFavicon";

function categorySlug(category: string): string {
  return category.trim().replace(/\s+/g, "-");
}

function groupByCategory(links: LinkItem[]): { category: string; slug: string; items: LinkItem[] }[] {
  const groups: { category: string; slug: string; items: LinkItem[] }[] = [];
  const indexByCategory = new Map<string, number>();

  for (const link of links) {
    const existing = indexByCategory.get(link.category);
    if (existing != null) {
      groups[existing].items.push(link);
      continue;
    }
    indexByCategory.set(link.category, groups.length);
    groups.push({
      category: link.category,
      slug: categorySlug(link.category),
      items: [link],
    });
  }

  return groups;
}

export function LinksCatalog({ post }: { post: Post }) {
  const intro = post.content.trim();
  const links = post.links ?? [];
  const groups = groupByCategory(links);

  return (
    <>
      {intro ? (
        <article className="prose skill-intro">
          <MDXRemote source={post.content} />
        </article>
      ) : null}

      {groups.length > 1 ? (
        <nav className="skill-index" aria-label="本页分类">
          <ul className="post-tags">
            {groups.map((group) => (
              <li key={group.slug}>
                <a href={`#link-${group.slug}`} className="tag codesoul-subtitle-xs">
                  {group.category}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      {links.length === 0 ? (
        <article className="glass-card">
          <p className="codesoul-subtitle-md">还没有收录站点。</p>
        </article>
      ) : (
        <div className="link-stack">
          {groups.map((group) => (
            <section key={group.slug} className="link-group">
              <h2 id={`link-${group.slug}`} className="link-group-title">
                {group.category}
              </h2>
              <ul className="link-card-list">
                {group.items.map((link) => (
                  <li key={`${link.category}-${link.url}`}>
                    <article className="glass-card link-card">
                      <div className="link-card-main">
                        <LinkFavicon url={link.url} name={link.name} />
                        <div className="link-card-body">
                          <h3 className="link-card-name">{link.name}</h3>
                          <p className="codesoul-subtitle-sm link-card-desc">{link.description}</p>
                        </div>
                      </div>
                      <a
                        className="chip link-open"
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        打开
                        <svg className="chip-arrow" viewBox="0 0 16 16" aria-hidden="true">
                          <path
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.75"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 3.5 11 8l-5 4.5"
                          />
                        </svg>
                      </a>
                    </article>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
