"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useSkillStack } from "./SkillStack";

function navOffsetPx(): number {
  return (
    Number.parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--nav-offset"),
    ) || 72
  );
}

export function SkillPanel({
  slug,
  title,
  name,
  description,
  tags,
  download,
  children,
}: {
  slug: string;
  title: string;
  name: string;
  description: string;
  tags: string[];
  download: ReactNode;
  children?: ReactNode;
}) {
  const { openSlug, toggle } = useSkillStack();
  const open = openSlug === slug;
  const bodyId = `skill-body-${slug}`;
  const headRef = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    if (!open) {
      setStuck(false);
      return;
    }

    const head = headRef.current;
    if (!head) return;

    const update = () => {
      const top = head.getBoundingClientRect().top;
      setStuck(top <= navOffsetPx() + 1);
    };

    const frame = window.requestAnimationFrame(update);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [open]);

  return (
    <article
      id={`skill-${slug}`}
      className={open ? "glass-card skill-panel is-open" : "glass-card skill-panel"}
    >
      <div
        ref={headRef}
        className={stuck ? "skill-panel-head is-stuck" : "skill-panel-head"}
      >
        <h2>{title}</h2>
        <p className="skill-name codesoul-subtitle-sm">
          <code>{name}</code>
        </p>
        <div className="skill-panel-actions">{download}</div>
        <button
          type="button"
          className="skill-panel-trigger"
          aria-expanded={open}
          aria-controls={bodyId}
          aria-label={open ? `收起 ${title}` : `展开 ${title}`}
          onClick={() => toggle(slug)}
        />
      </div>
      <div className="skill-panel-summary stack">
        <p className="codesoul-subtitle-md">{description}</p>
        <ul className="tag-list">
          {tags.map((tag) => (
            <li key={tag} className="tag codesoul-subtitle-xs">
              {tag}
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="skill-panel-trigger"
          aria-expanded={open}
          aria-controls={bodyId}
          aria-label={open ? `收起 ${title}` : `展开 ${title}`}
          onClick={() => toggle(slug)}
        />
      </div>
      <div id={bodyId} className="skill-panel-body" role="region" aria-hidden={!open}>
        <div className="skill-panel-body-inner">{children}</div>
      </div>
    </article>
  );
}
