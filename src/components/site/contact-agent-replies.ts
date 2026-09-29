import { contacts, tools } from "./profile";

/** A reply is plain text plus optional links; rendered as React text/anchors, never as HTML. */
export type ReplyPart = string | { readonly text: string; readonly href: string };
export type Reply = readonly ReplyPart[];
export type LatestPost = { readonly title: string; readonly slug: string };

function contact(label: string) {
  const found = contacts.find((entry) => entry.label === label);
  if (!found) throw new Error(`missing ${label} contact in profile`);
  return { text: found.handle, href: found.href };
}

const email = contact("email");
const github = contact("github");

const topics = "his background, stack, writing, or how to reach him";

const greeting = /^(hi|hello|hey|hiya|howdy|yo|oi|ola|sup|whats up|good (morning|afternoon|evening))( there| matheus| agent)?$/;
const meta = /\b(who are you|what are you|are you (real|human|matheus|a person|an? (ai|bot|llm))|llm|gpt|chatgpt|openai|claude|language model|ai|bot|how do you work)\b/;
const logistics =
  /\b(availab\w*|free|calendar|schedul\w*|book\w*|meeting|meet|call|hire|hiring|rates?|pric\w*|cost|salary|budget|when can|start date|deadline)\b/;
const reach = /\b(e ?mail|mail|contact|reach|touch|collab\w*|work together|talk to (him|matheus)|message|dm|linkedin|twitter)\b/;
const writing = /\b(writ\w*|blog\w*|posts?|articles?|essays?|read\w*|notes?|latest)\b/;
const stack =
  /\b(stack|tech\w*|tools?|languages?|frameworks?|typescript|javascript|python|react|next(js)?|node(js)?|postgres\w*|mongo\w*|aws|docker|databases?|backend|frontend|infra\w*)\b/;
const projects = /\b(projects?|portfolio|built|build|work(ed)? on|clients?|open source|github|repos?)\b/;
const background =
  /\b(background|brazil|where|based|lives?|from|location|since|start\w*|began|begin|experience|journey|history|career|who is|about (him|matheus)|years?|remote\w*)\b/;

function normalize(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9@\s-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Deterministic scripted answer: same question, same reply. Only facts already published on this page. */
export function replyTo(input: string, latestPost?: LatestPost): Reply {
  const text = normalize(input);

  if (greeting.test(text)) {
    return [`hey! i can help you get to know matheus — ${topics}. what would you like to know?`];
  }

  if (meta.test(text)) {
    return [
      "this chat uses mocked replies for now, rather than a live language model. i can answer a few questions about matheus using the information on this site.",
    ];
  }

  if (logistics.test(text)) {
    return [
      "for availability, project details, or rates, the best person to ask is matheus. you can reach him at ",
      email,
      ".",
    ];
  }

  if (reach.test(text)) {
    return [
      "email is the real way to reach matheus: ",
      email,
      ". he’s based in brazil, works remotely, and is interested in new projects and collaboration.",
    ];
  }

  if (writing.test(text)) {
    const index = ["everything else is under ", { text: "writing", href: "#writing" }, "."] as const;
    if (!latestPost) return ["he writes notes on software, interfaces, and building for the web. ", ...index];
    return [
      "he writes notes on software, interfaces, and building for the web. the latest is ",
      { text: latestPost.title.toLowerCase(), href: `#post-${latestPost.slug}` },
      ". ",
      ...index,
    ];
  }

  if (stack.test(text)) {
    return [`his usual stack:\n${tools.map(({ label, value }) => `${label} — ${value}`).join("\n")}`];
  }

  if (projects.test(text)) {
    return [
      "you can explore matheus’s public projects and contributions on ",
      { text: "github", href: github.href },
      ".",
    ];
  }

  if (background.test(text)) {
    return [
      "matheus is a software engineer based in brazil. he works with ai and builds products, from working through an idea to getting the details right. he writes about software, interfaces, and what he’s making. ",
      { text: "more about his work", href: "#about" },
      " is on the about page.",
    ];
  }

  return [
    `i can help with ${topics}. which would you like to explore?`,
  ];
}
