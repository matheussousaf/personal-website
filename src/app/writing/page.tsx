"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { ArrowLeft, Search, X } from "lucide-react"
import type { Post } from "@/lib/posts"
import { getDescription } from "@/utils/getDescription"

interface WritingPageProps {
  posts: Post[]
}

export default function WritingPage({ posts }: WritingPageProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedYear, setSelectedYear] = useState<string>("all")

  const years = useMemo(() => {
    const yearSet = new Set(posts.map((post) => new Date(post.date).getFullYear().toString()))
    return Array.from(yearSet).sort((a, b) => Number.parseInt(b) - Number.parseInt(a))
  }, [posts])

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        searchQuery === "" ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.tags && post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())))

      const matchesYear = selectedYear === "all" || new Date(post.date).getFullYear().toString() === selectedYear

      return matchesSearch && matchesYear
    })
  }, [searchQuery, selectedYear, posts])

  const clearSearch = () => {
    setSearchQuery("")
    setSelectedYear("all")
  }

  return (
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
          <h1 className="text-3xl font-medium text-white mb-4 font-mono">writing</h1>
          <p className="text-gray-400">{posts.length} posts about web development, programming, and technology</p>
        </header>

        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-10 py-3 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-gray-700 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 cursor-pointer rounded-full bg-zinc-400/10 p-1 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-400 hover:bg-zinc-400/15 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm">Filter by year:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedYear("all")}
                className={`px-3 py-1 cursor-pointer rounded-full text-sm transition-colors ${
                  selectedYear === "all" ? "bg-gray-200 text-black" : "bg-zinc-800 text-gray-300 hover:bg-zinc-700"
                }`}
              >
                All
              </button>
              {years.map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`px-3 py-1 cursor-pointer rounded-full text-sm transition-colors ${
                    selectedYear === year ? "bg-gray-200 text-black" : "bg-zinc-800 text-gray-300 hover:bg-zinc-700"
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>

          {(searchQuery || selectedYear !== "all") && (
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-sm">
                {filteredPosts.length} post{filteredPosts.length !== 1 ? "s" : ""} found
              </span>
              <button onClick={clearSearch} className="text-gray-400 cursor-pointer hover:text-white transition-colors text-sm">
                Clear filters
              </button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post, index) => (
              <article key={index} className="group">
                <Link
                  href={`/posts/${post.slug}`}
                  className="block hover:bg-zinc-900/40 -mx-4 px-4 py-4 rounded-lg transition-colors"
                >
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <h2 className="text-gray-200 group-hover:text-white font-medium leading-snug flex-1">
                      {post.title}
                    </h2>
                    <div className="text-right">
                      <time className="text-gray-500 text-sm whitespace-nowrap block">
                        {new Date(post.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </time>
                      <span className="text-gray-500 text-xs">{post.readingTime}</span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm mb-3 leading-relaxed">{getDescription(post.content)}</p>
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="px-2 py-1 bg-zinc-800 text-zinc-400 text-xs rounded-md group-hover:bg-zinc-700 transition-colors"
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
              <p className="text-gray-500 mb-4">No posts found matching your search.</p>
              <button onClick={clearSearch} className="text-gray-400 hover:text-white transition-colors text-sm">
                Clear search and filters
              </button>
            </div>
          )}
        </div>

        <footer className="mt-16 pt-8 border-t border-gray-800">
          <p className="text-gray-500 text-sm">
            Want to stay updated? Follow me on{" "}
            <Link href="https://twitter.com/matheussousaf" className="text-gray-400 hover:text-white transition-colors">
              Twitter
            </Link>{" "}
            for the latest posts and updates.
          </p>
        </footer>
      </div>
    </div>
  )
}
