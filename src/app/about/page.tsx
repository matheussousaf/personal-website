import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

const technologies = [
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Python",
  "PostgreSQL",
  "MongoDB",
  "AWS",
  "Docker",
];

export default function About() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Back Navigation */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            back to home
          </Link>
        </div>

        {/* Header */}
        <header className="mb-12">
          <h1 className="text-3xl font-medium text-white mb-4 font-mono">
            about me
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            I'm a full-stack developer passionate about building fast, scalable
            web applications. I love working with modern technologies and
            sharing knowledge through writing.
          </p>
        </header>

        {/* Bio */}
        <section className="mb-12">
          <div className="space-y-4 text-gray-200 leading-relaxed">
            <p>
              I started my journey in web development in 2018, initially
              focusing on frontend technologies before expanding into full-stack
              development. I enjoy the challenge of building applications that
              are both performant and user-friendly.
            </p>
            <p>
              When I'm not coding, you can find me reading about new
              technologies, contributing to open source projects, or writing
              about development on my blog. I believe in continuous learning and
              sharing knowledge with the developer community.
            </p>
            <p>
              I'm currently based in Brazil and work remotely with teams around
              the world. I'm always interested in discussing new projects and
              opportunities.
            </p>
          </div>
        </section>

        {/* Technologies */}
        <section className="mb-12">
          <h2 className="text-xl font-medium text-white mb-6">
            technologies i work with
          </h2>
          <div className="flex flex-wrap gap-2">
            {technologies.map((tech, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-900 text-gray-300 text-sm rounded-md"
              >
                {tech}
              </span>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="mb-12">
          <h2 className="text-xl font-medium text-white mb-6">let's connect</h2>
          <div className="space-y-3">
            <div>
              <Link
                href="mailto:matheussousaf.js@gmail.com"
                className="text-gray-400 hover:text-white transition-colors inline-flex items-center gap-2"
              >
                matheussousaf.js@gmail.com <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            <div>
              <Link
                href="https://twitter.com/matheussousaf4"
                className="text-gray-400 hover:text-white transition-colors inline-flex items-center gap-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                twitter <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            <div>
              <Link
                href="https://github.com/matheussousaf"
                className="text-gray-400 hover:text-white transition-colors inline-flex items-center gap-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                github <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            <div>
              <Link
                href="https://linkedin.com/in/matheussousaf"
                className="text-gray-400 hover:text-white transition-colors inline-flex items-center gap-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                linkedin <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-8 border-t border-gray-800">
          <p className="text-gray-500 text-sm">
            Thanks for reading! Feel free to reach out if you'd like to
            collaborate or just chat about tech.
          </p>
        </footer>
      </div>
    </div>
  );
}
