"use client";

import { ArrowLeft, ArrowUp, Plus } from "lucide-react";
import type { FormEvent, KeyboardEvent, ReactNode } from "react";
import { createContext, Fragment, useCallback, useContext, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { type LatestPost, type Reply, replyTo } from "./contact-agent-replies";
import styles from "./contact-agent.module.css";

type Message = { id: number; author: "you" | "agent"; parts: Reply };
type AgentChat = {
  messages: readonly Message[];
  pending: boolean;
  draft: string;
  open: boolean;
  setDraft: (draft: string) => void;
  setOpen: (open: boolean) => void;
  send: (input: string, latestPost?: LatestPost) => boolean;
  reset: () => void;
};

const AgentChatContext = createContext<AgentChat | null>(null);
const suggestions = ["tell me about matheus", "what’s his stack?", "what’s he writing?"];

/** The conversation survives view changes, but is never persisted or sent to a server. */
export function AgentChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<readonly Message[]>([]);
  const [pending, setPending] = useState(false);
  const [draft, setDraft] = useState("");
  const [open, setOpen] = useState(false);
  const nextId = useRef(0);
  const timer = useRef<number | undefined>(undefined);
  const pendingRef = useRef(false);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const send = useCallback((input: string, latestPost?: LatestPost) => {
    const text = input.trim();
    if (!text || pendingRef.current) return false;
    pendingRef.current = true;
    const question: Message = { id: nextId.current++, author: "you", parts: [text] };
    const answer: Message = { id: nextId.current++, author: "agent", parts: replyTo(text, latestPost) };
    setMessages((current) => [...current, question]);
    setPending(true);
    setOpen(true);
    timer.current = window.setTimeout(() => {
      timer.current = undefined;
      pendingRef.current = false;
      setMessages((current) => [...current, answer]);
      setPending(false);
    }, 650);
    return true;
  }, []);

  const reset = useCallback(() => {
    window.clearTimeout(timer.current);
    timer.current = undefined;
    pendingRef.current = false;
    setMessages([]);
    setPending(false);
    setDraft("");
    setOpen(false);
  }, []);

  const value = useMemo(() => ({ messages, pending, draft, open, setDraft, setOpen, send, reset }), [messages, pending, draft, open, send, reset]);
  return <AgentChatContext.Provider value={value}>{children}</AgentChatContext.Provider>;
}

export function useAgentChat() {
  const chat = useContext(AgentChatContext);
  if (!chat) throw new Error("useAgentChat must be called inside AgentChatProvider");
  return chat;
}

export function ContactAgent({ latestPost, children }: { latestPost?: LatestPost; children: ReactNode }) {
  const chat = useAgentChat();
  return <Chat chat={chat} latestPost={latestPost}>{children}</Chat>;
}

/** Returning to an existing thread is immediate; only a first send requests a reveal. */
export function changeChatLayout(section: HTMLElement | null, commit: () => void, animate = false) {
  if (!section) return;
  const motion = animate && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const apply = () => {
    if (!section.isConnected) return;
    flushSync(commit);
    if (section.dataset.chat === "active" && window.matchMedia("(max-width: 759px)").matches && section.getBoundingClientRect().top > 32) {
      section.scrollIntoView({ block: "start", behavior: "instant" });
    }
    section.querySelector("textarea")?.focus({ preventScroll: true });
  };

  if (!motion || !document.startViewTransition) {
    apply();
    if (motion) section.animate(
      [{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "translateY(0)" }],
      { duration: 240, easing: "cubic-bezier(.22, 1, .36, 1)" },
    );
    return;
  }

  const id = String(Number(section.dataset.chatTransition ?? 0) + 1);
  section.dataset.chatTransition = id;
  const transition = document.startViewTransition(apply);
  // Navigation may skip an in-flight transition; the committed chat state remains valid.
  void transition.ready.catch(() => {});
  void transition.updateCallbackDone.catch(() => {});
  void transition.finished.catch(() => {}).then(() => {
    if (section.dataset.chatTransition === id) delete section.dataset.chatTransition;
  });
}

function Chat({ chat, latestPost, children }: { chat: AgentChat; latestPost?: LatestPost; children: ReactNode }) {
  const { messages, pending, draft, open, setDraft, setOpen, send, reset } = chat;
  const inputId = useId();
  const sectionRef = useRef<HTMLElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const canSend = !pending && draft.trim().length > 0;

  // biome-ignore lint/correctness/useExhaustiveDependencies: These state changes alter the scrollable DOM, not the ref identity.
  useLayoutEffect(() => {
    const log = logRef.current;
    if (!log) return;
    log.scrollTo({ top: log.scrollHeight, behavior: "instant" });
  }, [messages.length, pending, open]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: The controlled draft changes the textarea's measured height.
  useLayoutEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.style.height = "auto";
    input.style.height = `${input.scrollHeight + input.offsetHeight - input.clientHeight}px`;
  }, [draft]);

  useEffect(() => {
    if (!open || !window.matchMedia("(max-width: 759px)").matches) return;
    const section = sectionRef.current;
    if (section && section.getBoundingClientRect().top > 32) {
      section.scrollIntoView({ block: "start", behavior: "instant" });
    }
  }, [open]);

  const changeLayout = (commit: () => void, animate = false) => changeChatLayout(sectionRef.current, commit, animate);

  const sendMessage = (text: string, clearDraft = false) => {
    if (pending || !text.trim()) return;
    const commit = () => {
      if (send(text, latestPost) && clearDraft) setDraft("");
    };
    if (!open) changeLayout(commit, messages.length === 0);
    else {
      commit();
      inputRef.current?.focus({ preventScroll: true });
    }
  };

  const submitDraft = () => {
    sendMessage(draft, true);
  };
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitDraft();
    inputRef.current?.focus({ preventScroll: true });
  };
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing || event.keyCode === 229) return;
    event.preventDefault();
    submitDraft();
  };

  return (
    <section ref={sectionRef} className={open ? `${styles.agent} ${styles.chat}` : styles.agent} aria-label={open ? "contact conversation" : "contact options"} data-chat={open ? "active" : "welcome"}>
      {open && (
        <header className={styles.header}>
          <button type="button" className={styles.iconButton} onClick={() => changeLayout(() => setOpen(false))} aria-label="back to contact options" title="back to contact"><ArrowLeft size={16} strokeWidth={1.7} aria-hidden="true" /></button>
          <button type="button" className={styles.iconButton} onClick={() => changeLayout(reset)} aria-label="new chat" title="new chat"><Plus size={16} strokeWidth={1.7} aria-hidden="true" /></button>
        </header>
      )}

      {open && (
        // biome-ignore lint/a11y/noNoninteractiveTabindex: The scrollable conversation must be reachable for keyboard scrolling.
        <div ref={logRef} className={styles.log} role="log" aria-label="conversation with my agent" tabIndex={0}>
          {messages.map((message) => (
            <div key={message.id} className={styles.message} data-author={message.author}>
              <span className={styles.visuallyHidden}>{message.author}</span>
              <div className={styles.bubble}>
                <p className={styles.text}>
                  {message.parts.map((part, index) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: Parts are immutable within a message and never reordered.
                    <Fragment key={index}>
                      {typeof part === "string" ? part : <a href={part.href} className={styles.link} {...(part.href.startsWith("https:") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{part.text}</a>}
                    </Fragment>
                  ))}
                </p>
              </div>
            </div>
          ))}
          {pending && <div className={styles.message} data-pending="true"><span className={styles.visuallyHidden}>agent is replying</span><span className={styles.dots} aria-hidden="true"><span /><span /><span /></span></div>}
        </div>
      )}

      {!open && (
        <div className={styles.landingContent}>
          {children}
        </div>
      )}

      <form className={styles.composer} onSubmit={onSubmit}>
        <label htmlFor={inputId} className={styles.visuallyHidden}>message my agent</label>
        <textarea ref={inputRef} id={inputId} className={styles.input} rows={1} value={draft} placeholder="talk to my agent" autoComplete="off" enterKeyHint="send" onChange={(event) => setDraft(event.target.value)} onKeyDown={onKeyDown} />
        <button type="submit" className={styles.send} aria-label="send message" title="send message" aria-disabled={!canSend || undefined} data-sending={pending || undefined}><ArrowUp size={16} strokeWidth={2} aria-hidden="true" /></button>
      </form>
      {!open && (
        <ul className={styles.suggestions} aria-label="suggested questions">
          {suggestions.map((question) => <li key={question}><button type="button" className={styles.suggestion} aria-disabled={pending || undefined} onClick={() => sendMessage(question)}>{question}<span aria-hidden="true">↗</span></button></li>)}
        </ul>
      )}
    </section>
  );
}
