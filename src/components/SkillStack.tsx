"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type SkillStackValue = {
  openSlug: string | null;
  toggle: (slug: string) => void;
};

const SkillStackContext = createContext<SkillStackValue | null>(null);

function slugFromHash(hash: string): string | null {
  const match = /^#skill-(.+)$/.exec(hash);
  return match ? decodeURIComponent(match[1]) : null;
}

export function SkillStack({ children }: { children: ReactNode }) {
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  const toggle = useCallback((slug: string) => {
    setOpenSlug((current) => (current === slug ? null : slug));
  }, []);

  useEffect(() => {
    function applyHash() {
      const fromHash = slugFromHash(window.location.hash);
      if (fromHash) setOpenSlug(fromHash);
    }

    function onClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a[href^='#skill-']");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href) return;
      const fromHash = slugFromHash(href);
      if (fromHash) setOpenSlug(fromHash);
    }

    applyHash();
    window.addEventListener("hashchange", applyHash);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("hashchange", applyHash);
      document.removeEventListener("click", onClick);
    };
  }, []);

  const value = useMemo(() => ({ openSlug, toggle }), [openSlug, toggle]);

  return (
    <SkillStackContext.Provider value={value}>
      <div className="skill-stack">{children}</div>
    </SkillStackContext.Provider>
  );
}

export function useSkillStack(): SkillStackValue {
  const value = useContext(SkillStackContext);
  if (!value) {
    throw new Error("useSkillStack 必须在 SkillStack 内使用");
  }
  return value;
}
