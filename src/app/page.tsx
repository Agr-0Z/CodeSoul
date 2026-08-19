import type { Metadata } from "next";
import { HomeSections } from "@/components/HomeSections";
import { Shell } from "@/components/Shell";
import { site } from "@/content/site";
import { getAllPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: {
    absolute: site.name,
  },
  description: site.description,
};

export default function HomePage() {
  const posts = getAllPosts({ includeDrafts: false });
  return (
    <Shell>
      <HomeSections posts={posts} />
    </Shell>
  );
}
