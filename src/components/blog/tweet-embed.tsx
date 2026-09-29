"use client";

import { useMemo } from "react";
import { EmbeddedTweet, TweetNotFound, TweetSkeleton, useTweet } from "react-tweet";
import type { TweetBase } from "react-tweet/api";

function normalizeEntities<T extends TweetBase>(tweet: T): T {
  return {
    ...tweet,
    // react-tweet adjusts this range while enriching the tweet; keep SWR data intact.
    display_text_range: [...tweet.display_text_range],
    entities: {
      ...tweet.entities,
      // The syndication API omits empty collections; react-tweet 3.2 expects arrays.
      hashtags: tweet.entities.hashtags ?? [],
      user_mentions: tweet.entities.user_mentions ?? [],
      urls: tweet.entities.urls ?? [],
      symbols: tweet.entities.symbols ?? [],
    },
  };
}

export function TweetEmbed({ id }: { id: string }) {
  const { data, error, isLoading } = useTweet(id);
  const tweet = useMemo(() => {
    if (!data) return null;
    return {
      ...normalizeEntities(data),
      quoted_tweet: data.quoted_tweet
        ? normalizeEntities(data.quoted_tweet)
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
