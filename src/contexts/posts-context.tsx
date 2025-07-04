"use client";

import { createContext, useContext, useState, useMemo } from "react";
import type { ReactNode } from "react";
import type { Post } from "@/lib/posts";

interface PostsContext {
  year: string;
  years: string[];
  filteredPosts: Post[];
  search: string;
  setSearch: (v: string) => void;
  setYear: (y: string) => void;
  clear: () => void;
}

const ctx = createContext<PostsContext | null>(null);

export function PostsProvider({
  initialPosts,
  children,
}: {
  initialPosts: Post[];
  children: ReactNode;
}) {
  const [search, setSearch] = useState("");
  const [year, setYear] = useState("all");

  const years = useMemo(() => {
    const yearSet = new Set(initialPosts.map((post) => new Date(post.date).getFullYear().toString()))
    return Array.from(yearSet).sort((a, b) => Number.parseInt(b) - Number.parseInt(a))
  }, [initialPosts]);

  const filteredPosts = useMemo(
    () =>
      initialPosts.filter((p) => {
        const q = search.toLowerCase();
        const okText =
          !q ||
          p.title.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q));
        const okYear =
          year === "all" ||
          new Date(p.date).getFullYear().toString() === year;
        return okText && okYear;
      }),
    [initialPosts, search, year]
  );

  const clear = () => {
    setSearch("");
    setYear("all");
  };

  return (
    <ctx.Provider
      value={{ years, filteredPosts, search, setSearch, year, setYear, clear }} 
    >
      {children}
    </ctx.Provider>
  );
}

export function usePosts() {
  const c = useContext(ctx);
  if (!c) throw new Error("usePosts must be inside PostsProvider");
  return c;
}
