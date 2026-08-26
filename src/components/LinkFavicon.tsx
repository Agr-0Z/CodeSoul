"use client";

import { useState } from "react";

function faviconSrc(url: string): string {
  const host = new URL(url).hostname;
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128`;
}

export function LinkFavicon({ url, name }: { url: string; name: string }) {
  const [failed, setFailed] = useState(false);
  const initial = name.trim().slice(0, 1) || "?";

  if (failed) {
    return (
      <span className="link-favicon link-favicon-fallback" aria-hidden="true">
        {initial}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- remote favicon; plain img with fallback
    <img
      className="link-favicon"
      src={faviconSrc(url)}
      alt=""
      width={40}
      height={40}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
