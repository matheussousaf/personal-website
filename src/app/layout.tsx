import type React from "react"
import type { Metadata, Viewport } from "next"
import "./globals.css"


export const metadata: Metadata = {
  title: {
    default: "Matheus Sousa — Software Engineer",
    template: "%s — Matheus Sousa",
  },
  description: "Software engineer in Brazil. Working with AI and sharing notes on software, interfaces, and the things I’m building.",
}

export const viewport: Viewport = {
  themeColor: "#101010",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="/fonts/geist-sans-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  )
}
