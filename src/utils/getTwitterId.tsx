export function getTwitterId(url: string) {
  return url.split("/").pop()
}

export const TWITTER_API_URL = "https://publish.twitter.com/oembed"