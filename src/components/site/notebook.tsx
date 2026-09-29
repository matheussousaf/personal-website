import type { ReactNode } from "react";
import { PostContent } from "@/components/blog/post-content";
import { PostDate } from "@/components/blog/posts/post-date";
import { getAllPosts } from "@/lib/posts";
import { NotebookShell } from "./notebook-shell";
import { AgentChatProvider, ContactAgent } from "./contact-agent";
import { ContactLink } from "./contact-link";
import { contacts, introduction, story } from "./profile";
import styles from "./notebook-content.module.css";

export function Notebook({ initialView = "index" }: { initialView?: string }) {
  const posts = getAllPosts();
  const writing = (
    <ol className={styles.index}>
      {posts.map((post) => (
        <li key={post.slug} className={styles.entry}>
          <PostDate value={post.date} className={styles.date} />
          <div className={styles.entryBody}>
            <a href={`#post-${post.slug}`} className={styles.title}>{post.title}</a>
            {post.tags?.length ? <span className={styles.tags}>{post.tags.join(" · ")}</span> : null}
          </div>
        </li>
      ))}
    </ol>
  );
  const contactLinks = (
    <ul className={styles.contacts}>
      {contacts.map((contact) => (
        <li key={contact.href}>
          <ContactLink contact={contact} />
        </li>
      ))}
    </ul>
  );

  const views: Record<string, ReactNode> = {
    index: (
      <div>
        <h1 className={styles.lede}>{introduction}</h1>
        <p className={styles.note}>
          i work with ai and write about software, interfaces, and the things i’m building. <a href="#about" className={styles.inline}>more about me</a>
        </p>
        <section className={styles.section} aria-labelledby="index-writing">
          <h2 id="index-writing" className={styles.label}>writing</h2>
          {writing}
          <a href="#writing" className={styles.more}>all writing →</a>
        </section>
        <section className={styles.section} aria-labelledby="index-tools">
          <h2 id="index-tools" className={styles.label}>usually with</h2>
          <p className={styles.stack}>typescript / react / next.js / node.js / postgresql / aws / docker</p>
        </section>
        <section className={styles.section} aria-labelledby="index-contact">
          <h2 id="index-contact" className={styles.label}>contact</h2>
          {contactLinks}
        </section>
      </div>
    ),
    about: (
      <div>
        <h1 className={styles.heading}>about me</h1>
        <div className={styles.biography}>
          <p>{introduction}</p>
          {story.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
        <p className={styles.section}><a href="#contact" className={styles.inline}>get in touch →</a></p>
      </div>
    ),
    writing: (
      <div>
        <h1 className={styles.heading}>writing</h1>
        <p className={styles.note}>notes on software, interfaces, and building for the web.</p>
        <div className={styles.section}>{writing}</div>
      </div>
    ),
    contact: (
      <ContactAgent latestPost={posts[0] ? { title: posts[0].title, slug: posts[0].slug } : undefined}>
        <dl className={styles.definitions}>
          {contacts.map((contact) => (
            <div key={contact.href}>
              <dt>{contact.label}</dt>
              <dd><ContactLink contact={contact} showHandle /></dd>
            </div>
          ))}
        </dl>
      </ContactAgent>
    ),
  };

  for (const post of posts) {
    views[`post-${post.slug}`] = (
      <article aria-labelledby={`title-${post.slug}`}>
        <header className={styles.articleHeader}>
          <a href="#writing" className={styles.inline}>← writing</a>
          <h1 id={`title-${post.slug}`} className={styles.heading}>{post.title}</h1>
          <p className={styles.date}><PostDate value={post.date} /> · {post.readingTime} read</p>
          {post.tags?.length ? <p className={styles.tags}>{post.tags.join(" · ")}</p> : null}
        </header>
        <PostContent content={post.content} />
        <footer className={styles.articleFooter}><a href="#writing" className={styles.inline}>← back to writing</a></footer>
      </article>
    );
  }

  return (
    <AgentChatProvider>
      <NotebookShell views={views} initialView={initialView} />
    </AgentChatProvider>
  );
}
