"use client";

import { lazy, Suspense } from "react";

const Tweet = lazy(() => import("./tweet-embed").then(({ TweetEmbed }) => ({ default: TweetEmbed })));

export function LazyTweet({ id }: { id: string }) {
  return (
    <Suspense fallback={<p role="status">Loading embedded post…</p>}>
      <Tweet id={id} />
    </Suspense>
  );
}
