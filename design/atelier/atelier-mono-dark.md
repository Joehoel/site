# Design System Specification: Technical Precision & Editorial Depth

> **Atelier Mono — Dark** · "The Monastic Engineer"
> Source: Google Stitch · project `joelkuijper.me` (12493485330470827314) · asset `f4b6723c2a4341a498518c0f3589e85a`

## 1. Overview & Creative North Star

**Creative North Star: The Monastic Engineer**

This design system is built for a solo developer portfolio that demands the precision of a technical blueprint with the aesthetic restraint of a high-end architectural journal. We are moving away from "generic tech" layouts. Instead, we embrace **Functional Brutalism**—where the beauty is derived from the structure, the mono-spaced clarity, and the absence of decorative noise.

To break the "template" look, this system utilizes **intentional asymmetry** and **tonal layering**. We avoid the traditional boxed-in grid, opting instead for expansive whitespace and text-heavy layouts where the hierarchy is so sharp it feels engineered, not just designed.

---

## 2. Colors: The Monochromatic Spectrum

The palette is strictly monochromatic, using a range of blacks, greys, and pure whites to define function through value rather than hue.

### Surface Hierarchy & The "No-Line" Rule

Traditional portfolios rely on 1px borders to separate content. **We prohibit this.** Boundaries must be defined solely through background color shifts or subtle tonal transitions.

- **Surface Foundation:** Use `surface` (#131313) for the main canvas.
- **Layering Logic:** Use `surface_container_low` (#1C1B1B) for large sectioning and `surface_container_highest` (#353534) for interactive elements like cards or code blocks.
- **The Signature Texture:** For main CTAs or hero sections, use a subtle linear gradient from `primary` (#FFFFFF) to `secondary` (#C7C6C6) at a 45-degree angle. This provides a "machined metal" sheen that feels premium and intentional.

### The Glass & Gradient Rule

Floating navigation or modal overlays must use **Glassmorphism**. Apply a background of `surface_container` at 70% opacity with a `24px` backdrop blur. This prevents the UI from feeling "pasted on" and allows the technical content to bleed through the edges.

---

## 3. Typography: Technical Authority

We pair the geometric rigor of **Space Grotesk** with the clean, utilitarian legibility of **Manrope**.

- **Display & Headlines (Space Grotesk):** Used for large-scale impact. The wide apertures and geometric forms suggest engineering precision.
  - _Display-LG (3.5rem):_ Use for hero statements. Set with `-0.04em` letter spacing for an "editorial" look.
- **Titles & Body (Manrope):** Chosen for its exceptional readability in technical deep dives.
  - _Title-LG (1.375rem):_ Use for article headers and project titles.
  - _Body-MD (0.875rem):_ The workhorse for documentation and case studies.
- **Labels (Space Grotesk):**
  - _Label-SM (0.6875rem):_ All-caps with `0.1em` letter spacing. Use this for "Meta" data (e.g., TECH STACK, TIMESTAMP, STATUS) to evoke a technical terminal feel.

---

## 4. Elevation & Depth: Tonal Layering

Depth is achieved through "stacking" surface tiers, mimicking physical sheets of dark material.

- **The Layering Principle:** To lift a card from the background, do not use a shadow. Place a `surface_container_low` element on a `surface` background. For internal components within that card, move to `surface_container_high`.
- **Ambient Shadows:** If a floating effect is required (e.g., a dropdown), use an extra-diffused shadow: `offset: 0 20px, blur: 40px, color: rgba(0,0,0,0.5)`. The shadow must feel like a soft occlusion of light, not a "glow."
- **The "Ghost Border" Fallback:** If a border is required for accessibility in input fields, use `outline_variant` (#474747) at **20% opacity**. It should be felt more than seen.
- **Hard Edges:** The `roundedness` scale is set to `0px` across the board. Every corner is a sharp 90-degree angle, reinforcing the "engineered" aesthetic.

---

## 5. Components: Functional Primitives

### Buttons

- **Primary:** Solid `primary` (#FFFFFF) background with `on_primary` (#1A1C1C) text. No border. Sharp corners.
- **Secondary:** `surface_container_highest` background. Subtle and integrated.
- **Tertiary:** Ghost style. No background. `primary` text with an underline that only appears on hover.

### Technical Cards & Code Blocks

- **Forbid Divider Lines:** Separate code snippets from prose using a background shift to `surface_container_lowest` (#0E0E0E).
- **The "Spec" Header:** Every card or code block should lead with a `label-sm` header (e.g., `// SOURCE_CODE`) to maintain the engineer persona.

### Input Fields

- **State:** Default state is a `surface_container` fill.
- **Active State:** Transitions to a `primary` ghost border (20% opacity) with a `primary` cursor blink. No "glow" effects.

### Data Chips

- Used for tech stacks (e.g., React, Rust).
- Style: `surface_container_high` background, `label-md` typography. Rectangular and tight padding (4px 12px).

---

## 6. Do's and Don'ts

### Do:

- **Do** use asymmetrical layouts. Push content to the right, leaving the left column for vertical `label-sm` metadata.
- **Do** use high-contrast typography scales. A massive `display-lg` headline next to a tiny `body-sm` caption creates a sophisticated, editorial feel.
- **Do** leverage whitespace. If a section feels crowded, double the padding rather than adding a border.

### Don't:

- **Don't** use 1px solid borders for sectioning. It breaks the "monastic" feel and looks like a generic framework.
- **Don't** use rounded corners. Even a 2px radius destroys the technical precision of this system.
- **Don't** use "Drop Shadows" to create hierarchy. Use Tonal Layering (Surface-to-Surface contrast) instead.
- **Don't** use accent colors. Stick to the monochromatic tokens provided; hierarchy must be earned through size, weight, and value.
