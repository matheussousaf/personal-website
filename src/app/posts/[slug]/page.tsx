import { getAllPosts, getPostBySlug, Post } from "@/lib/posts";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PostContent } from "@/components/blog/post-content";
import { ActionsPostButton } from "@/components/blog/actions-post-button";

interface PostPageParams {
  params: {
    slug: string;
  };
}

export default async function PostPage({ params }: PostPageParams) {
  const { slug } = params;
  const post = getPostBySlug(slug);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Back Navigation */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            back to home
          </Link>
        </div>

        <header className="mb-12">
          <h1 className="text-3xl font-medium text-white mb-4 leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </time>
            <span>•</span>
            <span>{post.readingTime}</span>
          </div>
        </header>

        <article className="prose prose-invert prose-gray max-w-none">
          <div className="text-gray-200 leading-relaxed space-y-6">
            <PostContent content={post.content} />
          </div>
        </article>

        <nav className="mt-16 pt-8 border-t border-gray-800">
          <div className="flex justify-between items-center">
            <ActionsPostButton direction="previous" post={post.previous} />

            <ActionsPostButton direction="next" post={post.next} />
          </div>
        </nav>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  const posts = getAllPosts();

  return posts.map((post: Post) => ({
    slug: post.slug,
    title: post.title,
    date: post.date,
    readingTime: post.readingTime,
    content: post.content,
  }));
}
