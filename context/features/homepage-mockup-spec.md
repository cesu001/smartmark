# Smark Homepage Mockup Spec

Create a marketing homepage for Smark - a Ai powered markdown note editor with real-time rendering.

**Output:** `prototypes/homepage/` with `index.html`, `styles.css`, `script.js`

---

## Color Palette

Check dashboard for for light theme and dark theme.

---

## Hero Section (Main Focus)

The hero shows a "chaos to order" concept with three elements side by side:

### Chaos Container (Left)

A box labeled "Your notes today..." containing 8 floating icons representing where users currently scatter their knowledge:

- Javascript, HTML, GitHub, CSS, VS Code logos
- Terminal, Text file, Markdown file

**The icons should animate:**

- Float around randomly, bouncing off walls
- Subtle rotation and scale pulsing
- Move away from mouse cursor on hover

### Transform Arrow (Center)

A pulsing arrow pointing from chaos to order.

### Dashboard Preview (Right)

A box labeled "...with Smark" showing a simplified dashboard mockup:

- Sidebar with nav items
- Grid of note cards
- Check dashboard page, may could be like that

---

## Other Sections

1. **Navigation** - Fixed top nav with logo, "Features"/"Pricing" links, Sign In/Get Started buttons

2. **Hero Text** - Above the visual: "\*\*\*" headline with gradient text, subheadline about scattered knowledge, CTA buttons. (Give me a good paragragh to be a headline)

3. **Features** - 6 cards in a grid: Real-time markdown rendering note editor, Collections, Tags, AI semantic search, AI Summary, AI Chatbot.

4. **AI Section** - 2 columns: Left has "Pro Feature" badge and checklist of AI capabilities. Right shows a code editor mockup with "AI Summary" demo.

5. **Pricing** - Free ($0, 50 items, 3 collections, 5 tags) vs Pro ($5/mo, unlimited, AI features). Pro card highlighted with "Most Popular" badge. Also add a toggle for the yearly $50 option. And Pro is now limited time free, make it noticeable.

6. **CTA** - "Ready to Organize Your Notes?" with button

7. **Footer** - Logo, link columns, copyright with current year.

---

## Animations

- **Chaos icons**: JavaScript animation using requestAnimationFrame. Icons drift, bounce off walls, repel from mouse cursor.
- **Arrow**: CSS pulse animation
- **Scroll**: Elements fade in when scrolling into view
- **Navbar**: Gets more opaque on scroll

---

## Responsive

- Mobile: Stack the chaos/arrow/dashboard vertically, single column grids
- Arrow rotates 90° on mobile to point down
