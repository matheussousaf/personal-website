"use client";
import { usePosts } from "@/contexts/posts-context";

export default function YearFilter() {
  const { years, year, setYear } = usePosts();

  return (
    <div className="flex items-center mt-4 gap-4">
      <span className="text-zinc-400 text-sm">Filter by year:</span>
      <div className="flex gap-2">
        <button
          onClick={() => setYear("all")}
          className={`px-3 py-1 cursor-pointer rounded-full text-sm transition-colors ${
            year === "all"
              ? "bg-zinc-200 text-black"
              : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
          }`}
        >
          All
        </button>
        {years.map((currentYear) => (
          <button
            key={currentYear}
            onClick={() => setYear(currentYear)}
            className={`px-3 py-1 rounded-full cursor-pointer text-sm transition-colors ${
              year === currentYear
                ? "bg-zinc-200 text-black"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            {currentYear}
          </button>
        ))}
      </div>
    </div>
  );
}
