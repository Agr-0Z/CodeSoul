export const SECTION_IDS = ["about", "skills", "blog", "projects", "contact"] as const;

export type SectionId = (typeof SECTION_IDS)[number];

export const NAV_LINKS: { id: SectionId; label: string }[] = [
  { id: "about", label: "关于" },
  { id: "skills", label: "技能" },
  { id: "blog", label: "博客" },
  { id: "projects", label: "项目" },
  { id: "contact", label: "联系" },
];

function sectionScrollTop(el: HTMLElement): number {
  const padding =
    Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
  return el.getBoundingClientRect().top + window.scrollY - padding;
}

export function scrollToSection(id: string, duration = 600): void {
  const el = document.getElementById(id);
  if (!el) return;
  const top = sectionScrollTop(el);
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || duration <= 0) {
    window.scrollTo(0, top);
    return;
  }
  const startY = window.scrollY;
  const delta = top - startY;
  const start = performance.now();
  const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (2 - 2 * t) ** 2 / 2);
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / duration);
    window.scrollTo(0, startY + delta * ease(t));
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
