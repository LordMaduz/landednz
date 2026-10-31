import { createCn } from "cn/config"

// Teach the merger the role tokens, or `text-section text-fg` collapses to one class
export const cn = createCn({
  extend: {
    theme: {
      radius: ["control", "card", "floating"],
      shadow: [
        "raised", "floating", "overlay", "overlay-up", "frame-top", "frame-bottom",
        "chosen", "error", "today", "rail", "pin",
      ],
      spacing: ["page-gutter", "card-padding", "section-gap", "stack-gap", "tab-bar", "rail-indent", "sheet-clear"],
    },
    classGroups: {
      "font-size": [{ text: ["hero", "title", "featured", "section", "body", "ui", "small", "reading"] }],
    },
  },
})
