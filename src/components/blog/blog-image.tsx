import Image from "next/image"

interface BlogImageProps {
  src: string
  alt?: string
  caption?: string
}

export function BlogImage({ src, alt = "", caption }: BlogImageProps) {
  return (
    <figure className="my-8">
      <div className="relative rounded-lg overflow-hidden bg-gray-900">
        <Image
          src={src || "/placeholder.svg"}
          alt={alt}
          width={800}
          height={400}
          className="w-full h-auto"
          crossOrigin="anonymous"
        />
      </div>
      {caption && <figcaption className="text-center text-sm text-gray-500 mt-2">{caption}</figcaption>}
    </figure>
  )
}
