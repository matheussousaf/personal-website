import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";
import sanitize from "rehype-sanitize";
import { MarkdownImage } from "./markdown/image";
import { MarkdownLink } from "./markdown/link";
import { remarkUnwrapTweet } from "@/utils/remarkUnwrapTweet";

export function PostContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        p({ node, children }) {
          const isImageOnly =
            node?.children.length === 1 &&
            node.children[0].type === "element" &&
            (node.children[0] as any).tagName === "img";
          return isImageOnly ? <>{children}</> : <p>{children}</p>;
        },
        a: ({ node, ...props }: any) => <MarkdownLink node={node} {...props} />,
        img: ({ node, ...props }: any) => (
          <MarkdownImage node={node} {...props} />
        ),
        h3: ({ children }) => (
          <h3 className="text-xl font-semibold mb-2">{children}</h3>
        ),
        li: ({ children }) => (
          <li className="list-decimal font-medium ml-4 text-gray-200">{children}</li>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-gray-600 bg-zinc-900/40 p-4 pl-6 italic text-gray-300 my-4">
            {children}
          </blockquote>
        ),
      }}
      remarkPlugins={[gfm, remarkUnwrapTweet]}
      rehypePlugins={[sanitize]}
    >
      {content}
    </ReactMarkdown>
  );
}
