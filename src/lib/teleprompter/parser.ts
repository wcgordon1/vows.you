import { marked } from "marked";

// ── BBCode → HTML conversion ────────────────────────────────────────────────

const BBCODE_RULES: [RegExp, string][] = [
  [/\[h1\]([\s\S]*?)\[\/h1\]/gi, "<h1>$1</h1>"],
  [/\[h2\]([\s\S]*?)\[\/h2\]/gi, "<h2>$1</h2>"],
  [/\[h3\]([\s\S]*?)\[\/h3\]/gi, "<h3>$1</h3>"],
  [/\[b\]([\s\S]*?)\[\/b\]/gi, "<strong>$1</strong>"],
  [/\[i\]([\s\S]*?)\[\/i\]/gi, "<em>$1</em>"],
  [/\[url=(.*?)\]([\s\S]*?)\[\/url\]/gi, '<a href="$1">$2</a>'],
  [/\[center\]([\s\S]*?)\[\/center\]/gi, '<div class="tp-center">$1</div>'],
  [/\[right\]([\s\S]*?)\[\/right\]/gi, '<div class="tp-right">$1</div>'],
  [/\[justify\]([\s\S]*?)\[\/justify\]/gi, '<div class="tp-justify">$1</div>'],
  [/\[ul\]([\s\S]*?)\[\/ul\]/gi, "<ul>$1</ul>"],
  [/\[ol\]([\s\S]*?)\[\/ol\]/gi, "<ol>$1</ol>"],
  [/\[ml\]([\s\S]*?)\[\/ml\]/gi, "$1"],
  // [li] with optional attrs — strip attrs, keep content
  [/\[li(?:\s[^\]]*?)?\]([\s\S]*?)\[\/li\]/gi, "<li>$1</li>"],
];

function bbcodeToHtml(text: string): string {
  let html = text;
  for (const [pattern, replacement] of BBCODE_RULES) {
    html = html.replace(pattern, replacement);
  }
  return html;
}

// ── Markdown → HTML ─────────────────────────────────────────────────────────

const renderer = new marked.Renderer();

// Open links in new tab
renderer.link = ({ href, text }) => {
  const safeHref = sanitizeHref(href);
  if (!safeHref) return String(text);
  return `<a href="${escapeAttr(safeHref)}" target="_blank" rel="noopener noreferrer">${text}</a>`;
};

marked.setOptions({
  renderer,
  gfm: true,
  breaks: true,
});

function markdownToHtml(text: string): string {
  return marked.parse(text, { async: false }) as string;
}

// ── HTML Sanitizer ──────────────────────────────────────────────────────────

const ALLOWED_TAGS = new Set([
  "h1", "h2", "h3", "h4",
  "p", "br", "hr",
  "strong", "b", "em", "i", "u",
  "ul", "ol", "li",
  "a",
  "div", "span",
  "blockquote",
]);

const ALLOWED_CLASSES = new Set([
  "tp-center",
  "tp-right",
  "tp-justify",
]);

function sanitizeHref(href: string): string | null {
  try {
    const url = new URL(href, "https://placeholder.invalid");
    if (["http:", "https:", "mailto:"].includes(url.protocol)) return href;
  } catch {
    // invalid URL
  }
  return null;
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function sanitizeHtml(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  sanitizeNode(doc.body);
  return doc.body.innerHTML;
}

function sanitizeNode(node: Node): void {
  const toRemove: Node[] = [];

  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) continue;

    if (child.nodeType === Node.ELEMENT_NODE) {
      const el = child as Element;
      const tag = el.tagName.toLowerCase();

      if (!ALLOWED_TAGS.has(tag)) {
        // Replace disallowed tag with its children
        while (el.firstChild) {
          node.insertBefore(el.firstChild, el);
        }
        toRemove.push(el);
        continue;
      }

      // Strip disallowed attributes
      for (const attr of Array.from(el.attributes)) {
        if (attr.name === "href" && tag === "a") {
          const safe = sanitizeHref(attr.value);
          if (!safe) el.removeAttribute("href");
          continue;
        }
        if (attr.name === "class") {
          const classes = attr.value.split(/\s+/).filter((c) => ALLOWED_CLASSES.has(c));
          if (classes.length > 0) {
            el.setAttribute("class", classes.join(" "));
          } else {
            el.removeAttribute("class");
          }
          continue;
        }
        if (attr.name === "target" && tag === "a") continue;
        if (attr.name === "rel" && tag === "a") continue;
        el.removeAttribute(attr.name);
      }

      sanitizeNode(el);
    } else if (child.nodeType === Node.COMMENT_NODE) {
      toRemove.push(child);
    }
  }

  for (const n of toRemove) {
    n.parentNode?.removeChild(n);
  }
}

// ── Full pipeline ───────────────────────────────────────────────────────────

function hasBBCode(text: string): boolean {
  return /\[(?:h[1-3]|b|i|url|center|right|justify|ul|ol|li|ml)[=\s\]]/i.test(text);
}

export function parseContent(raw: string): string {
  if (!raw.trim()) return "";

  let html: string;

  if (hasBBCode(raw)) {
    html = bbcodeToHtml(raw);
    // Run marked on the result to handle any remaining Markdown inside BBCode
    html = markdownToHtml(html);
  } else {
    html = markdownToHtml(raw);
  }

  return sanitizeHtml(html);
}
