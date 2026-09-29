import ReactMarkdown from "react-markdown";
import sanitize from "rehype-sanitize";
import gfm from "remark-gfm";
import { remarkUnwrapTweet } from "@/utils/remarkUnwrapTweet";
import { MarkdownImage } from "./markdown/image";
import { MarkdownLink } from "./markdown/link";
import styles from "./post-content.module.css";

export function PostContent({ content }: { content: string }) {
  return (
    <div className={styles.prose}>
      <ReactMarkdown
        components={{
          p({ node, children }) {
            const [only] = node?.children ?? [];
            const isImageOnly =
              node?.children.length === 1 &&
              only.type === "element" &&
              only.tagName === "img";
            return isImageOnly ? (
              <figure className={styles.figure}>{children}</figure>
            ) : (
              <p>{children}</p>
            );
          },
          a: ({ href, title, children }) =>
            href ? (
              <MarkdownLink node={{ properties: { href, title } }}>
                {children}
              </MarkdownLink>
            ) : (
              <>{children}</>
            ),
          img: ({ node }) => (node ? <MarkdownImage node={node} /> : null),
        }}
        remarkPlugins={[gfm, remarkUnwrapTweet]}
        rehypePlugins={[sanitize]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
