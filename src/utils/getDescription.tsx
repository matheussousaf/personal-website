export function getDescription(content: string, maxLength = 150) {
  const plainText = content
    // transform markdown links [text](url) → text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    // strip headings
    .replace(/#{1,6}\s+/g, "")
    // strip code blocks
    .replace(/```[\s\S]*?```/g, "")
    // collapse newlines
    .replace(/\n+/g, " ")
    .trim();

  return plainText.length > maxLength
    ? `${plainText.slice(0, maxLength)}...`
    : plainText;
}
