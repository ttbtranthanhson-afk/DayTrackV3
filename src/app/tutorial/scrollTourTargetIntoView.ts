const EDGE = 8;

function isScroller(el: HTMLElement): boolean {
  const oy = el.ownerDocument.defaultView!.getComputedStyle(el).overflowY;
  if (oy !== 'auto' && oy !== 'scroll' && oy !== 'overlay') return false;
  return el.scrollHeight - el.clientHeight > 1;
}

/**
 * Bring a tour target into the viewport, scrolling the scrollable container
 * that actually holds it (modal card, inner list) and finally the document —
 * so the spotlight points at the real element, not empty space.
 *
 * Only scrolls when the target is (partly) outside the viewport; if it is
 * already fully visible this is a no-op, keeping the tour calm and stable.
 * Returns true when a scroll was applied.
 */
export function scrollTourTargetIntoView(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return false;

  const vh = window.innerHeight;
  const fits = rect.height <= vh - EDGE * 2;

  // Already fully visible (or, if taller than the screen, its top is).
  if (fits && rect.top >= EDGE && rect.bottom <= vh - EDGE) return false;
  if (!fits && rect.top >= EDGE) return false;

  const desiredTop = fits ? Math.max(EDGE, (vh - rect.height) / 2) : EDGE;
  const need = rect.top - desiredTop;
  if (Math.abs(need) < 1) return false;

  // Innermost scrollable ancestors first, then the document itself.
  const scrollers: HTMLElement[] = [];
  let node = el.parentElement;
  while (node) {
    if (isScroller(node)) scrollers.push(node);
    node = node.parentElement;
  }
  const root = document.scrollingElement as HTMLElement | null;
  if (root) scrollers.push(root);

  let remaining = need;
  let moved = false;
  for (const s of scrollers) {
    if (Math.abs(remaining) < 1) break;
    const max = s.scrollHeight - s.clientHeight;
    const cur = s.scrollTop;
    const apply = Math.round(
      remaining > 0 ? Math.min(remaining, max - cur) : Math.max(remaining, -cur),
    );
    if (apply === 0) continue;
    s.scrollTop = cur + apply;
    remaining -= apply;
    moved = true;
  }

  return moved;
}
