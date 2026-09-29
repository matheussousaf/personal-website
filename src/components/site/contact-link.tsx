"use client";

import { useState } from "react";
import { AnimatedIcon, type AnimatedIconKind } from "./animated-icon";
import type { contacts } from "./profile";
import styles from "./contact-link.module.css";

const iconKinds: Partial<Record<string, AnimatedIconKind>> = {
  email: "email",
  github: "github",
  "x / twitter": "twitter",
  linkedin: "linkedin",
};

export function ContactLink({ contact, showHandle = false }: {
  contact: (typeof contacts)[number];
  showHandle?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const { href, label, handle } = contact;
  const kind = iconKinds[label];

  return (
    <a
      href={href}
      className={styles.link}
      data-contact={label}
      aria-label={showHandle ? `${label}: ${handle}` : undefined}
      onPointerEnter={(event) => { if (event.pointerType !== "touch") setHovered(true); }}
      onPointerLeave={() => setHovered(false)}
      onFocus={(event) => setFocused(event.currentTarget.matches(":focus-visible"))}
      onBlur={() => setFocused(false)}
      {...(href.startsWith("https:") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {kind && <AnimatedIcon kind={kind} active={hovered || focused} className={styles.icon} />}
      <span>{showHandle ? handle : label}</span>
    </a>
  );
}
