import { getAllPosts } from "@/lib/posts"
import WritingPage from "./page"

export default function WritingLayout() {
  const posts = getAllPosts()

  return <WritingPage posts={posts} />
}
