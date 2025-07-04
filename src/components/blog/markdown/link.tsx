"use client";

import Link from "next/link";
import { Tweet } from "react-tweet";

export interface MarkdownLinkProps {
  node: {
    properties: {
      href: string;
      title?: string;
    };
  };
  children: React.ReactNode;
}

const tweetUrlPattern = /^https?:\/\/(?:www\.)?x\.com\/[^/]+\/status\/(\d+)/i;

export function MarkdownLink({ node, children }: MarkdownLinkProps) {
  const href = node.properties.href;

  const match = typeof href === "string" && tweetUrlPattern.exec(href);

  if (children === "TWEET" && match) {
    return (
      <div className="mt-4 max-w-full flex justify-center items-center gap-2">
        <Tweet id={match[1]} data-theme="dark" />
      </div>
    );
  }

  if (href.startsWith("/") || href.startsWith("#")) {
    return <Link href={href}>{children}</Link>;
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}
