import { createCn } from "cn/config"

// Teach the merger the Precise tokens, or `text-section text-ink` collapses to one class
export const cn = createCn({
  extend: {
    classGroups: {
      "font-size": [{ text: ["hero", "title", "featured", "section", "body", "ui", "small", "reading"] }],
      rounded: [{ rounded: ["control", "surface"] }],
      shadow: [{ shadow: ["lift", "chosen"] }],
    },
  },
})
