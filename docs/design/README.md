# Design system

Source of truth for visual tokens. `src/styles.css` `@theme` holds the implementation; values there
change only alongside this doc.

**Status:** placeholder tokens. The Joinery design-system tokens (colour, type scale, spacing,
radius, elevation) are still to be supplied. Fonts (Bitter, Karla, IBM Plex Mono, self-hosted) wait
on their ADR.

Checklist for every UI change:

- Tokens only; no raw hex or arbitrary values in components.
- WCAG 2.2 AA contrast for text and focus indicators.
- Visible focus, keyboard reachable, `prefers-reduced-motion` respected.
- English and French text fit without truncation (French runs ~20% longer).
