# Matheus Sousa — personal website

A minimal personal notebook built with Next.js App Router: a persistent identity rail, charcoal palette, lowercase interface copy, readable Geist Sans typography, and a small, visibly chunky pixel-art GitHub avatar.

## Getting Started

Use Node.js 20.9 or newer (verified with Node.js 24.5.0) and pnpm 10.14.0, pinned in `package.json`. Install the locked dependencies and start the development server:

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Use `pnpm-lock.yaml` for reproducible installs; pnpm is the only supported package manager for this repository. All dependencies are public npm packages. If a machine-wide private registry returns an authentication error, use `npm_config_registry=https://registry.npmjs.org pnpm install --frozen-lockfile`.

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Edit `src/components/site/notebook.tsx` for the views, `src/components/site/profile.ts` for the biography, tools, and contact details, and `content/posts/*.md` for articles.

## Pages and interface

- The index, biography, writing archive, contact details, and articles open as views inside the same notebook shell. Internal navigation does not reload the document or replace the sidebar.
- Views have shareable fragment URLs: `/#about`, `/#writing`, `/#contact`, and `/#post-voice-interfaces`. Browser back/forward and reload preserve the selected view.
- Existing `/about`, `/writing`, and `/posts/[slug]` URLs remain entry points into the corresponding notebook view, with server-rendered content and route metadata. Unknown post slugs return 404.
- The default desktop notebook is centered within an 848px maximum width, with a sticky identity rail beside the content column. On mobile, identity and navigation sit above the content.
- `notebook-shell.tsx` handles active views and navigation; `notebook-shell.module.css` handles layout and transitions. Content styles live in `notebook-content.module.css`.
- Personal copy and navigation favor lowercase; article text and technology names retain their original casing. Keyboard focus moves to the new content, and a skip link bypasses the identity rail.
- The index and about view share their introduction from `profile.ts`. The profile uses “software engineer” and describes current work with AI, products, and interfaces without a career timeline. About copy, role labels, metadata, and the agent’s biography response stay aligned; the tools list remains on the index rather than the about page.

## Contact and reading modes

Contact opens with four contact links followed by a compact composer as the fifth option. Plain question buttons sit directly below the input, without underlines, pill borders, or backgrounds. There is no chat heading: “talk to my agent” appears only as the input placeholder. The welcome layout follows its content height rather than reserving an empty conversation panel.

The single-line composer is a 37px-high transparent underline with a 24px ghost send button, rather than a boxed field or filled circular control. Its 15px desktop text matches the contact links; touch inputs retain 16px text to avoid automatic focus zoom. Send, back, and new-chat controls use slight 2px corners and restrained hover backgrounds.

Focus brightens the underline over 180ms, without adding a background, outer outline, or shadow. An accepted message triggers one 360ms upward exit-and-return animation on the send arrow, driven by the actual pending state. Global reduced-motion rules disable the transitions and animations.

Sending a message expands the conversation, with compact right-aligned user bubbles and plain left-aligned replies. User bubbles have a thin border and slight 6px corners, without entrance animations. Only the active conversation anchors its composer at the bottom, with message history scrolling above it. History positioning and mobile chat alignment are immediate rather than animated. Replies have no visible author labels or icons; authors remain available to screen readers. A pending reply shows only typing dots. The back control restores the contact options without losing the thread; the new-chat control clears it and cancels any pending reply.

When a thread exists but is not currently displayed, a compact “resume chat” utility appears beneath the normal sidebar navigation; the menu retains its four page links. A short rule and spacing separate it from navigation, without a card or redundant heading. In read mode it becomes a labeled, icon-only chat action in the header, with no extra row or separator. Its reserved slot stays in place when the reading toggle docks beside it. Both versions resume the thread, preserve the draft, and focus the composer. They are hidden while the conversation is active and disappear when a new chat clears the thread.

Only the first message of a new thread requests the contact reveal: outgoing content fades over 90ms, incoming content reveals over 240ms, and the underline composer moves into place over 340ms without remounting its textarea. Back, resume, reset, and sending into an existing thread switch layouts immediately. Contact options, suggestions, the transcript, and existing messages have no separate entrance animations to replay. The notebook and navigation marker are excluded from the first-open transition. Browsers without View Transitions use a 240ms first-open fallback; reduced motion switches immediately. Blank or pending sends do not trigger a layout transition. Resuming from another notebook view retains the normal page-navigation transition, without an additional chat entrance.

Replies are deterministic local mocks in `contact-agent-replies.ts`, not a live LLM integration. No messages are sent over the network or written to storage. `AgentChatProvider` keeps the conversation and draft in memory across notebook views; a full reload starts over. Enter sends, Shift+Enter adds a line, and IME confirmation does not submit.

Contact links use compact filled icons adapted from [Lucide Animated](https://lucide-animated.com), with attribution in `public/licenses/lucide-animated.txt`. Motion’s `LazyMotion`/`m` components animate selected SVG parts into a held hover or keyboard-focus state over 220ms; there are no loops, shakes, or bounces. Reduced-motion preferences disable movement, including when the preference changes while an icon is active.

Writing and article views expose an icon-only, 32px ghost read-mode toggle at the writing column’s top-right edge, opposite “← writing” on articles. Its accessible label, pressed state, and tooltip identify the action without visible text. As that position scrolls behind the header or out of the viewport, the single toggle docks beside the menu; scrolling back returns it to the content column. Each move uses a local 220ms fade-and-settle with a small vertical offset and scale, rather than flying across the page. Focus follows without scrolling. Reversing direction cancels the previous motion, layout transitions do not add another docking animation, and reduced motion skips or immediately cancels it. On narrow screens outside read mode, a compact fixed menu keeps the docked control reachable.

Read mode centers a 704px reading column and puts the identity, four navigation links, and compact action slots into a sticky header. Resume chat and the docked reading toggle share those slots rather than creating another row. Body text grows to 19px (18px on narrow screens). Headings, metadata, back links, archive entries, and paragraphs remain left-aligned; only the overall reading column is centered.

Read mode stays active between the writing list and articles, but resets when leaving those views or reloading. Escape exits unless a text field or dialog owns the key. Toggling preserves the article subtree and reading position, so embedded posts are not remounted.

## Page transitions

Normal view changes animate only the content and the small navigation marker. Native View Transitions fade outgoing content for 80ms, then bring the new content in over 120ms with a 5px rise. The navigation marker moves over 200ms. Separating the fades prevents overlapping text.

Browsers without View Transitions use a short CSS entrance animation. Reduced-motion preferences disable both paths. Navigation uses native fragment history rather than private Next.js router-state access. Page and layout transitions use browser APIs; Motion is confined to SVG icon interactions.

Read-mode toggles fade out two intact regions—the navigation and content—over 90ms, then reveal the new header and reading region with small 4–5px vertical offsets, finishing within 350ms. Separate snapshot names preserve each layout’s natural size and position: individual links and the portrait never travel across the page or stretch between layouts. Navigation is captured only during these layout changes, keeping ordinary tab navigation clickable. Browsers without View Transitions use coordinated header/content entrance animations; reduced-motion preferences make the layout change instant.

## Portrait and performance

`public/images/matheus-dither.png` is a static, 24 × 32, two-color PNG generated from [the GitHub avatar for matheussousaf](https://github.com/matheussousaf.png). It uses a 2 × 2 ordered dither with charcoal `#101010` and off-white `#dedee0`, displayed at 96 × 128 with `image-rendering: pixelated`: each source pixel occupies a 4 × 4 CSS-pixel block. The asset is 214 bytes; there is no runtime canvas or GitHub API request.

Geist Sans is self-hosted in `public/fonts/geist-sans-latin.woff2` (29,400 bytes), with its SIL Open Font License alongside it. The variable font covers weights 400–600, is preloaded once, uses `font-display: swap`, and falls back to system sans-serif fonts. Navigation, articles, and tweet embeds use the sans face; code retains system monospace fonts. No Google Fonts request is made at build time or in the browser. Font declarations and colors live in `src/app/globals.css`.

The type scale uses 13–14px supporting labels, 15–17px navigation and body text, and 19–24px introductions and page headings. Article headings, code, tables, and embedded-post text follow the same enlarged scale.

Routes are statically prerendered. View content is prepared on the server; only the active view is mounted in the browser. The layout experiments, comparison controls, and superseded page components have been removed.

Tweet-rendering code loads only when an article view is mounted. `react-tweet` handles omitted entity objects and arrays, including quoted tweets. The adapter copies display-text ranges before rendering because enrichment mutates them; cached tweet data stays intact. An unavailable tweet displays the library's not-found state rather than preventing the article from loading.

## Production preview

```bash
pnpm build
pnpm start
```

## Dependency maintenance and verification

Dependencies use current stable releases, including Next.js 16.3.7, React 19.3.0, TypeScript 7.0.2, Tailwind CSS 4.3.3, Biome 2.5.14, and Lucide 1.48.0. Next.js 16 uses Turbopack for both development and production builds. Its development server generates `AGENTS.md` and `CLAUDE.md` to point assistants to the installed framework documentation.

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm audit
pnpm outdated
```

`lint` runs Biome rather than the removed `next lint` command. Its configuration recognizes Tailwind directives and CSS Modules; narrowly documented exceptions preserve intentional effect dependencies, keyboard scrolling, immutable message keys, and skip-link behavior. The current code has eight non-blocking lint warnings and one informational diagnostic.

There is no automated test suite configured. Runtime smoke checks cover the production routes and unknown-post 404, static assets and image optimization, desktop/mobile navigation, browser history and fragment reloads, read mode, chat replies/resume/reset, and tweet rendering with missing entities. External tweets may be unavailable independently of the application; check that their not-found state does not break the article.

Known framework diagnostic: under `next start`, Next.js 16.3.7 logs `Internal: NoFallbackError` for an unknown `/posts/[slug]` with `dynamicParams = false`. The response is still the expected HTTP 404 and not-found page. Keep the static-route constraint rather than suppressing the log or enabling request-time rendering solely to avoid it.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
