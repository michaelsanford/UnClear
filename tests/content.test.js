"use strict";

// content.js has side effects (MutationObserver, DOMContentLoaded) that fire at
// require-time. We use isolateModules + a fresh require each test group so the
// side effects run against a clean jsdom document.

let CLEAR_SELECTORS, CLEAR_TEXT_PATTERNS, isLikelyClearNode,
    findDismissibleAncestor, removeNode, scanAndRemove;

beforeEach(() => {
  // Reset the document body before each test
  document.body.innerHTML = "";
  jest.isolateModules(() => {
    ({
      CLEAR_SELECTORS,
      CLEAR_TEXT_PATTERNS,
      isLikelyClearNode,
      findDismissibleAncestor,
      removeNode,
      scanAndRemove,
    } = require("../content.js"));
  });
});

// ---------------------------------------------------------------------------
// CLEAR_TEXT_PATTERNS
// ---------------------------------------------------------------------------
describe("CLEAR_TEXT_PATTERNS", () => {
  const shouldMatch = [
    "Verify with CLEAR",
    "verify with clear",
    "Verify by CLEAR",
    "verified by Clear",
    "CLEAR identity",
    "CLEAR verification",
    "CLEAR verified",
    "Powered by CLEAR",
    "Trusted by CLEAR",
    "Use CLEAR to verify",
    "Add verification badge",
  ];

  const shouldNotMatch = [
    "Clear your cookies",
    "It is clear that",
    "In a clear manner",
    "Crystal clear water",
    "Clear skies ahead",
  ];

  test.each(shouldMatch)("matches: %s", (text) => {
    const matches = CLEAR_TEXT_PATTERNS.some((re) => re.test(text));
    expect(matches).toBe(true);
  });

  test.each(shouldNotMatch)("does not match: %s", (text) => {
    const matches = CLEAR_TEXT_PATTERNS.some((re) => re.test(text));
    expect(matches).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// CLEAR_SELECTORS
// ---------------------------------------------------------------------------
describe("CLEAR_SELECTORS", () => {
  test("contains expected iframe selectors", () => {
    expect(CLEAR_SELECTORS).toContain('iframe[src*="clearme.com"]');
    expect(CLEAR_SELECTORS).toContain('iframe[src*="clearidentity.com"]');
  });

  test("contains LinkedIn verify link selectors", () => {
    expect(CLEAR_SELECTORS).toContain('a[href*="linkedin.com/verify"]');
  });

  test("all selectors are valid CSS (parseable by querySelectorAll)", () => {
    CLEAR_SELECTORS.forEach((sel) => {
      expect(() => document.querySelectorAll(sel)).not.toThrow();
    });
  });
});

// ---------------------------------------------------------------------------
// isLikelyClearNode
// ---------------------------------------------------------------------------
describe("isLikelyClearNode", () => {
  test("returns true when element text contains a CLEAR pattern", () => {
    const el = document.createElement("div");
    el.textContent = "Verify with CLEAR to continue";
    expect(isLikelyClearNode(el)).toBe(true);
  });

  test("returns false for unrelated text", () => {
    const el = document.createElement("div");
    el.textContent = "Sign in to LinkedIn";
    expect(isLikelyClearNode(el)).toBe(false);
  });

  test("is case-insensitive", () => {
    const el = document.createElement("div");
    el.textContent = "powered by clear";
    expect(isLikelyClearNode(el)).toBe(true);
  });

  test("returns false for empty element", () => {
    const el = document.createElement("div");
    expect(isLikelyClearNode(el)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// removeNode
// ---------------------------------------------------------------------------
describe("removeNode", () => {
  test("removes node from its parent", () => {
    const parent = document.createElement("div");
    const child = document.createElement("span");
    parent.appendChild(child);
    document.body.appendChild(parent);

    removeNode(child);
    expect(parent.contains(child)).toBe(false);
  });

  test("does not throw when node has no parent", () => {
    const orphan = document.createElement("div");
    expect(() => removeNode(orphan)).not.toThrow();
  });

  test("does not throw when called with null", () => {
    expect(() => removeNode(null)).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// findDismissibleAncestor
// ---------------------------------------------------------------------------
describe("findDismissibleAncestor", () => {
  test("returns the element itself when no special ancestor exists", () => {
    const el = document.createElement("span");
    const div = document.createElement("div");
    div.appendChild(el);
    document.body.appendChild(div);

    expect(findDismissibleAncestor(el)).toBe(el);
  });

  test("stops at role=dialog ancestor", () => {
    const dialog = document.createElement("div");
    dialog.setAttribute("role", "dialog");
    const inner = document.createElement("span");
    dialog.appendChild(inner);
    document.body.appendChild(dialog);

    expect(findDismissibleAncestor(inner)).toBe(dialog);
  });

  test("stops at role=alertdialog ancestor", () => {
    const dialog = document.createElement("div");
    dialog.setAttribute("role", "alertdialog");
    const inner = document.createElement("span");
    dialog.appendChild(inner);
    document.body.appendChild(dialog);

    expect(findDismissibleAncestor(inner)).toBe(dialog);
  });

  test("stops at role=banner ancestor", () => {
    const banner = document.createElement("header");
    banner.setAttribute("role", "banner");
    const inner = document.createElement("a");
    banner.appendChild(inner);
    document.body.appendChild(banner);

    expect(findDismissibleAncestor(inner)).toBe(banner);
  });

  test("stops at <dialog> element", () => {
    const dialog = document.createElement("dialog");
    const inner = document.createElement("p");
    dialog.appendChild(inner);
    document.body.appendChild(dialog);

    expect(findDismissibleAncestor(inner)).toBe(dialog);
  });

  test("stops at .modal ancestor", () => {
    const modal = document.createElement("div");
    modal.classList.add("modal");
    const inner = document.createElement("button");
    modal.appendChild(inner);
    document.body.appendChild(modal);

    expect(findDismissibleAncestor(inner)).toBe(modal);
  });

  test("stops at data-display-contents ancestor (not the element itself)", () => {
    const wrapper = document.createElement("div");
    wrapper.setAttribute("data-display-contents", "true");
    const inner = document.createElement("a");
    wrapper.appendChild(inner);
    document.body.appendChild(wrapper);

    expect(findDismissibleAncestor(inner)).toBe(wrapper);
  });

  test("does not walk past <nav> — returns original element instead", () => {
    const nav = document.createElement("nav");
    const ul = document.createElement("ul");
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = "/verify/?entryPoint=me_navigation_menu";
    li.appendChild(a);
    ul.appendChild(li);
    nav.appendChild(ul);
    document.body.appendChild(nav);

    expect(findDismissibleAncestor(a)).toBe(a);
  });

  test("does not walk past <main> — returns original element instead", () => {
    const main = document.createElement("main");
    const inner = document.createElement("span");
    main.appendChild(inner);
    document.body.appendChild(main);

    expect(findDismissibleAncestor(inner)).toBe(inner);
  });

  test("never returns document.body", () => {
    // Element directly in body with no special ancestors
    const el = document.createElement("span");
    document.body.appendChild(el);
    const result = findDismissibleAncestor(el);
    expect(result).not.toBe(document.body);
  });
});

// ---------------------------------------------------------------------------
// scanAndRemove — integration tests
// ---------------------------------------------------------------------------
describe("scanAndRemove", () => {
  test("removes iframe with clearme.com src", () => {
    const iframe = document.createElement("iframe");
    iframe.src = "https://clearme.com/verify";
    document.body.appendChild(iframe);

    scanAndRemove();
    expect(document.body.contains(iframe)).toBe(false);
  });

  test("removes link pointing to linkedin.com/verify", () => {
    const a = document.createElement("a");
    a.href = "https://www.linkedin.com/verify/?entryPoint=nav";
    document.body.appendChild(a);

    scanAndRemove();
    expect(document.body.contains(a)).toBe(false);
  });

  test("removes element by text content match", () => {
    const div = document.createElement("div");
    div.textContent = "Verify with CLEAR";
    document.body.appendChild(div);

    scanAndRemove();
    expect(document.body.contains(div)).toBe(false);
  });

  test("does not remove unrelated elements", () => {
    const div = document.createElement("div");
    div.textContent = "Welcome to LinkedIn";
    document.body.appendChild(div);

    scanAndRemove();
    expect(document.body.contains(div)).toBe(true);
  });

  test("does not remove document.body", () => {
    // Even if body contains CLEAR text directly, we should not remove body
    document.body.textContent = "Verify with CLEAR";
    scanAndRemove();
    expect(document.body).toBeTruthy();
    expect(document.documentElement.contains(document.body)).toBe(true);
  });

  test("removes .clear-verification element", () => {
    const el = document.createElement("div");
    el.className = "clear-verification";
    document.body.appendChild(el);

    scanAndRemove();
    expect(document.body.contains(el)).toBe(false);
  });

  test("removes element with aria-label containing CLEAR", () => {
    const el = document.createElement("section");
    el.setAttribute("aria-label", "Verify with CLEAR");
    document.body.appendChild(el);

    scanAndRemove();
    expect(document.body.contains(el)).toBe(false);
  });

  test("removes the modal container, not just the inner link", () => {
    const modal = document.createElement("div");
    modal.setAttribute("role", "dialog");
    const a = document.createElement("a");
    a.href = "https://www.linkedin.com/verify/?entryPoint=profile";
    modal.appendChild(a);
    document.body.appendChild(modal);

    scanAndRemove();
    expect(document.body.contains(modal)).toBe(false);
  });

  test("skips script and style elements during text scan", () => {
    const script = document.createElement("script");
    script.textContent = 'console.log("verify with CLEAR")';
    document.body.appendChild(script);

    scanAndRemove();
    expect(document.body.contains(script)).toBe(true);
  });

  test("handles empty document body gracefully", () => {
    expect(() => scanAndRemove()).not.toThrow();
  });
});
