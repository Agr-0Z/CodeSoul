import type { AgentSkill } from "@/lib/agentSkills";
import type { Post } from "@/lib/posts";
import { MDXRemote } from "next-mdx-remote/rsc";
import { SkillDownloadButton } from "./SkillDownloadButton";
import { SkillPanel } from "./SkillPanel";
import { SkillStack } from "./SkillStack";

export function SkillsCatalog({ post, skills }: { post: Post; skills: AgentSkill[] }) {
  const intro = post.content.trim();

  return (
    <>
      {intro ? (
        <article className="prose skill-intro">
          <MDXRemote source={post.content} />
        </article>
      ) : null}

      {skills.length === 0 ? (
        <article className="glass-card">
          <p className="codesoul-subtitle-md">还没有公开的 skill。</p>
        </article>
      ) : (
        <SkillStack>
          {skills.map((skill) => (
            <SkillPanel
              key={skill.slug}
              slug={skill.slug}
              title={skill.title}
              name={skill.name}
              description={skill.description}
              tags={skill.tags}
              download={<SkillDownloadButton filename={`${skill.slug}.md`} raw={skill.raw} />}
            >
              {skill.content.trim() ? (
                <div className="prose">
                  <MDXRemote source={skill.content} />
                </div>
              ) : null}
            </SkillPanel>
          ))}
        </SkillStack>
      )}
    </>
  );
}
