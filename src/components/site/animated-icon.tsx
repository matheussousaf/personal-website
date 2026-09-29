"use client";

/*!
 * SVGs and part-level animation adapted from lucide-animated:
 * https://lucide-animated.com — motion reduced to non-repeating hover states.
 *
 * MIT License
 * Copyright (c) 2024-2026 pqoqubbw
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { domAnimation, LazyMotion, type Transition } from "motion/react";
import * as m from "motion/react-m";
import { useSyncExternalStore } from "react";

export type AnimatedIconKind = "zen" | "email" | "github" | "twitter" | "linkedin";

let motionPreference: MediaQueryList | undefined;
function getMotionPreference() {
  motionPreference ??= window.matchMedia("(prefers-reduced-motion: reduce)");
  return motionPreference;
}
function subscribeToMotionPreference(onChange: () => void) {
  const query = getMotionPreference();
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
function motionSnapshot() { return getMotionPreference().matches; }
function serverMotionSnapshot() { return true; }

const transition: Transition = { type: "tween", duration: 0.22, ease: [0.22, 1, 0.36, 1] };
const instant: Transition = { duration: 0 };
const corners = [
  { x: -1, y: -1, outer: "M8 3 L5 3 C3.9 3 3 3.9 3 5 L3 8", inner: "M3 8 L6 8 C7.1 8 8 7.1 8 6 L8 3" },
  { x: 1, y: -1, outer: "M16 3 L19 3 C20.1 3 21 3.9 21 5 L21 8", inner: "M21 8 L18 8 C16.9 8 16 7.1 16 6 L16 3" },
  { x: -1, y: 1, outer: "M8 21 L5 21 C3.9 21 3 20.1 3 19 L3 16", inner: "M3 16 L6 16 C7.1 16 8 16.9 8 18 L8 21" },
  { x: 1, y: 1, outer: "M21 16 L21 19 C21 20.1 20.1 21 19 21 L16 21", inner: "M16 21 L16 18 C16 16.9 16.9 16 18 16 L21 16" },
] as const;

export function AnimatedIcon({ kind, active = false, expanded = false, className }: {
  kind: AnimatedIconKind;
  active?: boolean;
  expanded?: boolean;
  className?: string;
}) {
  // React to preference changes even while an icon is already hovered or focused.
  const reducedMotion = useSyncExternalStore(subscribeToMotionPreference, motionSnapshot, serverMotionSnapshot);
  const moving = active && !reducedMotion;
  const timing = reducedMotion ? instant : transition;
  const distance = moving ? (expanded ? -1.2 : 1.2) : 0;

  return (
    <LazyMotion features={domAnimation} strict>
      <svg className={className} viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        {kind === "zen" && corners.map((corner) => (
          <m.path key={corner.outer} d={expanded ? corner.inner : corner.outer} initial={false} animate={{ d: expanded ? corner.inner : corner.outer, x: corner.x * distance, y: corner.y * distance }} transition={timing} />
        ))}
        {kind === "email" && (
          <>
            <path fill="currentColor" d="M22 6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h16a2 2 0 0 0 2-2V6Z" />
            <m.path stroke="var(--site-bg)" d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" initial={false} animate={{ d: moving ? "m22 7-8.97 4.5a1.94 1.94 0 0 1-2.06 0L2 7" : "m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" }} transition={timing} />
          </>
        )}
        {kind === "github" && (
          <>
            <path fill="currentColor" d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4Z" />
            <m.path d="M9 18c-4.51 2-5-2-7-2" style={{ transformOrigin: "9px 18px" }} initial={false} animate={{ rotate: moving ? -8 : 0 }} transition={timing} />
          </>
        )}
        {kind === "twitter" && <m.path fill="currentColor" strokeWidth={1} d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" initial={false} animate={{ x: moving ? 0.6 : 0, y: moving ? -1 : 0 }} transition={timing} />}
        {kind === "linkedin" && (
          <g fill="currentColor" strokeWidth={0.8}>
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
            <rect x={2} y={9} width={4} height={12} />
            <m.circle cx={4} cy={4} r={2} initial={false} animate={{ y: moving ? -1.2 : 0 }} transition={timing} />
          </g>
        )}
      </svg>
    </LazyMotion>
  );
}
