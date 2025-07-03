import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getAllPosts } from "@/lib/posts";

export default function Home() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <header className="mb-20">
          <div>
            <h1 className="text-3xl font-medium text-white mb-2 font-mono">
              matheus sousa
            </h1>
            <p className="text-gray-400 mb-6">
              using ones and zeros to make the world a better place
            </p>

            <nav className="flex flex-wrap gap-6 text-sm">
              <Link
                href="/about"
                className="text-gray-400 hover:text-white transition-colors"
              >
                about
              </Link>
              <Link
                href="/writing"
                className="text-gray-400 hover:text-white transition-colors"
              >
                writing
              </Link>
              <Link
                href="https://github.com/matheussousaf"
                className="text-gray-400 hover:text-white transition-colors inline-flex items-center gap-1"
                target="_blank"
                rel="noopener noreferrer"
              >
                code <ArrowUpRight className="w-3 h-3" />
              </Link>
            </nav>
          </div>
        </header>

        <section>
          <h2 className="text-xl font-medium text-white mb-6">
            recent writing
          </h2>
          <div className="space-y-4">
            {posts.map((post, index) => (
              <div key={index} className="group">
                <Link
                  href={`/posts/${post.slug}`}
                  className="block hover:bg-zinc-900 -mx-2 px-2 py-1 rounded transition-colors"
                >
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="text-gray-200 group-hover:text-white leading-snug">
                      {post.title}
                    </h3>
                    <span className="text-gray-400 text-sm whitespace-nowrap">
                      {new Date(post.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <Link
              href="/writing"
              className="text-gray-400 hover:text-white transition-colors"
            >
              view all posts →
            </Link>
          </div>
        </section>

        <footer className="mt-20 pt-8 border-t border-gray-800">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <p>I don't really use social media but you can reach me in my</p>
            <div className="flex gap-6">
              <Link
                href="mailto:alex@example.com"
                className="hover:text-white transition-colors"
              >
                email
              </Link>
              <Link
                href="https://linkedin.com/in/matheussousaf"
                className="hover:text-white transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                linkedin
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
