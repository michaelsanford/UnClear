// Selectors and text patterns that identify Clear verification prompts
const CLEAR_SELECTORS = [
  // iframes embedding Clear's verification flow
  'iframe[src*="clearme.com"]',
  'iframe[src*="clearidentity.com"]',
  'iframe[src*="clear.com"]',
  'iframe[title*="CLEAR"]',
  'iframe[title*="Clear"]',

  // LinkedIn "Verify now" / "Verify with CLEAR" links — href is stable, class names are not
  'a[href*="linkedin.com/verify"]',
  'a[href*="/verify/?entryPoint"]',

  // LinkedIn "Add verification badge" link on profile selfview topcard
  'a[href*="linkedin.com/trust/verification"]',
  'a[href*="/trust/verification"]',

  // LinkedIn-specific Clear banner/modal containers
  '[data-test-id*="clear"]',
  '[data-tracking-control-name*="clear"]',
  '[aria-label*="CLEAR"]',
  '[aria-label*="Verify with CLEAR"]',

  // Generic modal/banner wrappers that mention Clear
  '.clear-verification',
  '.clear-prompt',
  '#clear-modal',
  '#clear-banner',
];

// Text phrases that indicate a Clear prompt (case-insensitive)
const CLEAR_TEXT_PATTERNS = [
  /verify\s+(with\s+)?clear/i,
  /verif(y|ied)\s+by\s+clear/i,
  /clear\s+(identity|verification|verified)/i,
  /powered\s+by\s+clear/i,
  /trusted\s+by\s+clear/i,
  /use\s+clear\s+to\s+verify/i,
  /add\s+verification\s+badge/i,
];

function isLikelyClearNode(el) {
  const text = el.innerText || el.textContent || "";
  return CLEAR_TEXT_PATTERNS.some((re) => re.test(text));
}

// Walk up the DOM to find the closest safe container to remove.
function findDismissibleAncestor(el) {
  let node = el;
  while (node && node !== document.body) {
    const role = node.getAttribute && node.getAttribute("role");
    const tag = node.tagName && node.tagName.toLowerCase();

    // LinkedIn wraps each nav menu item's secondary action in a div with
    // data-display-contents="true" — it holds only the verify link, safe to remove whole.
    if (node !== el && node.getAttribute && node.getAttribute("data-display-contents") === "true") {
      return node;
    }

    // Stop at modal/dialog/banner-like containers
    if (
      role === "dialog" ||
      role === "alertdialog" ||
      role === "banner" ||
      tag === "dialog" ||
      node.classList.contains("modal") ||
      node.classList.contains("artdeco-modal") ||
      node.classList.contains("msg-overlay-bubble-header") ||
      // LinkedIn uses these for promoted banners
      node.classList.contains("scaffold-layout__aside") ||
      node.classList.contains("ad-banner-container")
    ) {
      return node;
    }

    // If the node is small enough to be a self-contained promo card, stop here
    const style = window.getComputedStyle(node);
    if (
      (style.position === "fixed" || style.position === "sticky") &&
      node !== document.documentElement
    ) {
      return node;
    }
    node = node.parentElement;
  }
  return el;
}

function removeNode(node) {
  if (node && node.parentNode) {
    node.parentNode.removeChild(node);
  }
}

function scanAndRemove() {
  // 1. Remove by CSS selector
  CLEAR_SELECTORS.forEach((sel) => {
    document.querySelectorAll(sel).forEach((el) => removeNode(findDismissibleAncestor(el)));
  });

  // 2. Remove by text content — scan leaf-ish nodes to avoid false positives
  const walker = document.createTreeWalker(
    document.body || document.documentElement,
    NodeFilter.SHOW_ELEMENT,
    {
      acceptNode(node) {
        // Skip script/style/noscript
        const tag = node.tagName.toLowerCase();
        if (tag === "script" || tag === "style" || tag === "noscript") {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    }
  );

  const candidates = [];
  while (walker.nextNode()) {
    const node = walker.currentNode;
    // Only check nodes whose own text (not children) contains a pattern,
    // or small subtrees (< 200 chars) to avoid matching the whole page body.
    const ownText = Array.from(node.childNodes)
      .filter((n) => n.nodeType === Node.TEXT_NODE)
      .map((n) => n.textContent)
      .join("");
    if (CLEAR_TEXT_PATTERNS.some((re) => re.test(ownText))) {
      candidates.push(node);
    }
  }

  candidates.forEach((el) => {
    const target = findDismissibleAncestor(el);
    // Safety: don't remove the whole body or html
    if (target !== document.body && target !== document.documentElement) {
      removeNode(target);
    }
  });
}

// Run once as soon as the DOM is available
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", scanAndRemove);
} else {
  scanAndRemove();
}

// Watch for dynamically injected prompts (LinkedIn is a SPA)
const observer = new MutationObserver((mutations) => {
  let shouldScan = false;
  for (const mutation of mutations) {
    if (mutation.addedNodes.length > 0) {
      shouldScan = true;
      break;
    }
  }
  if (shouldScan) {
    scanAndRemove();
  }
});

observer.observe(document.documentElement, { childList: true, subtree: true });

// Exported for testing only — `module` is not defined in browser content scripts
if (typeof module !== "undefined") {
  module.exports = { CLEAR_SELECTORS, CLEAR_TEXT_PATTERNS, isLikelyClearNode, findDismissibleAncestor, removeNode, scanAndRemove };
}
