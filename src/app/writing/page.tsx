import type { Metadata } from "next";
import { Notebook } from "@/components/site/notebook";

export const metadata: Metadata = {
  title: "writing",
  description: "Posts by Matheus Sousa on software, interfaces and building for the web.",
};

export default function Writing() {
  return <Notebook initialView="writing" />;
}
