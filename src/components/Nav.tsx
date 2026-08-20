"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { NAV_LINKS, scrollToSection, type SectionId } from "@/lib/scroll";
import { ThemeToggle } from "./ThemeToggle";

const NAV_LINKS_ID = "pill-nav-links";
const DESKTOP_NAV = "(min-width: 769px)";

type Indicator = { x: number; y: number; w: number; h: number };

function MenuIcon() {
  return (
    <svg className="pill-menu-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        d="M4 7h16M4 12h16M4 17h16"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="pill-menu-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        d="M6 6l12 12M18 6 6 18"
      />
    </svg>
  );
}

export function Nav() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const [active, setActive] = useState<SectionId>("about");
  const [indicator, setIndicator] = useState<Indicator | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const scrolling = useRef(false);
  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<Partial<Record<SectionId, HTMLAnchorElement | null>>>({});

  function closeMenu() {
    setMenuOpen(false);
  }

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

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_NAV);
    const onChange = () => {
      if (media.matches) closeMenu();
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };
    const onPointerDown = (event: PointerEvent) => {
      if (navRef.current?.contains(event.target as Node)) return;
      closeMenu();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [menuOpen]);

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
      if (!item || item.offsetWidth === 0 || item.offsetHeight === 0) {
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
  }, [currentId, pathname, menuOpen]);

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
          closeMenu();
          if (!onHome) return;
          event.preventDefault();
          goTo("about");
        }}
      >
        CodeSoul
      </Link>
      <div id={NAV_LINKS_ID} className={menuOpen ? "pill-nav-links is-open" : "pill-nav-links"}>
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
                closeMenu();
                if (!onHome) return;
                event.preventDefault();
                goTo(link.id);
              }}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
      <button
        type="button"
        className="pill-menu-btn"
        aria-label={menuOpen ? "关闭菜单" : "打开菜单"}
        aria-expanded={menuOpen}
        aria-controls={NAV_LINKS_ID}
        onClick={() => setMenuOpen((open) => !open)}
      >
        {menuOpen ? <CloseIcon /> : <MenuIcon />}
      </button>
      <ThemeToggle />
    </nav>
  );
}
