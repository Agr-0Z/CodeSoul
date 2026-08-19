"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { NAV_LINKS, scrollToSection, type SectionId } from "@/lib/scroll";
import { ThemeToggle } from "./ThemeToggle";

type Indicator = { x: number; y: number; w: number; h: number };

export function Nav() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const [active, setActive] = useState<SectionId>("about");
  const [indicator, setIndicator] = useState<Indicator | null>(null);
  const scrolling = useRef(false);
  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<Partial<Record<SectionId, HTMLAnchorElement | null>>>({});

  function goTo(id: SectionId) {
    scrolling.current = true;
    setActive(id);
    history.pushState(null, "", `#${id}`);
    scrollToSection(id, 600);
    window.setTimeout(() => {
      scrolling.current = false;
    }, 620);
  }

  useEffect(() => {
    if (!onHome) return;

    const hash = window.location.hash.replace("#", "") as SectionId;
    if (NAV_LINKS.some((link) => link.id === hash)) {
      goTo(hash);
    }

    const sections = NAV_LINKS.map((link) => document.getElementById(link.id)).filter(
      (node): node is HTMLElement => node != null,
    );
    const observer = new IntersectionObserver(
      (entries) => {
        if (scrolling.current) return;
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) {
          setActive(visible.target.id as SectionId);
        }
      },
      { rootMargin: "-28% 0px -55% 0px", threshold: [0.1, 0.25, 0.5] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [onHome]);

  const currentId: SectionId | null = onHome
    ? active
    : pathname.startsWith("/blog")
      ? "blog"
      : null;

  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const applyNavOffset = () => {
      const top = Number.parseFloat(getComputedStyle(nav).top) || 16;
      document.documentElement.style.setProperty("--nav-offset", `${top + nav.offsetHeight}px`);
    };

    const updateIndicator = () => {
      const item = currentId ? itemRefs.current[currentId] : null;
      if (!item) {
        setIndicator(null);
        return;
      }
      const navBox = nav.getBoundingClientRect();
      const box = item.getBoundingClientRect();
      setIndicator({
        x: box.left - navBox.left,
        y: box.top - navBox.top,
        w: box.width,
        h: box.height,
      });
    };

    const update = () => {
      applyNavOffset();
      updateIndicator();
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(nav);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [currentId, pathname]);

  return (
    <nav ref={navRef} className="pill-nav" aria-label="主导航">
      <span
        className={indicator ? "pill-indicator is-ready" : "pill-indicator"}
        aria-hidden="true"
        style={
          indicator
            ? {
                width: indicator.w,
                height: indicator.h,
                transform: `translate(${indicator.x}px, ${indicator.y}px)`,
              }
            : undefined
        }
      />
      <Link
        href="/#about"
        className="pill-logo"
        onClick={(event) => {
          if (!onHome) return;
          event.preventDefault();
          goTo("about");
        }}
      >
        CodeSoul
      </Link>
      {NAV_LINKS.map((link) => {
        const current = currentId === link.id;
        return (
          <Link
            key={link.id}
            href={`/#${link.id}`}
            aria-current={current ? "page" : undefined}
            ref={(node) => {
              itemRefs.current[link.id] = node;
            }}
            onClick={(event) => {
              if (!onHome) return;
              event.preventDefault();
              goTo(link.id);
            }}
          >
            {link.label}
          </Link>
        );
      })}
      <ThemeToggle />
    </nav>
  );
}
