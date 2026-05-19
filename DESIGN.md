# Design System: Brújula de Precios

## 1. Visual Theme & Atmosphere

A dark-first, precision-tool interface for Argentine shopkeepers who open this app multiple times a day to make real money decisions. The atmosphere is **confident and direct** — like a well-lit mercado at night: warm gold accents cutting through deep black, every element earning its place by being useful.

Density 5/10 — balanced. Not sparse, not overwhelming. Information lives at a comfortable reading pace.
Variance 6/10 — slightly asymmetric. Lists and cards with intentional visual weight differences. The #1 bomba (best deal) must visually tower over the rest.
Motion 5/10 — fluid CSS with spring physics. Feedback that confirms action without performing.

This is not a SaaS dashboard. This is a butcher's knife: premium because it's precise, not because it has decorations.

---

## 2. Color Palette & Roles

- **Off-Black Canvas** (`#0a0a0a`) — Primary background. Not pure black — has warmth.
- **Deep Surface** (`#141414`) — Card backgrounds, list item backgrounds.
- **Raised Surface** (`#1a1a1a`) — Hero items, modals, elevated elements. Elevation = slightly lighter.
- **Overlay Dark** (`#222222`) — Drawers, bottom sheets, contextual menus.
- **Charcoal Border** (`#2a2a2a`) — Structural dividers, card borders. Never white borders on dark.
- **Caramel Gold** (`#d4a574`) — THE single accent. CTAs, active chips, rank badges, price highlights, "Mejor precio" badges. Currently zero usage — this changes now.
- **Confirmation Green** (`#16a34a`) — Exclusively for success states: saved to list, confirmed, discount badge.
- **Ink White** (`#f7f7f7`) — Primary text on dark surfaces.
- **Steel Gray** (`#6b7280`) — Secondary text, labels, metadata, subtext.
- **Ghost Border** (`rgba(255,255,255,0.06)`) — Ultra-subtle borders when `#2a2a2a` is too heavy.

**Strictly banned:** `#ffffff` as background. `#000000` pure black. Purple, neon blue, any gradient that glows. Warm-cool gray mixing.

---

## 3. Typography Rules

- **Display / Impact Numbers:** Barlow Condensed 800 — rank numbers, stat values, prices. Track-tight. Used for things that need to punch.
- **Body / UI:** Poppins 400/500/600 — navigation, labels, descriptions, product names. Clean, legible at small sizes.
- **Metadata / Mono:** Use Poppins 400 at `10-12px` for tags, timestamps, units. When density > 7, switch numbers to monospace.
- **Hierarchy:** Weight + color, not size alone. `#f7f7f7` for primary, `#6b7280` for secondary. Never use font-size as the only differentiator.
- **Max line width:** 60ch for body text. No wall of text.
- **Banned:** Inter. Georgia. Times New Roman. Garamond. Excessive gradient text on headers.

---

## 4. Component Stylings

**Buttons (Primary):**
Filled with `#d4a574` (Caramel Gold), text `#0a0a0a`. No outer glow. On active: `-1px` translate Y + `scale(0.97)` via Framer Motion `whileTap`. Border-radius `8px`. Minimum height `44px` (touch target). Never rounded-full for primary actions.

**Buttons (Secondary / Ghost):**
Border `1px solid #d4a574`, text `#d4a574`, background transparent. Same spring on tap. On hover: fill `#d4a574`, text `#0a0a0a`.

**Cards (ProductCard):**
Background `#141414`, border `1px solid #2a2a2a`. Border-radius `12px`. No box-shadow on dark — elevation through luminance only. On hover: background `#1a1a1a`, border `#333`, `scale(1.02)` + `y(-2px)` via spring. TiltedCard wrapper for 3D tilt effect on desktop.

**Cards (BombaListItem Hero — rank #1):**
Always elevated: background `#1a1a1a`, border `1px solid #d4a574` (gold border — it's special). Rank badge in `#d4a574`. Never same treatment as items #2+.

**Chips / Filters (Category):**
Rest: background `#141414`, border `1px solid #2a2a2a`, text `#6b7280`. Active: background `#d4a574`, text `#0a0a0a`, no border. Spring transition `stiffness: 400, damping: 25`. Rounded-full.

**Badges (Discount / "Mejor Precio"):**
ShinyText component. Background `#d4a574`, text `#0a0a0a`, `font-weight: 800`, `font-size: 11px`, `letter-spacing: 0.08em`, `text-transform: uppercase`. Border-radius `20px`. Never flat green for "ahorro" — use gold.

**Majority Logos (in Header / Inicio):**
Background `#141414`, border `1px solid #2a2a2a`, padding `12px 16px`. No white boxes. On dark: logos need to breathe against dark surface.

**Header:**
Position `sticky top-0`, `z-50`. Background `rgba(10,10,10,0.85)`, `backdrop-filter: blur(12px)`. Border-bottom `1px solid rgba(255,255,255,0.06)`. Glassmorphism only here — not on content cards.

**Bottom Navigation:**
Background `rgba(10,10,10,0.92)`, `backdrop-filter: blur(16px)`. Active icon: `#d4a574`. Inactive: `#6b7280`. `whileTap={{ scale: 0.9 }}` on every icon. No text labels on inactive — only active shows label.

**Stats Bar (Inicio):**
Numbers in Barlow Condensed 800, color `#d4a574`. Labels in Poppins 400, color `#6b7280`, `font-size: 11px`, uppercase. No background box — just text floating on the canvas.

**Inputs (Search, Calculadora):**
Background `#141414`, border `1px solid #2a2a2a`. Focus: border `1px solid #d4a574`. Text `#f7f7f7`. Placeholder `#6b7280`. No floating labels — label always above.

**Price Table (Detalle):**
Best price row: border-left `3px solid #d4a574`, background `#1a1a1a`. Other rows: `#141414`. Logo at 56px wide, price in Barlow Condensed 700, badge "Mejor" in gold.

**Calculadora Result:**
Precio de venta in Barlow Condensed 800, color `#d4a574`, size `32px+`. This is THE number the user cares about — make it unmissable.

**Empty States:**
Icon (lucide) in `#2a2a2a` at `48px`, title in `#6b7280`, CTA button in ghost gold style. Never just "No hay resultados" as plain text.

**Loaders:**
Skeleton shimmer with `background: linear-gradient(90deg, #141414, #1a1a1a, #141414)`. Animated via CSS `@keyframes shimmer`. No circular spinners.

---

## 5. Layout Principles

**Grid:**
Product grid: 2 columns on mobile (`< 700px`), 3-4 on desktop. `gap: 1px` with dark background creates a seamless dark-grid look (no white gutters). CSS Grid, never flexbox percentage math.

**Spacing:**
Base unit: `4px`. Scale: `4, 8, 12, 16, 20, 24, 32, 40, 48`. Never arbitrary values. Section padding: `clamp(20px, 5vw, 40px)`.

**Max Width:**
Content max-width: `600px` on mobile, `1200px` on desktop. Centered.

**Hero BombaListItem:**
Always takes 100% width. Image section 40% width on desktop, full width on mobile. Text section gets the other 60%. Rank #1 has gold border treatment.

**No overlapping:** Every element in its own spatial zone. No absolute-positioned stacking. No z-index wars.

**Mobile collapse:** All multi-column layouts collapse to single column `< 700px`. No exceptions.

**Full height:** Use `min-h-[100dvh]` never `h-screen` (iOS Safari bug).

---

## 6. Motion & Interaction

**Spring Physics (default for all interactives):**
`type: "spring", stiffness: 400, damping: 25` — snappy but not jarring. Premium, weighty feel.

**All hover/tap states:**
Replace every `onMouseEnter/Leave` with Framer Motion `whileHover` + `whileTap`. No exceptions. Import from `motion/react` (Motion v12).

**Centralized variants in `lib/motion-variants.ts`:**
`cardHover`, `btnHover`, `chipHover`, `iconTap` — used consistently across all components.

**Staggered lists:**
BombaListItem entries use `AnimatedList` with `staggerDelay: 80ms`. Never mount all items instantly.

**Aurora background:**
Behind the hero bomba section on Vista Inicio. Low opacity (`0.15`), `particleColors: ['#d4a574', '#1a1a1a']`. Subtle — never compete with the product image.

**Particles:**
If used: `particleCount: 60`, `speed: 0.02`, `alphaParticles: true`. Mobile: reduce to `particleCount: 30` via media query check.

**Performance rules:**
Animate ONLY `transform` and `opacity`. Never `width`, `height`, `top`, `left`. `will-change: transform` only on TiltedCard and heavy animated elements. `transform: translateZ(0)` on glassmorphism elements.

**Page transitions:**
`AnimatePresence` wrapping view changes. Fade + slight Y translate. Duration `200ms`.

---

## 7. Anti-Patterns (BANNED in Brújula)

- No emojis anywhere in the UI (code, labels, badges, empty states)
- No Inter font
- No pure black `#000000` — use Off-Black `#0a0a0a`
- No white backgrounds on any view — dark-first always
- No neon outer glows, no purple accents, no neon blue
- No gradients that glow or pulse (exception: Aurora background, controlled)
- No oversaturated accents — Caramel Gold `#d4a574` is the limit
- No custom mouse cursors
- No overlapping elements — strict spatial separation
- No 3-column equal card grids — use 2-column or asymmetric
- No centered Hero sections — left-aligned or asymmetric always
- No `onMouseEnter/Leave` manual event handlers — Framer Motion only
- No `<style>` tags inside component files — Tailwind + CSS variables only
- No inline hex colors in JSX — use CSS variables (`var(--color-primary)`)
- No `h-screen` — use `min-h-[100dvh]`
- No circular loading spinners
- No "No hay resultados" as plain text — designed empty states always
- No white borders on dark backgrounds — use `#2a2a2a` or ghost border
- No `#f8faf6` or any warm-green gray as background — it's what makes the app feel generic
- No green (`#0a3d1f`) for UI accent — it was being used as accent, it shouldn't be. Green = success states only.
- No `calc()` percentage width hacks
- No AI copywriting clichés: "Elevate", "Seamless", "Unleash", "Next-Gen", "Revolutionary"

---

## 8. Voice & Copy Rules

- Direct, rioplatense informal. "Ahorrate $X" not "Podrías ahorrar hasta $X"
- Numbers always formatted: `$3.627` not `3627`
- Mayorista names as-is: "Maxiconsumo", "Yaguar", "MaxiCarrefour"
- "Bomba" is the brand word for best deal — own it, don't hide it
- Empty states use action language: "Buscá un producto para agregarlo" not "No hay items"
