import Image from "next/image";

interface MarkdownImageNode {
  properties: {
    src?: unknown;
    alt?: unknown;
  };
}

export interface MarkdownImageProps {
  node: MarkdownImageNode;
}

export function MarkdownImage({ node }: MarkdownImageProps) {
  const { src: rawSrc, alt: rawAlt } = node.properties;
  if (typeof rawSrc !== "string") return null;
  const src = rawSrc;
  const alt = typeof rawAlt === "string" ? rawAlt : "Image";

  return (
    <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="100vw"
        unoptimized
        className="object-contain rounded-lg"
      />
    </div>
  );
}
