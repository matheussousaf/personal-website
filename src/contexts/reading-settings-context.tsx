"use client";

import { createContext, useContext, useState } from "react";

interface ReadingSettingsContext {
  layout: "wide" | "narrow";
  setLayout: (layout: "wide" | "narrow") => void;
}

const ctx = createContext<ReadingSettingsContext | null>(null);

export function ReadingSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [layout, setLayout] = useState<"wide" | "narrow">("narrow"); 

  return (
    <ctx.Provider value={{ layout, setLayout }}>
      <div
        className={`mx-auto px-6 py-16 transition-all duration-300 ${
          layout === "wide" ? "max-w-4xl" : "max-w-2xl"
        }`}
      >
        {children}
      </div>
    </ctx.Provider>
  );
}

export function useReadingSettings() {
  const c = useContext(ctx);
  if (!c)
    throw new Error(
      "useReadingSettings must be inside ReadingSettingsProvider"
    );
  return c;
}
