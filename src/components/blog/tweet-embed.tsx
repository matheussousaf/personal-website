"use client";

import { useMemo } from "react";
import { EmbeddedTweet, TweetNotFound, TweetSkeleton, useTweet } from "react-tweet";
import type { TweetBase } from "react-tweet/api";

function copyDisplayRange<T extends TweetBase>(tweet: T): T {
  return {
    ...tweet,
    // react-tweet adjusts this range while enriching the tweet; keep SWR data intact.
    display_text_range: [...tweet.display_text_range],
  };
}

export function TweetEmbed({ id }: { id: string }) {
  const { data, error, isLoading } = useTweet(id);
  const tweet = useMemo(() => {
    if (!data) return null;
    return {
      ...copyDisplayRange(data),
      quoted_tweet: data.quoted_tweet
        ? copyDisplayRange(data.quoted_tweet)
        : undefined,
    };
  }, [data]);

  return (
    <div data-theme="dark">
      {isLoading ? (
        <TweetSkeleton />
      ) : error || !tweet ? (
        <TweetNotFound />
      ) : (
        <EmbeddedTweet tweet={tweet} />
      )}
    </div>
  );
}
