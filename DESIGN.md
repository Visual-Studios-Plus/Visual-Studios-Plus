# Corporate Profile: design system

The `/profile/` page presents the studio's work the way a top agency's case
study does. Reference: TBWA's case page for *The Gaming Flute* (Skittles), at
tbwa.com/work/gaming-flute-skittles. We borrow its **system**: quiet layout,
editorial serif type, two surfaces, a single accent and a data-bite results
row. We don't copy its brand, logo, fonts or content.

## Principles

1. **The work is the hero.** Media sits square-cornered and unrotated: no
   tilted collages, no drifting background text.
2. **Editorial calm.** Big light serif headlines, small plain sans body, lots
   of air. Motion only builds things in as they arrive. Nothing loops in the
   background.
3. **Two surfaces, one accent.** Near-black for the openers, warm stone for
   the detail. Yellow appears only in the slash marks and the figures.
4. **Every project proves itself.** Each case ends on a results row of three
   figures. We use real numbers only and never invent KPIs.

## Colour

| Token            | Value     | Use                                         |
| ---------------- | --------- | ------------------------------------------- |
| `--tb-night`     | `#0A0A0D` | Hero / case-opener slides, closing          |
| `--tb-stone`     | `#EBE8DD` | Gallery and detail slides                   |
| `--tb-ink`       | `#0A0A0D` | Text on stone                               |
| `--tb-paper`     | `#FFFFFF` | Headlines on night                          |
| `--tb-body`      | `#D9D9D9` | Body copy on night                          |
| `--tb-mute`      | `#4D4D4D` | Labels on stone (figure captions)           |
| `--tb-yellow`    | `#FECC00` | Slash marks, results figures, active nav    |
| `--tb-rule`      | currentColor at 25% | Hairlines                          |

Brand colours from the PDF don't flood the slides. A brand shows only
through its own logo and imagery.

## Type

| Role                     | Font              | Size (desktop)              | Weight | Notes                  |
| ------------------------ | ----------------- | --------------------------- | ------ | ---------------------- |
| Case title (H1)          | Instrument Serif  | `clamp(3rem, 5.6vw, 5.5rem)`| 400    | -0.03em, line-height 1 |
| Client (H3)              | Instrument Serif  | `clamp(1.6rem, 2.6vw, 3rem)`| 400    | Under the title        |
| Section label (H6)       | Instrument Serif  | `1.55rem`                   | 400    | Led by a yellow slash  |
| Body                     | Jost              | `1.05–1.1rem`               | 300    | line-height 1.45       |
| Figure                   | Instrument Serif  | `clamp(3.6rem, 6.4vw, 6.6rem)` | 400 | Yellow; unit in `<sup>`|
| Figure caption           | Jost              | `0.85rem`                   | 400    | Muted, max 13rem       |
| Meta / breadcrumbs       | Jost              | `0.72rem`                   | 500    | Caps, 0.16em tracking  |

Instrument Serif stands in for TBWA's ITC Garamond Light. Jost stands in for
their grotesk. Both are already loaded by `index.html`.

## Components

- **Slash label.** A small serif section heading (*Overview*, *The Results*)
  with a short, slanted yellow bar before it (`.tbLabel`).
- **Case opener** (`.cpStory`). Night surface. On the left: meta line, title,
  client, slash label "Overview", body copy, deliverables as a plain list,
  results row. On the right: one lead image, square-cornered, full height. The
  extra collage frames and logo tile are hidden.
- **Results row** (`.cpKpi`). A hairline, the slash label "The Results", then
  three columns, each a yellow serif figure with a caption under it. Words
  (e.g. "Asia's 50 Best") are set smaller so they fit.
- **Gallery slide** (`.cpGal`). Stone surface, ink text. Caption as a slash
  label. Media keeps its own layout (grid, phones, laptop, wall …).
- **Navigation.** The glass category bar stays. Its active pill turns yellow
  with ink text.

## Layout & spacing

- Max content width `var(--maxw)`. On desktop the opener's columns run 5 : 6.
- Section padding: `clamp(5rem, 11vh, 7.5rem)` top (clears the header) and
  `7rem` bottom (clears the category bar).
- Hairlines are 1px at 25% of the text colour.

## Motion

- Slides build on arrival: the image unveils with a clip, and the copy rises
  line by line (60 ms stagger).
- No looping marquees, no background drift, no pointer tilt on openers.
- `prefers-reduced-motion` shows everything static.

## Mobile (< 900px)

Single column: image first, then copy. Figures shrink to
`clamp(2.8rem, 13vw, 4rem)`, and the results row stays 3-up.

## Files

- `src/styles/profile-tbwa.css`: the theme layer, loaded last.
- `src/components/profile/CaseStories.jsx`: opener markup and results row.
- Real KPIs: `kpis: [ [ value, label ], … ]` on a story in
  `src/data/profileStories.js`.
