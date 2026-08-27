import type { Post } from "@/lib/posts";

export function LinksCatalog({ post }: { post: Post }) {
  const links = post.links ?? [];

  if (links.length === 0) {
    return (
      <article className="glass-card">
        <p className="codesoul-subtitle-md">还没有收录站点。</p>
      </article>
    );
  }

  return (
    <ul className="link-card-list">
      {links.map((link) => (
        <li key={`${link.category}-${link.url}`}>
          <a
            className="glass-card link-card"
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="link-card-body">
              <h4 className="link-card-name">{link.name}</h4>
              <p className="codesoul-subtitle-sm link-card-desc">{link.description}</p>
            </div>
          </a>
        </li>
      ))}
    </ul>
  );
}
