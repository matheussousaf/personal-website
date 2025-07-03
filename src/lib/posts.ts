import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "content/posts");

export interface Post {
  slug: string;
  title: string;
  date: string;
  readingTime: string;
  tags?: string[];
  next?: Partial<Post>;
  previous?: Partial<Post>;
  content: string;
}

export function getAllPosts(): Post[] {
  const fileNames = fs.readdirSync(postsDirectory);
  const posts = fileNames.map((fileName) => {
    const slug = fileName.replace(/\.md$/, "");
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    return {
      slug,
      title: data.title,
      date: data.date,
      tags: data.tags || [],
      readingTime: data.readingTime,
      content,
    };
  });

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getNextPost(posts: Post[], currentSlug: string) {
  const currentPostIndex = posts.findIndex((post) => post.slug === currentSlug);
  return posts[currentPostIndex + 1];
}

export function getPreviousPost(posts: Post[], currentSlug: string) {
  const currentPostIndex = posts.findIndex((post) => post.slug === currentSlug);
  return posts[currentPostIndex - 1];
}

export function getPostBySlug(slug: string): Post {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  const posts = getAllPosts();

  return {
    slug,
    title: data.title,
    date: data.date,
    readingTime: data.readingTime,
    tags: data.tags || [],
    next: getNextPost(posts, slug),
    previous: getPreviousPost(posts, slug),
    content,
  };
}
