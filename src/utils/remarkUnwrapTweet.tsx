const TWEET_RE = /^https?:\/\/(?:www\.)?x\.com\/[^/]+\/status\/\d+/;

export function remarkUnwrapTweet() {
  return (tree: any) => {
    const out: any[] = [];
    for (const node of tree.children) {
      if (
        node.type === "paragraph" &&
        node.children.length === 1 &&
        node.children[0].type === "link"
      ) {
        const link = node.children[0];
        const text = link.children?.[0]?.value;
        if (TWEET_RE.test(link.url) && text === "TWEET") {
          out.push(link);
          continue;
        }
      }
      out.push(node);
    }
    tree.children = out;
  };
}
