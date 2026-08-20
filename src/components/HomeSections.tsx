import Link from "next/link";
import { site } from "@/content/site";
import { formatDate } from "@/lib/formatDate";
import type { PostMeta } from "@/lib/posts";

export function HomeSections({ posts }: { posts: PostMeta[] }) {
  return (
    <>
      <section id="about" className="page-section">
        <header className="page-header page-header-center">
          <Link href="/resume" className="chip">
            {site.about.chip}
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
          </Link>
          <h1>{site.about.title}</h1>
          <p className="codesoul-subtitle-lg">{site.about.subtitle}</p>
        </header>
        <div className="about-grid">
          <article className="glass-card stack">
            <h2>{site.about.welcomeTitle}</h2>
            {site.about.welcome.map((paragraph) => (
              <p key={paragraph} className="codesoul-subtitle-md">
                {paragraph}
              </p>
            ))}
          </article>
          <div className="stats-grid">
            {site.stats.map((stat) => (
              <article key={stat.label} className="glass-card">
                <p className="stat-value">
                  <strong>{stat.value}</strong>
                </p>
                <p className="codesoul-subtitle-sm">{stat.label}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="skills" className="page-section">
        <header className="page-header">
          <h2>技能</h2>
          <p className="codesoul-subtitle-lg">按方向收拢，细节用技术栈表示。</p>
        </header>
        <div className="card-grid">
          {site.skills.map((skill) => (
            <article key={skill.name} className="glass-card stack">
              <h3>{skill.name}</h3>
              <ul className="tag-list">
                {skill.tags.map((tag) => (
                  <li key={tag} className="tag codesoul-subtitle-xs">
                    {tag}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section id="blog" className="page-section">
        <header className="page-header">
          <h2>博客</h2>
          <p className="codesoul-subtitle-lg">标签只展示，不做筛选页。</p>
        </header>
        <div className="post-list">
          {posts.map((post) => (
            <article key={post.slug} className="glass-card">
              <p className="codesoul-subtitle-sm">{formatDate(post.date)}</p>
              <h3>
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h3>
              <p className="codesoul-subtitle-md">{post.description}</p>
              <div className="post-tags">
                {post.tags.map((tag) => (
                  <span key={tag} className="tag codesoul-subtitle-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="projects" className="page-section">
        <header className="page-header">
          <h2>项目</h2>
          <p className="codesoul-subtitle-lg">做过的东西，右下角进仓库。</p>
        </header>
        <div className="card-grid project-grid">
          {site.projects.map((project) => (
            <article key={project.name} className="glass-card stack">
              <h3>{project.name}</h3>
              <p className="codesoul-subtitle-md">{project.summary}</p>
              <ul className="tag-list">
                {project.tags.map((tag) => (
                  <li key={tag} className="tag codesoul-subtitle-xs">
                    {tag}
                  </li>
                ))}
              </ul>
              <a className="project-repo" href={project.url} target="_blank" rel="noreferrer">
                <svg className="project-repo-icon" viewBox="0 0 16 16" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"
                  />
                </svg>
                <code className="codesoul-subtitle-xs">{project.url}</code>
              </a>
            </article>
          ))}
        </div>
      </section>

      <section id="contact" className="page-section">
        <header className="page-header">
          <h2>{site.contact.title}</h2>
          <p className="codesoul-subtitle-lg">{site.contact.subtitle}</p>
        </header>
        <article className="glass-card stack">
          {site.contact.body.map((paragraph) => (
            <p key={paragraph} className="codesoul-subtitle-md">
              {paragraph}
            </p>
          ))}
        </article>
      </section>
    </>
  );
}
