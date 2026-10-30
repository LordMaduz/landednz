# Type sizes: published industry scales (read 2026-10-30)

Every value below was read from the system's own page on 2026-10-30, except Material 3 sizes (see note).

## Sources
- Apple HIG, Typography → Specifications, iOS/iPadOS Dynamic Type "Large (default)": https://developer.apple.com/design/human-interface-guidelines/typography
- Atlassian Design System, Typography: https://atlassian.design/foundations/typography
- IBM Carbon, Type sets (productive): https://carbondesignsystem.com/elements/typography/type-sets/
- GitHub Primer, Typography tokens: https://primer.style/product/primitives/typography/
- Material Design 3, Applying type (usage text): https://m3.material.io/styles/typography/applying-type
- Material Design 3 sizes: https://developer.android.com/develop/ui/compose/designsystems/material3#typography (the m3.material.io token table would not render; the Compose page was read through a summarising fetch, so these sizes are not verbatim)

## Raw scales (px / pt)

| System | Titles | Headings | Body | Small |
|---|---|---|---|---|
| Apple iOS default | Large Title 34, Title 1 28, Title 2 22 | Title 3 20, Headline 17 semibold | Body 17, Callout 16, Subhead 15 | Footnote 13, Caption 1 12, Caption 2 11 (min 11) |
| Atlassian | xxlarge 32, xlarge 28, large 24 | medium 20, small 16, xsmall 14, xxsmall 12 (all bold) | body.large 16, body (default) 14 | body.small 12 |
| Carbon (productive) | heading-05 32, heading-04 28 | heading-03 20, heading-compact-01 / heading-01 14 semibold (heading-02 16 semibold, expressive) | body-01 / body-compact-01 14 (body-02 16, expressive) | label-01 12, helper-text-01 12 |
| Primer | title large 32 | title medium 20, title small 16 (600) | body large 16, body medium 14 | body small 12, caption 12 |
| Material 3 | Headline L/M/S 32/28/24 | Title L/M/S 22/16/14 (medium) | Body L/M 16/14 | Body S 12, Label L/M/S 14/12/11 |

## Usage rules, quoted

- Atlassian: "XL" and "L" are suitable for page titles in apps; "S" and "XS" are for titles in small components where space is limited; "Body L" is the default size for long-form content; "Body M (Default)" is the default size in components or where space is limited; "Body S" … for secondary level content such as fine print.
- Carbon: heading-compact-01 "is for component and layout headings. It pairs with $body-compact-01"; label-01 "can be used for field labels in components, error messages, and captions. It should not be used for body copy."
- Material 3: Title "should be used for medium-emphasis text … to divide secondary passages of text or secondary regions of content"; Label "smaller, utilitarian styles, used for things like the text inside components … Buttons, for example, use the label large style"; line height about 1.2× for title/headline/display, about 1.5× for body and label.
- Apple: "Adjust font weight, size, and color as needed to emphasize important information and help people visualize hierarchy."

## What they agree on
- Page title in an app: **24–28** (Apple 28, Atlassian 24/28, Carbon 28, Material 24/28).
- Heading of a card or small region: **14–16, bold or semibold, same size as the text around it or one step above**, with weight doing the work (Atlassian S/XS, Carbon heading-compact-01, Primer title small, Material Title M/S). None puts it smaller than the body text, and none uses grey for it.
- A featured content heading: **20** (Apple Title 3, Atlassian M, Carbon heading-03, Primer title medium).
- Text inside components (list rows, buttons, nav): **14** on the web systems; Apple uses 15–17 on iOS.
- Long-form reading: **16**.
- Small, secondary text: **12** (Apple 12–13).
