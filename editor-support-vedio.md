# 📦 Generic Embed (Video/Media) System — Implementation Plan

## 🎯 Goal

Implement a **generic embed system** in your Tiptap editor that allows users to insert:

* YouTube videos
* Vimeo videos
* TikTok embeds
* Any iframe-supported content

And ensure it:

* Works inside the editor ✅
* Persists in JSON ✅
* Renders correctly on the frontend ✅
* Has no TypeScript/runtime errors ✅

---

# 🧱 PHASE 1 — Create Embed Extension

## Task 1: Create custom Tiptap extension

Create file:

```
/components/editor/extensions/embed.ts
```

### Requirements:

* Node name: `embed`
* Group: `block`
* Atom: true (important)
* Draggable: true

### Attributes:

```ts
{
  src: string
}
```

### Parse HTML:

* Should detect `<iframe src="...">`

### Render HTML:

```ts
return [
  "div",
  { class: "embed-container" },
  [
    "iframe",
    {
      src: node.attrs.src,
      frameborder: "0",
      allowfullscreen: "true",
    },
  ],
];
```

---

## ⚠️ Common mistakes to avoid

* ❌ Forgetting `atom: true` → causes editing bugs
* ❌ Not wrapping iframe → breaks layout
* ❌ Allowing raw HTML input → security risk

---

# 🎨 PHASE 2 — Styling (CRITICAL)

## Task 2: Add global styles

In `globals.css`:

```css
.embed-container {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; /* 16:9 ratio */
  margin: 1rem 0;
}

.embed-container iframe {
  position: absolute;
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 12px;
}
```

---

## ⚠️ Common mistakes

* ❌ Not using aspect ratio → broken video layout
* ❌ Fixed width/height → not responsive

---

# ⚙️ PHASE 3 — Add to Editor

## Task 3: Register extension

In your editor:

```ts
import Embed from "./extensions/embed";

extensions: [
  StarterKit,
  Image,
  Link,
  Embed,
]
```

---

# 🧠 PHASE 4 — Embed Command

## Task 4: Create insert function

Add helper:

```ts
function insertEmbed(editor, url: string) {
  editor.chain().focus().insertContent({
    type: "embed",
    attrs: { src: url },
  }).run();
}
```

---

# 🎛️ PHASE 5 — UI (Insert Video Modal)

## Task 5: Create EmbedModal.tsx

### Features:

* Input field (URL)
* Validate URL
* Insert button

### Validation:

```ts
function isValidEmbed(url: string) {
  return (
    url.includes("youtube.com") ||
    url.includes("youtu.be") ||
    url.includes("vimeo.com") ||
    url.includes("tiktok.com")
  );
}
```

---

## Task 6: Connect to Toolbar

* Add button: "Insert Video"
* Opens modal
* On submit → call `insertEmbed`

---

## ⚠️ Mistakes to avoid

* ❌ Inserting invalid URLs
* ❌ Not focusing editor before insert
* ❌ Not closing modal after insert

---

# 🖥️ PHASE 6 — Frontend Rendering (IMPORTANT)

## Task 7: Update BlogRenderer

You MUST include Embed extension:

```ts
extensions: [
  StarterKit,
  Image,
  Link,
  Embed, // REQUIRED
]
```

---

## Why this matters

If you skip this:

* ❌ Videos appear in editor
* ❌ Videos disappear in frontend

---

# 🔒 PHASE 7 — Security

## Task 8: Sanitize URLs

Before inserting:

```ts
function sanitizeUrl(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.toString();
  } catch {
    return null;
  }
}
```

---

## ⚠️ Never allow:

* `<iframe>` raw HTML input
* unvalidated URLs

---

# 🧪 PHASE 8 — Testing

## Test cases

### Editor:

* Insert YouTube link → shows video
* Insert Vimeo → works
* Invalid link → rejected

### Frontend:

* Video renders
* Responsive layout
* No console errors

---

# ⚡ PHASE 9 — TypeScript Safety

## Task 9: Define types

```ts
type EmbedAttrs = {
  src: string;
};
```

Ensure:

* No `any`
* Proper typing in extension

---

# 🚀 FINAL RESULT

After implementation:

### Editor:

* Users paste video links
* Videos appear inline

### Frontend:

* Videos render perfectly
* Fully responsive
* Stored in JSON

---

# 🧠 BONUS (Optional Improvements)

* Auto-detect paste → convert to embed
* Preview before insert
* Resize support

---

# 🏁 DONE CRITERIA

✅ No TypeScript errors
✅ No runtime errors
✅ Works in editor + frontend
✅ Responsive videos
✅ Clean UX

---

## 💬 Final Advice

Start simple:

1. YouTube only
2. Then expand to others

Don’t try to support everything at once — that’s where most bugs come from.
