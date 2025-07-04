"use client";

import { usePosts } from "@/contexts/posts-context";
import { getDescription } from "@/utils/getDescription";
import Link from "next/link";

export default function PostList() {
  const { filteredPosts, clear } = usePosts();

  return (
    <div className="space-y-6 mt-6">
      {filteredPosts.length > 0 ? (
        filteredPosts.map((post, index) => (
          <article key={index} className="group">
            <Link
              href={`/posts/${post.slug}`}
              className="block hover:bg-zinc-900/20  border-zinc-800/40 border-2 -mx-4 px-4 py-4 rounded-lg transition-colors"
            >
              <div className="flex justify-between items-start gap-4 mb-2">
                <h2 className="text-zinc-200 group-hover:text-white font-medium leading-snug flex-1">
                  {post.title}
                </h2>
                <div className="text-right">
                  <time className="text-zinc-500 text-sm whitespace-nowrap block">
                    {new Date(post.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </time>
                  <span className="text-zinc-500 text-xs">
                    {post.readingTime}
                  </span>
                </div>
              </div>
              <p className="text-zinc-400 text-sm mb-3 leading-relaxed">
                {getDescription(post.content)}
              </p>
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="px-2 py-1 bg-zinc-800 text-zinc-400 text-xs rounded-md transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          </article>
        ))
      ) : (
        <div className="text-center py-12">
          <p className="text-zinc-500 mb-4">
            No posts found matching your search.
          </p>
          <button
            onClick={clear}
            className="text-zinc-400 hover:text-white transition-colors text-sm"
          >
            Clear search and filters
          </button>
        </div>
      )}
    </div>
  );
}
