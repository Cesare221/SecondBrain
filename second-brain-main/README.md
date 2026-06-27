# Second Brain
Stop losing your ideas — capture notes, links, snippets, and thoughts in one searchable place.

---

## Live Demo
https://second-brain-three-ashy.vercel.app/

---

## Features
- **4 item types** — Note, Idea, Link, Snippet (each color-coded for instant recognition)
- **Real-time search** — filter by content, tags, or URL with ⌘K shortcut
- **Type filters** — show All / Notes / Ideas / Links / Snippets with live counts
- **Tags** — add comma-separated tags to any item; click-to-filter
- **Pin important items** — pinned items always stay at the top
- **Copy button** — one-click to clipboard on every card
- **Snippet mode** — monospace code-like display with green accent for code/text snippets
- **Link preview** — URL stored and displayed as a clickable link on the card
- **Keyboard shortcuts** — ⌘K to focus search, ⌘↵ to save item
- **localStorage persistence** — everything survives page refreshes, nothing sent to any server
- **Masonry card grid** — variable-height cards in a 2-column Pinterest-style layout

---

## Tech Stack
- React 19 (Vite 5)
- CSS custom properties (Apple-inspired dark UI, no framework)
- CSS columns for masonry layout
- localStorage for persistence

---

## How It Works
1. Select a type (Note / Idea / Link / Snippet)
2. Write your content in the textarea
3. Optionally add a URL (for Links) and tags (comma-separated)
4. Press Add or ⌘↵ to save
5. Use the search bar or type filters to find anything instantly
6. Pin important items to keep them at the top

> Everything runs entirely in your browser. No data leaves your machine.

---

## Installation
```bash
git clone https://github.com/berkinyilmaz/second-brain.git
cd second-brain
npm install
npm run dev
```

---

## Privacy
Everything runs **locally in your browser**.
# second-brain
