import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PostList from "@/components/blog/posts/posts-list";
import SearchBar from "@/components/blog/posts/search-bar";
import YearFilter from "@/components/blog/posts/year-filter";
import { PostsProvider } from "@/contexts/posts-context";
import { getAllPosts } from "@/lib/posts";

export default function Page() {
  const posts = getAllPosts().sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <PostsProvider initialPosts={posts}>
      <div className="min-h-screen bg-zinc-950 text-white">
        <div className="max-w-2xl mx-auto px-6 py-16">
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
            <h1 className="text-3xl font-medium text-white mb-4 font-mono">
              writing
            </h1>
            <p className="text-gray-400">
              There is {posts.length} post to read
            </p>
          </header>
          <SearchBar />
          <YearFilter />
          <PostList />
        </div>
      </div>
    </PostsProvider>
  );
}
