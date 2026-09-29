import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { toIsoDate } from "@/components/blog/posts/post-date";
import { Notebook } from "@/components/site/notebook";
import { getAllPosts, getPostBySlug } from "@/lib/posts";
import { getDescription } from "@/utils/getDescription";

type Props = { params: Promise<{ slug: string }> };

// Only slugs from content/posts exist; anything else is a static 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

// Guard at the route boundary so an unknown slug never reaches the fs read.
function findPost(slug: string) {
  if (!getAllPosts().some((post) => post.slug === slug)) notFound();
  return getPostBySlug(slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = findPost((await params).slug);
  const description = getDescription(post.content, 160);

  return {
    title: post.title,
    description,
    openGraph: {
      type: "article",
      title: post.title,
      description,
      publishedTime: toIsoDate(post.date),
      tags: post.tags,
    },
  };
}

export default async function Page({ params }: Props) {
  const post = findPost((await params).slug);
  return <Notebook initialView={`post-${post.slug}`} />;
}
