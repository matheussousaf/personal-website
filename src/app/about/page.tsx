import type { Metadata } from "next";
import { Notebook } from "@/components/site/notebook";

export const metadata: Metadata = {
  title: "about",
  description: "Matheus Sousa is a software engineer based in Brazil. His work includes AI, product development, and interfaces.",
};

export default function About() {
  return <Notebook initialView="about" />;
}
