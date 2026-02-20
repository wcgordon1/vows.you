import { useEffect, useRef, useCallback } from "react";

/**
 * Walks a container's DOM, wrapping every text-node word in
 * `<span data-w="N">word</span>` while preserving the HTML structure.
 *
 * Returns the list of plain-text words in document order.
 */
export function useWordHighlighter(containerRef: React.RefObject<HTMLDivElement | null>) {
  const wordsRef = useRef<string[]>([]);
  const wrappedRef = useRef(false);

  const wrapWords = useCallback(() => {
    const container = containerRef.current;
    if (!container || wrappedRef.current) return wordsRef.current;

    const words: string[] = [];
    let index = 0;

    function walk(node: Node) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || "";
        if (!text.trim()) return;

        const fragment = document.createDocumentFragment();
        // Split on whitespace while keeping the whitespace as separators
        const parts = text.split(/(\s+)/);

        for (const part of parts) {
          if (/^\s+$/.test(part)) {
            fragment.appendChild(document.createTextNode(part));
          } else if (part) {
            const span = document.createElement("span");
            span.setAttribute("data-w", String(index));
            span.className = "tp-word tp-future";
            span.textContent = part;
            fragment.appendChild(span);
            words.push(part);
            index++;
          }
        }

        node.parentNode?.replaceChild(fragment, node);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Walk children in reverse-safe way (snapshot first)
        const children = Array.from(node.childNodes);
        for (const child of children) {
          walk(child);
        }
      }
    }

    walk(container);
    wrappedRef.current = true;
    wordsRef.current = words;
    return words;
  }, [containerRef]);

  // Reset when container content changes
  const reset = useCallback(() => {
    wrappedRef.current = false;
    wordsRef.current = [];
  }, []);

  return { wrapWords, reset, wordsRef };
}

/**
 * Updates word highlight classes based on the active word index.
 * Operates directly on the DOM for performance (no React re-renders).
 */
export function syncHighlight(
  container: HTMLElement | null,
  activeIndex: number,
) {
  if (!container) return;

  const allWords = container.querySelectorAll<HTMLSpanElement>(".tp-word");
  for (const span of allWords) {
    const idx = Number(span.dataset.w);
    span.classList.remove("tp-active", "tp-past", "tp-future");
    if (idx === activeIndex) {
      span.classList.add("tp-active");
    } else if (idx < activeIndex) {
      span.classList.add("tp-past");
    } else {
      span.classList.add("tp-future");
    }
  }
}
