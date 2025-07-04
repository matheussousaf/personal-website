// components/SearchBar.tsx
"use client";
import { Search, X } from "lucide-react";
import { usePosts } from "@/contexts/posts-context";

export default function SearchBar() {
  const { search, setSearch } = usePosts();
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
      <input
        type="text"
        placeholder="Search posts..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-10 py-3 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
      />
      {search && (
        <button
          onClick={() => setSearch("")}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors rounded p-2 bg-zinc-700/10"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
