import Link from "next/link";
import { Shell } from "@/components/Shell";

export default function NotFound() {
  return (
    <Shell>
      <header className="page-header">
        <h1>没有这一页</h1>
        <p className="codesoul-subtitle-lg">地址不对，或文章还是草稿。</p>
      </header>
      <div className="not-found-actions">
        <Link href="/">回首页</Link>
        <Link href="/#blog">去博客</Link>
      </div>
    </Shell>
  );
}
