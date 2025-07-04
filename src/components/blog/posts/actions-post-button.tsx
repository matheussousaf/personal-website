import Link from "next/link";
import { Post } from "@/lib/posts";
import { ArrowLeft } from "lucide-react";

export function ActionsPostButton({
  direction,
  post,
}: {
  direction: "next" | "previous";
  post?: Partial<Post>; 
}) {
  if(!post) return null

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
    >
      {direction === "next" ? (
        <ArrowLeft className="w-4 h-4" />
      ) : (
        <ArrowLeft className="w-4 h-4 transform rotate-180" />
      )}
      <div className="text-left">
        <div className="text-xs text-gray-500">Previous</div>
        <div className="text-sm group-hover:text-white">{post.title}</div>
      </div>
    </Link>
  );
}
