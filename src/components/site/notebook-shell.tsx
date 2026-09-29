"use client";

import { ArrowUpRight, MessageSquare } from "lucide-react";
import { AnimatedIcon } from "./animated-icon";
import { changeChatLayout, useAgentChat } from "./contact-agent";
import type { Dispatch, MouseEvent as ReactMouseEvent, ReactNode, SetStateAction } from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import styles from "./notebook-shell.module.css";

type Views = Readonly<Record<string, ReactNode>>;

type ViewState = {
  key: string;
  /** Bumped on every change; its parity alternates the view-transition name so old/new content fade as separate layers. */
  generation: number;
  /** CSS enter animation for browsers without the View Transitions API. */
  enter: boolean;
};

type Motion = "transition" | "css" | "none";

const navigation = ["index", "about", "writing", "contact"] as const;

function viewKeyFromHash(hash: string, views: Views): string | null {
  if (hash.length < 2) return null;
  let key: string;
  try {
    key = decodeURIComponent(hash.slice(1));
  } catch {
    return null;
  }
  return Object.hasOwn(views, key) ? key : null;
}

function pickMotion(): Motion {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "none";
  return typeof document.startViewTransition === "function" ? "transition" : "css";
}

function ignore() {}

/** Read mode only exists for the archive and articles; every other view resets it. */
function isReadingView(key: string): boolean {
  return key === "writing" || key.startsWith("post-");
}

/** Text fields and dialogs own their Escape (clearing input, closing the chat). */
const escapeOwners =
  'input, textarea, select, [contenteditable]:not([contenteditable="false"]), dialog, [role="dialog"], [aria-modal="true"]';

/**
 * Remembers what the reader is looking at so a layout change (navigation moved, larger type) can put
 * it back in place: descends to the first visible block and keeps its offset, or for a block that
 * straddles the viewport top, the same fraction of it.
 */
function captureReadingPosition(root: Element | null, restoreFocus = false): (() => void) | null {
  if (!root || window.scrollY <= 0) return null;
  const inset = parseFloat(getComputedStyle(root).getPropertyValue("--reading-inset")) || 0;
  let anchor: Element | null = null;
  let box: DOMRect | null = null;
  let parent: Element = root;
  for (let depth = 0; depth < 8; depth++) {
    let found: Element | null = null;
    for (const child of parent.children) {
      const rect = child.getBoundingClientRect();
      if (rect.height > 0 && rect.bottom > inset) {
        found = child;
        box = rect;
        break;
      }
    }
    if (!found || !box) break;
    anchor = found;
    if (box.top >= inset || !found.firstElementChild) break;
    parent = found;
  }
  if (!anchor || !box) return null;

  const target = anchor;
  const { top, height } = box;
  const ratio = top < inset ? (inset - top) / height : 0;
  return () => {
    const after = target.getBoundingClientRect();
    const afterInset = parseFloat(getComputedStyle(target).getPropertyValue("--reading-inset")) || 0;
    const desired = top < inset ? afterInset - ratio * after.height : top - inset + afterInset;
    window.scrollBy({ top: after.top - desired, behavior: "instant" });
    const focusedBox = document.activeElement?.getBoundingClientRect();
    if (restoreFocus && target instanceof HTMLElement && focusedBox && (focusedBox.bottom <= 0 || focusedBox.top >= innerHeight)) {
      if (target.tabIndex < 0 && !target.hasAttribute("tabindex")) {
        target.tabIndex = -1;
        target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true });
      }
      target.focus({ preventScroll: true });
    }
  };
}

/** Fade intact navigation/content regions between layouts without remounting the article. */
function switchZen(
  target: { current: boolean },
  content: HTMLElement | null,
  shell: HTMLElement | null,
  setZen: Dispatch<SetStateAction<boolean>>,
) {
  const motion = pickMotion();
  const commit = () => {
    const restore = content?.isConnected
      ? captureReadingPosition(content, !target.current && document.activeElement?.hasAttribute("data-zen-toggle"))
      : null;
    flushSync(() => setZen(target.current));
    restore?.();
  };
  if (motion !== "transition" || !shell) {
    commit();
    if (motion === "css") {
      const easing = "cubic-bezier(0.22, 1, 0.36, 1)";
      shell?.querySelector("header")?.animate(
        [{ opacity: 0, transform: "translateY(-4px)" }, { opacity: 1, transform: "none" }],
        { duration: 220, easing },
      );
      content?.animate(
        [{ opacity: 0, transform: "translateY(5px)" }, { opacity: 1, transform: "none" }],
        { duration: 240, delay: 20, fill: "backwards", easing },
      );
    }
    return;
  }
  const generation = String(Number(shell.dataset.layoutTransition ?? 0) + 1);
  shell.dataset.layoutTransition = generation;
  const transition = document.startViewTransition(commit);
  transition.ready.catch(ignore);
  transition.updateCallbackDone.catch(ignore);
  transition.finished.catch(ignore).then(() => {
    if (shell.dataset.layoutTransition === generation) delete shell.dataset.layoutTransition;
  });
}

export function NotebookShell({ views, initialView = "index" }: { views: Views; initialView?: string }) {
  const chat = useAgentChat();
  const fallbackView = Object.hasOwn(views, initialView) ? initialView : "index";
  const [view, setView] = useState<ViewState>(() => ({ key: fallbackView, generation: 0, enter: false }));
  const [zen, setZen] = useState(false);
  const [zenHovered, setZenHovered] = useState(false);
  const [zenFocused, setZenFocused] = useState(false);
  const [readingDocked, setReadingDocked] = useState(false);
  const zenActive = zen && isReadingView(view.key);
  const showResume = chat.messages.length > 0 && (view.key !== "contact" || !chat.open);

  const shellRef = useRef<HTMLDivElement>(null);
  const zenTargetRef = useRef(false);
  const mainRef = useRef<HTMLElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const resumeChatRef = useRef(false);
  const railRef = useRef<HTMLElement>(null);
  const readingAnchorRef = useRef<HTMLDivElement>(null);
  const readingToggleRef = useRef<HTMLButtonElement>(null);
  const dockedRef = useRef(false);
  const restoreToggleFocus = useRef(false);
  const animateDocking = useRef(false);

  const viewsRef = useRef(views);
  const fallbackViewRef = useRef(fallbackView);
  /** View currently rendered. */
  const committedRef = useRef(fallbackView);
  /** Latest requested view; pending transition callbacks always commit this, never their own stale target. */
  const targetRef = useRef(fallbackView);

  useLayoutEffect(() => {
    viewsRef.current = views;
    fallbackViewRef.current = fallbackView;
  });

  useLayoutEffect(() => {
    const anchor = readingAnchorRef.current;
    const rail = railRef.current;
    if (!isReadingView(view.key) || !anchor || !rail) {
      dockedRef.current = false;
      restoreToggleFocus.current = false;
      animateDocking.current = false;
      setReadingDocked(false);
      return;
    }

    const update = (docked: boolean) => {
      if (docked === dockedRef.current) return;
      restoreToggleFocus.current = document.activeElement === readingToggleRef.current;
      animateDocking.current = true;
      dockedRef.current = docked;
      setZenHovered(false);
      setReadingDocked(docked);
    };
    let frame = 0;
    const measure = () => {
      frame = 0;
      const inset = zenActive ? rail.getBoundingClientRect().height : 0;
      update(anchor.getBoundingClientRect().top < inset);
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const resize = new ResizeObserver(schedule);
    resize.observe(rail);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      resize.disconnect();
    };
  }, [view.key, zenActive]);

  useLayoutEffect(() => {
    const toggle = readingToggleRef.current;
    if (restoreToggleFocus.current) {
      restoreToggleFocus.current = false;
      toggle?.focus({ preventScroll: true });
    }
    if (!animateDocking.current) return;
    animateDocking.current = false;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!toggle || preference.matches || shellRef.current?.hasAttribute("data-layout-transition")) return;

    const animation = toggle.animate(
      [
        { opacity: 0, transform: readingDocked ? "translateY(6px) scale(.9)" : "translateY(-4px) scale(.94)" },
        { opacity: 1, transform: "translateY(0) scale(1)" },
      ],
      { duration: 220, easing: "cubic-bezier(.16, 1, .3, 1)" },
    );
    const stopForReducedMotion = () => {
      if (preference.matches) animation.cancel();
    };
    preference.addEventListener("change", stopForReducedMotion);
    return () => {
      animation.cancel();
      preference.removeEventListener("change", stopForReducedMotion);
    };
  }, [readingDocked, view.key, zenActive]);

  useLayoutEffect(() => {
    const { history } = window;

    const revealContent = (behavior: ScrollBehavior) => {
      const main = mainRef.current;
      if (!main) return;
      // Only scroll when the content start has left the viewport, so the top of the page never jumps.
      if (main.getBoundingClientRect().top < 0) main.scrollIntoView({ block: "start", behavior });
      if (resumeChatRef.current && committedRef.current === "contact") {
        resumeChatRef.current = false;
        main.querySelector("textarea")?.focus({ preventScroll: true });
      } else main.focus({ preventScroll: true });
    };

    const commit = (motion: Motion) => {
      const next = targetRef.current;
      if (next === committedRef.current) return;
      committedRef.current = next;
      flushSync(() => {
        setView((current) => ({ key: next, generation: current.generation + 1, enter: motion === "css" }));
        // Non-reading views return to the notebook, including during an in-flight layout change.
        if (!isReadingView(next)) {
          zenTargetRef.current = false;
          setZen(false);
        }
      });
      revealContent("instant");
    };

    const show = (target: string) => {
      if (target === targetRef.current) return;
      targetRef.current = target;
      if (target === committedRef.current) return;

      const motion = pickMotion();
      if (motion !== "transition") {
        commit(motion);
        return;
      }
      // Starting a new transition skips any running one; its callback then commits the latest target.
      const transition = document.startViewTransition(() => commit(motion));
      transition.ready.catch(ignore);
      transition.updateCallbackDone.catch(ignore);
      transition.finished.catch(ignore);
    };

    const syncFromLocation = () => {
      const key = viewKeyFromHash(window.location.hash, viewsRef.current);
      if (key) show(key);
      // Unknown fragments (e.g. headings inside an article) keep the current view.
      else if (window.location.hash.length < 2) show(fallbackViewRef.current);
    };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(anchor instanceof HTMLAnchorElement) || !shellRef.current?.contains(anchor)) return;
      if ((anchor.target && anchor.target !== "_self") || anchor.hasAttribute("download")) return;

      const url = new URL(anchor.href);
      const { location } = window;
      if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search) return;
      const key = viewKeyFromHash(url.hash, viewsRef.current);
      if (!key) return;

      event.preventDefault();
      const isCurrentView = key === targetRef.current;
      // Native fragment entries give back/forward semantics without coupling to Next's router state.
      if (url.hash !== location.hash) location.hash = url.hash;
      if (isCurrentView) revealContent("auto");
      else show(key);
    };

    // A valid hash wins over the server-rendered view; applied before paint, without animation or focus.
    const initialKey = viewKeyFromHash(window.location.hash, viewsRef.current);
    if (initialKey && initialKey !== committedRef.current) {
      committedRef.current = initialKey;
      targetRef.current = initialKey;
      setView({ key: initialKey, generation: 0, enter: false });
    }

    // Views change in place, so browser scroll restoration would scroll the outgoing view. Keep it
    // manual while open, but hand back to the browser on unload so reloads restore reading position.
    const previousRestoration = history.scrollRestoration;
    const manualRestoration = () => {
      history.scrollRestoration = "manual";
    };
    const autoRestoration = () => {
      history.scrollRestoration = "auto";
    };
    manualRestoration();

    document.addEventListener("click", onClick);
    window.addEventListener("popstate", syncFromLocation);
    window.addEventListener("hashchange", syncFromLocation);
    window.addEventListener("pagehide", autoRestoration);
    window.addEventListener("pageshow", manualRestoration);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("popstate", syncFromLocation);
      window.removeEventListener("hashchange", syncFromLocation);
      window.removeEventListener("pagehide", autoRestoration);
      window.removeEventListener("pageshow", manualRestoration);
      history.scrollRestoration = previousRestoration;
    };
  }, []);

  useEffect(() => {
    if (!zenActive) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented || event.isComposing) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (event.target instanceof Element && event.target.closest(escapeOwners)) return;
      event.preventDefault();
      zenTargetRef.current = false;
      switchZen(zenTargetRef, viewRef.current, shellRef.current, setZen);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [zenActive]);

  const skipToContent = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const main = mainRef.current;
    if (!main) return;
    main.scrollIntoView({ block: "start" });
    main.focus({ preventScroll: true });
  };

  const continueConversation = () => {
    if (view.key === "contact") {
      changeChatLayout(viewRef.current?.querySelector<HTMLElement>("[data-chat]") ?? null, () => chat.setOpen(true));
    } else {
      resumeChatRef.current = true;
      chat.setOpen(true);
      window.location.hash = "#contact";
    }
  };

  const activeNav = view.key.startsWith("post-") ? "writing" : view.key;
  const viewClassName = [view.generation % 2 === 0 ? styles.viewEven : styles.viewOdd, view.enter ? styles.enter : null]
    .filter(Boolean)
    .join(" ");

  const readingToggle = (
    <button
      ref={readingToggleRef}
      type="button"
      className={styles.zenToggle}
      data-zen-toggle=""
      aria-label="read mode"
      aria-pressed={zenActive}
      aria-keyshortcuts={zenActive ? "Escape" : undefined}
      title={zenActive ? "exit read mode (esc)" : "read mode"}
      onPointerEnter={(event) => { if (event.pointerType !== "touch") setZenHovered(true); }}
      onPointerLeave={() => setZenHovered(false)}
      onFocus={(event) => setZenFocused(event.currentTarget.matches(":focus-visible"))}
      onBlur={() => setZenFocused(false)}
      onClick={() => {
        setZenHovered(false);
        zenTargetRef.current = !zenTargetRef.current;
        switchZen(zenTargetRef, viewRef.current, shellRef.current, setZen);
      }}
    >
      <AnimatedIcon kind="zen" active={zenHovered || zenFocused} expanded={zenActive} />
    </button>
  );

  return (
    <div ref={shellRef} className={zenActive ? `${styles.shell} ${styles.zen}` : styles.shell} data-reading-docked={isReadingView(view.key) && readingDocked || undefined}>
      <a href="#main" className={styles.skipLink} onClick={skipToContent}>
        skip to content
      </a>

      <header ref={railRef} className={styles.rail}>
        <img
          src="/images/matheus-dither.png"
          width={96}
          height={128}
          alt="pixel portrait of matheus"
          className={styles.avatar}
          decoding="async"
          fetchPriority="high"
        />
        <div className={styles.identity}>
          <p className={styles.name}>matheus sousa</p>
          <p className={styles.role}>
            software engineer
            <br />
            brazil
          </p>
        </div>
        <div className={styles.menu}>
          <nav className={styles.nav} aria-label="primary">
            <ul>
              {navigation.map((key) => (
                <li key={key}>
                  <a
                    href={`#${key}`}
                    aria-current={key === view.key ? "page" : key === activeNav ? "true" : undefined}
                  >
                    <span className={styles.bullet} aria-hidden="true" />
                    {key}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        {isReadingView(view.key) && (
          <div className={styles.headerActions}>
            {zenActive && showResume && (
              <button type="button" className={styles.headerIcon} onClick={continueConversation} aria-label="resume chat" title="resume chat">
                <MessageSquare size={16} strokeWidth={1.5} aria-hidden="true" />
              </button>
            )}
            {readingDocked && readingToggle}
          </div>
        )}
        {showResume && !zenActive && (
          <button type="button" className={styles.resumeControl} onClick={continueConversation}>
            resume chat<ArrowUpRight size={14} strokeWidth={1.5} aria-hidden="true" />
          </button>
        )}
      </header>

      <main id="main" ref={mainRef} tabIndex={-1} className={styles.main}>
        {isReadingView(view.key) && (
          <div ref={readingAnchorRef} className={styles.readingAnchor}>
            {!readingDocked && readingToggle}
          </div>
        )}
        <div key={view.key} ref={viewRef} data-view={view.key} className={viewClassName}>
          {views[view.key]}
        </div>
      </main>
    </div>
  );
}
