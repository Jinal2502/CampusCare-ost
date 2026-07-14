# Practical 1 — Premium Landing Page using HTML5 & CSS3

## Practical Title
**CampusCare – Student Wellness & Productivity Portal (Practical 1): Create a basic HTML webpage with CSS styling**

## Aim
To create a professional, responsive landing page using **HTML5** and **CSS3**, demonstrating **inline**, **internal**, and **external** CSS methods, along with semantic page structure and modern styling.

## Objectives
- Understand the structure of an HTML document and the purpose of common tags.
- Use **semantic HTML5** elements (`header`, `nav`, `main`, `section`, `article`, `footer`) to build readable structure.
- Apply CSS for layout, typography, colors, spacing, and responsiveness.
- Demonstrate the **three types of CSS**:
  - Inline CSS
  - Internal CSS
  - External CSS
- Build a responsive layout using **Flexbox** and **CSS Grid**.
- Follow best practices for accessibility, readability, and maintainability.

---

## Theory (HTML)

### Introduction to HTML
**HTML (HyperText Markup Language)** is the standard language for creating and structuring content on the web. It describes **what** content is (headings, paragraphs, navigation, sections), not **how** it looks. The visual appearance is controlled primarily by **CSS**.

### History and Evolution of HTML
- **Early web (1990s)**: HTML was created to share scientific documents over the internet.
- **HTML 2.0 (1995)**: one of the first formal specifications.
- **HTML 4.01 (1999)**: improved structure, forms, and standardization.
- **XHTML (2000)**: stricter, XML-based version of HTML.
- **HTML5 (2014+)**: added semantic tags, multimedia support, better forms, and APIs.

### HTML Versions (summary table)

| Version | Year (approx.) | Highlights |
|---|---:|---|
| HTML 2.0 | 1995 | First standard specification |
| HTML 3.2 | 1997 | Better layout options (historically) |
| HTML 4.01 | 1999 | Forms, scripting support, standardization |
| XHTML 1.0 | 2000 | Stricter syntax rules (XML style) |
| HTML5 | 2014+ | Semantic tags, audio/video, modern structure |

### HTML Document Structure
An HTML document has two main parts:
- **`<head>`**: metadata and resources (title, fonts, CSS files)
- **`<body>`**: visible page content

Example skeleton:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Page Title</title>
  </head>
  <body>
    <h1>Hello</h1>
  </body>
</html>
```

### DOCTYPE Declaration
`<!doctype html>` tells the browser to render the page in **standards mode**, using modern HTML rules. Without it, browsers may switch to quirks mode (inconsistent rendering).

### HTML Tags Explained
A **tag** defines an element. Most elements have:
- **Opening tag**: `<p>`
- **Closing tag**: `</p>`
- **Content**: text or nested elements

Some tags are **void/self-closing** (no closing tag), e.g.:
- `<meta ...>`
- `<link ...>`
- `<img ...>`

### Head Tag
`<head>` contains:
- Page title
- Metadata (charset, viewport)
- Links to CSS files and fonts
- SEO-friendly descriptions

### Body Tag
`<body>` contains all visible content:
navigation, headings, sections, cards, footer, etc.

### Metadata
Metadata is data about the page:
- `charset`: character encoding (UTF‑8 supports most languages)
- `viewport`: responsive scaling on mobile devices
- `description`: short summary for search engines

### Semantic HTML
Semantic HTML uses tags that describe meaning:
- `header`, `nav`, `main`, `section`, `article`, `footer`

Benefits:
- Better accessibility (screen readers)
- Better SEO
- Cleaner, more maintainable code

### Lists
Lists group related items:
- **Ordered list**: `<ol><li>...</li></ol>`
- **Unordered list**: `<ul><li>...</li></ul>`

### Tables
Tables display tabular data:
- `<table>`, `<tr>`, `<th>`, `<td>`

In this practical’s webpage we do **not** use tables, but tables are important for displaying structured data (marks, schedules, etc.).

### Forms (Introduction)
Forms collect user input:
- `<form>`, `<input>`, `<label>`, `<textarea>`, `<button>`

In Practical 1, the “Contact” area is static. In future practicals it can become a real form.

### Hyperlinks
`<a href="...">` creates a link.
- Internal links: `href="#section-id"`
- External links: `href="https://..."`
- Email links: `href="mailto:someone@example.com"`

### Images
Images use `<img>` with:
- `src`: image file path/URL
- `alt`: meaningful description (accessibility)

This landing page uses CSS-only illustrations (no stock images). Still, knowing `<img>` is essential.

### Div vs Section
- **`<div>`**: generic container (no semantic meaning)
- **`<section>`**: groups related content as a meaningful section

Use `<section>` when content has a theme and usually needs a heading.

### Header, Main and Footer
- **`<header>`**: top area or section header (often contains nav/branding)
- **`<main>`**: the primary content of the page (should be unique)
- **`<footer>`**: end of page (links, copyright, contact info)

### Best Practices (HTML)
- Maintain correct heading order (`h1` then `h2` then `h3`…).
- Use semantic tags wherever possible.
- Use meaningful link text (“Read Practical 1” not “Click here”).
- Add accessibility helpers (skip links, focus-visible styles).
- Keep markup clean and consistent.

---

## Theory (CSS)

### Introduction to CSS
**CSS (Cascading Style Sheets)** controls the presentation of HTML:
colors, fonts, spacing, layout, responsiveness, and animations.

### History of CSS
- CSS was introduced to separate **content** (HTML) from **presentation** (CSS).
- Over time, CSS gained powerful layout systems such as **Flexbox** and **Grid**, enabling modern responsive design without heavy frameworks.

### Advantages of CSS
- Separation of concerns (HTML structure vs CSS design)
- Reusability (one stylesheet for many pages)
- Consistency (theme variables, shared components)
- Easier maintenance and faster updates

### Types of CSS
CSS can be applied in three ways:

1. **Inline CSS**
2. **Internal CSS**
3. **External CSS**

### Inline CSS
Applied directly on an element using the `style` attribute:

```html
<a style="color:#2563EB;border-color:#2563EB">Login</a>
```

Characteristics:
- Highest priority (overrides internal/external, unless `!important` is used)
- Not scalable for large projects

### Internal CSS
Written inside a `<style>` tag in the HTML file:

```html
<style>
  .card { border-radius: 18px; }
</style>
```

Characteristics:
- Affects only that single HTML page
- Useful for quick page-specific styling (or practical requirements)

### External CSS
Written in a separate `.css` file and linked to HTML:

```html
<link rel="stylesheet" href="./css/style.css" />
```

Characteristics:
- Best for maintainability and reuse
- Keeps HTML clean and readable

### Comparison between all three

| Type | Where written | Scope | Maintainability | Priority |
|---|---|---|---|---|
| Inline | On the element (`style=""`) | Single element | Low | Highest |
| Internal | Inside `<style>` in HTML | Single page | Medium | Middle |
| External | Separate `.css` file | Multiple pages | High | Lowest |

### Priority and Specificity
CSS decides which rules apply using:
- **Cascade order** (inline > internal > external)
- **Specificity** (ID > class > element)
- **Source order** (later rules override earlier ones if specificity is same)

Specificity examples (highest to lowest):
- `#id` selector
- `.class` selector
- `element` selector (`p`, `h1`, etc.)

### CSS Syntax
CSS rule format:

```css
selector {
  property: value;
}
```

### Selectors
Common selectors:
- Universal: `*`
- Element: `p`, `h1`
- Class: `.card`
- ID: `#main`
- Descendant: `.nav a`
- Group: `h1, h2, h3`

### Universal Selector
`* { box-sizing: border-box; }` applies to all elements.

### Element Selector
`body { font-family: Inter; }`

### Class Selector
`.button { padding: 12px 16px; }`

### ID Selector
`#main { ... }` targets one unique element.

### Descendant Selector
`.nav a { ... }` targets all links inside `.nav`.

### Group Selector
`h1, h2 { letter-spacing: -0.03em; }`

### Pseudo Classes
Pseudo classes describe states:
- `:hover`, `:focus`, `:focus-visible`

### Pseudo Elements
Pseudo elements create “virtual” parts:
- `::before`, `::after`

### Colors
Used as:
- hex (`#2563EB`)
- rgba (`rgba(37, 99, 235, 0.18)`)

### Units
- `px`: fixed
- `rem`: relative to root font size
- `%`: relative to parent
- `vw/vh`: viewport-based

### Box Model
Every element is a box:
- content
- padding
- border
- margin

### Margin
Space outside the border.

### Padding
Space inside the border.

### Border
Outline around element.

### Display Property
Defines layout behavior:
- `block`, `inline`, `inline-block`
- `flex`, `grid`

### Position
- `static`, `relative`, `absolute`, `fixed`, `sticky`

### Overflow
Controls content overflow:
- `hidden`, `auto`, `scroll`

### Z-index
Controls stacking order for positioned elements.

### Flexbox
1D layout system (row OR column). Great for nav bars, button rows, and alignment.

### Grid
2D layout system (rows AND columns). Great for feature cards and sections.

### Typography
Font family, weight, line-height, letter-spacing.

### Google Fonts
Fonts can be imported with a `<link>` tag in `<head>` (used here for Inter).

### Border Radius
Rounds corners: `border-radius: 18px;`

### Box Shadow
Adds depth: `box-shadow: 0 18px 44px rgba(...);`

### Transitions
Smooth UI changes:
`transition: transform 240ms;`

### Responsive Design
Ensures the page adapts to different screen sizes.

### Media Queries
Apply styles at certain widths:

```css
@media (max-width: 720px) {
  .grid-3 { grid-template-columns: 1fr; }
}
```

### Accessibility
CSS should support keyboard users:
- `:focus-visible` outlines
- Skip links
- Adequate contrast

### SEO Basics
HTML metadata helps SEO:
- `<title>`
- `<meta name="description" ...>`
- semantic sections

### HTML and CSS Best Practices
- Prefer external CSS for maintainability.
- Use CSS variables for consistent themes.
- Keep components consistent (cards, buttons).
- Avoid unnecessary complexity.

---

## How HTML connects with CSS (important)

### How the external stylesheet is linked
In `index.html`, this line connects HTML to the external stylesheet:

```html
<link rel="stylesheet" href="./css/style.css" />
```

### How internal CSS works
Internal CSS is written inside `<style> ... </style>` in the HTML file. In this project, internal CSS is used intentionally for the **Statistics section** to demonstrate this method.

### Why inline CSS has the highest priority
Inline styles (written in `style=""`) apply directly to the element and override most other CSS rules in the cascade. In this project, inline CSS is intentionally used on:
- One button (“Login”)
- One highlighted text element (“Practical 1”)

### Which CSS method should be preferred in real-world development (and why)
**External CSS should be preferred** because:
- It scales across multiple pages
- It improves maintainability
- It keeps HTML clean
- It supports collaboration and consistent design systems

Inline/internal CSS should be used sparingly (mostly for one-off overrides or specific requirements).

---

## Project implementation notes (CampusCare Practical 1)

## Folder structure explanation

```text
CampusCare/
├── index.html              → Main landing page
├── README.md               → Central documentation (whole semester)
├── css/
│   └── style.css           → External CSS (main styling)
├── assets/
│   ├── images/             → (Reserved) images
│   └── icons/              → (Reserved) icons
└── docs/
    └── practical1.md       → This manual
```

---

## Explanation of every HTML tag used in this project

> The list below describes the **purpose** of each tag used in `index.html`.

| Tag | Where used | Purpose |
|---|---|---|
| `<!doctype html>` | Top of file | Enables standards mode |
| `html` | Root | Wraps the entire page |
| `head` | Metadata section | Fonts, CSS link, title, meta tags |
| `meta` | Head | Charset, viewport, description |
| `title` | Head | Browser tab title |
| `link` | Head | Loads Google Fonts and external CSS |
| `style` | Head | Internal CSS (Statistics section) |
| `body` | Page content | Contains all visible content |
| `a` | Many places | Navigation + links + buttons |
| `div` | Many places | Layout grouping and CSS illustrations |
| `span` | Logo mark, highlight | Inline grouping and decorative elements |
| `header` | Top | Header area containing navigation |
| `nav` | Header | Navigation menu |
| `input` | Navbar | Checkbox toggle for mobile menu (no JS) |
| `label` | Navbar | Clickable toggle control for the checkbox |
| `main` | Central | Main page content wrapper |
| `section` | Multiple | Semantic page sections (Hero, Features, Stats, About, Contact) |
| `article` | Cards | Individual content cards (features, statistics) |
| `p` | Text | Paragraphs and labels |
| `h1` | Hero | Main heading (highest priority heading) |
| `h2` | Section headings | Section titles |
| `h3` | Sub-headings | Card/point titles |
| `footer` | Bottom | Footer with links and info |

---

## Explanation of every CSS property used in this project

This project intentionally uses a real set of CSS properties used in modern UI work. The table below lists **every CSS property used in the CampusCare Practical 1 code** (external CSS + internal CSS + inline CSS), along with what each property does.

| CSS property | Meaning / how it is used in this project |
|---|---|
| `align-items` | Aligns items on the cross-axis in flex/grid containers (nav and layout alignment). |
| `animation` | Disabled under reduced motion preferences (`prefers-reduced-motion`). |
| `backdrop-filter` | Blurs content behind the sticky header for a premium “glass” look. |
| `background` | Sets solid colors and layered gradients (including the subtle grid and illustration fills). |
| `background-repeat` | Prevents repeating for background layers where required. |
| `border` | Adds subtle outlines to cards, pills, header, and illustration panels. |
| `border-bottom` | Adds separators (e.g., header bottom border, panel top bar). |
| `border-color` | Fine-tunes border color on hover and for themed elements. |
| `border-radius` | Creates soft rounded corners (target ~18px, plus larger on illustrations). |
| `border-top` | Adds separators (e.g., mobile nav divider, footer divider). |
| `bottom` | Positions decorative elements and illustration cards with absolute positioning. |
| `box-shadow` | Adds soft elevation and depth (cards, header, buttons). |
| `box-sizing` | Uses `border-box` so padding/borders are included in sizing calculations. |
| `clip` | Used for visually-hidden techniques (accessibility helpers). |
| `color` | Sets text colors using the defined palette (primary text + muted text). |
| `content` | Creates pseudo-element lines for the crosshair illustration (`::before`, `::after`). |
| `display` | Switches layout modes (`grid`, `flex`) across sections and components. |
| `filter` | Adds blur to “glow” blobs in CSS illustrations. |
| `flex-direction` | Changes flex direction for mobile navigation (column). |
| `flex-wrap` | Allows pills/buttons to wrap naturally on smaller screens. |
| `font-family` | Sets the Inter font (with system fallbacks). |
| `font-size` | Controls readable typography scale (including responsive `clamp()` sizing). |
| `font-weight` | Establishes hierarchy (regular, medium, bold). |
| `gap` | Controls spacing between items in grid/flex layouts. |
| `grid-area` | Places mobile navbar areas using `grid-template-areas`. |
| `grid-template-areas` | Defines the mobile navbar layout (“brand”, “toggle”, “links”). |
| `grid-template-columns` | Creates responsive multi-column grids for cards and footer. |
| `height` | Sets heights for illustrations, bars, and controls. |
| `inset` | Quickly positions absolutely positioned elements (e.g., background, panels). |
| `justify-content` | Aligns content along the main axis in flex/grid containers. |
| `justify-self` | Aligns individual grid items (e.g., nav toggle button). |
| `left` | Positions elements for illustrations and layout. |
| `letter-spacing` | Adds premium typographic tracking for headings and values. |
| `line-height` | Improves text readability and hierarchy. |
| `margin` | Controls spacing outside elements (global spacing and card spacing). |
| `margin-bottom` | Creates consistent vertical rhythm in section headers and layouts. |
| `margin-top` | Adds breathing space between components (pills, rows, etc.). |
| `max-width` | Limits line length for better readability and layout control. |
| `min-height` | Ensures hero illustration keeps good height even if content changes. |
| `opacity` | Keeps the grid and glows subtle (depth without distraction). |
| `outline` | Removed on focus-visible and replaced with a custom focus ring (accessibility). |
| `overflow` | Clips illustration overflow so shapes stay inside rounded containers. |
| `padding` | Adds internal spacing for buttons, cards, nav, and sections. |
| `padding-top` | Adds extra spacing when needed (footer and mobile areas). |
| `place-items` | Centers items in a grid using a single property (illustration containers). |
| `pointer-events` | Prevents the decorative background grid from interfering with clicks. |
| `position` | Uses `sticky`, `fixed`, `absolute`, and `relative` for layout and art layers. |
| `right` | Positions elements for illustrations and layout. |
| `scroll-behavior` | Enables smooth scrolling for in-page navigation. |
| `text-align` | Controls alignment for stat cards and other content blocks. |
| `text-decoration` | Used for link underline on hover to show interactivity. |
| `top` | Positions the sticky header and illustration layers. |
| `transform` | Adds subtle lift on hover and centers absolute elements. |
| `transition` | Smooth hover/focus animations (buttons, cards, links). |
| `user-select` | Prevents accidental text selection on buttons. |
| `white-space` | Used in visually-hidden patterns to avoid line breaks. |
| `width` | Sets widths for containers, cards, bars, and decorative elements. |
| `will-change` | Hints to the browser that transforms will animate smoothly. |
| `z-index` | Manages stacking order (header above background). |

---

## Expected Output

When you open `index.html` in a browser, you should see:
- A **sticky navigation bar** with CampusCare branding and links.
- A premium **Hero section** with headline, supporting text, two CTAs, and a **CSS-only illustration**.
- A meaningful **Features section** with three modern cards and hover lift effects.
- A **Statistics section** displayed inside elegant cards (styled differently via internal CSS).
- An **About section** in split layout plus a second CSS illustration.
- A clean **footer** with navigation and contact information.
- Full responsiveness across mobile/tablet/desktop.

---

## Learning Outcomes
After completing this practical, the student should be able to:
- Write a correct HTML5 document structure with metadata.
- Use semantic tags for clean, meaningful page structure.
- Apply CSS for modern UI design (color palette, typography, spacing).
- Implement responsive layouts with Flexbox and Grid.
- Understand CSS cascade, priority, and specificity.
- Differentiate between inline, internal, and external CSS.

---

## Conclusion
This practical demonstrates how a well-structured HTML document combined with clean, scalable CSS can produce a modern, professional landing page without any frameworks. The foundation created here is suitable for extension across the remaining practicals in the semester.

---

## Viva Questions with Answers (15)

1. **Q: What is HTML?**  
   **A:** HTML is a markup language used to structure content on the web.

2. **Q: What is CSS?**  
   **A:** CSS styles HTML content (layout, colors, fonts, spacing).

3. **Q: Why is `<!doctype html>` used?**  
   **A:** It enables standards mode for correct modern rendering.

4. **Q: What is the difference between `<div>` and `<section>`?**  
   **A:** `<div>` is generic; `<section>` is semantic and groups related content.

5. **Q: What are semantic tags? Give examples.**  
   **A:** Tags with meaning like `header`, `nav`, `main`, `section`, `article`, `footer`.

6. **Q: What is the purpose of the `viewport` meta tag?**  
   **A:** It ensures correct scaling and responsiveness on mobile devices.

7. **Q: What are the three ways to apply CSS?**  
   **A:** Inline, internal, external.

8. **Q: Which CSS type has the highest priority?**  
   **A:** Inline CSS.

9. **Q: Why is external CSS preferred in real projects?**  
   **A:** It is reusable, scalable, and keeps HTML clean.

10. **Q: What is Flexbox used for?**  
    **A:** One-dimensional layout (row/column alignment).

11. **Q: What is Grid used for?**  
    **A:** Two-dimensional layout (rows and columns).

12. **Q: What is specificity?**  
    **A:** A rule system that decides which selector is stronger (ID > class > element).

13. **Q: What does `border-box` do?**  
    **A:** It includes padding and border in width/height calculations.

14. **Q: Why do we use `:focus-visible`?**  
    **A:** To show focus only for keyboard interactions, improving accessibility.

15. **Q: What is responsive design?**  
    **A:** Designing pages to work well on all screen sizes using flexible layouts and media queries.

---

## Common Mistakes Students Make
- Forgetting `<!doctype html>` or viewport meta tag.
- Using headings incorrectly (jumping from `h1` to `h4`).
- Using inline CSS everywhere (hard to maintain).
- Overusing `<div>` instead of semantic elements.
- Not testing responsiveness on mobile widths.
- No focus styles (keyboard navigation becomes difficult).
- Too much contrast or too little contrast (readability issues).

---

## References
- MDN Web Docs — HTML: https://developer.mozilla.org/docs/Web/HTML  
- MDN Web Docs — CSS: https://developer.mozilla.org/docs/Web/CSS  
- W3C HTML Standard: https://html.spec.whatwg.org/  
- Google Fonts (Inter): https://fonts.google.com/specimen/Inter

