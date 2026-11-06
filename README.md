# HIMANSHU — THE SERIES

A cinematic, streaming-inspired portfolio for **Himanshu Kumar**: AI / ML Engineer and M.Tech CSE student at NIT Silchar.
Every section is an episode, every project is an Original, and the whole site plays like a series.

> A personal portfolio with a fictional streaming-platform look. It is not affiliated with Netflix or any other streaming service and uses none of their logos.

## Run it locally

Requires **Node.js 18+**.

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

Production build:

```bash
npm run build
npm run preview
```

The static site is written to `dist/` and can be deployed as-is to Vercel, Netlify, GitHub Pages or any static host.

## Updating the content

**All content lives in one file: [`src/data/content.json`](src/data/content.json).** There are two ways to change it, and both edit that same file:

1. **Admin dashboard** — run `npm run dev` and open http://localhost:5173/admin.
2. **By hand** — edit `src/data/content.json` in any editor. Save, and the running site reloads.

### Admin dashboard

| Page | What it edits |
| --- | --- |
| Personal info | Name, intro, role, tagline, email, LinkedIn, GitHub, interests |
| Home screen | Badge, info line and floating chips around the photo |
| About | The fact tiles next to the photo |
| Education / Experience | Schools and internships/jobs |
| Projects | Add, remove, reorder and edit projects (links, stack, bullets, result tiles, colours) |
| Skills | Skill categories and the "where it shows up" hover notes |
| Achievements | Award cards and certifications |
| Journey / Top picks / Play Intro | Seasons & episodes, the Top 10 row, the highlight-reel slides |
| Section text | Every section heading, menu names and footer |
| Design | Colour presets, every colour, fonts, opening animation, cursor, film grain |
| Sections & viewers | Hide sections; your own view; the Recruiter tile; recruiter roles (AI / ML, Full-Stack, Embedded…) with their own intro, section order and project / skill / top-pick order |
| Photo & resume | Upload a new portrait (background cut out automatically) or resume PDF |
| Publish | Commit and push saved changes to GitHub; restore an earlier saved version |

- **Save** with the button or Ctrl+S. The site updates immediately. Each save keeps a backup in `.admin-backups/` (last 30, not committed).
- **Publish** sends saved changes to GitHub. Until then they only exist on this computer.
- The admin only exists while `npm run dev` is running. It is not part of `npm run build`, so a deployed site has no admin.

**Using the admin from another device.** By default the admin only works on this computer. To allow other devices on your network, create a file named `.env.local` in the project folder containing:

```
ADMIN_PASSWORD=choose-a-strong-password
```

Restart `npm run dev`; the admin then asks for that password. `.env.local` is git-ignored, so the password is never published.

### Editing content.json by hand

Each top-level key matches an admin page: `profile`, `hero`, `about`, `copy` (headings), `education`, `experience`, `projects`, `achievements`, `certifications`, `skillCategories`, `skillEvidence`, `seasons`, `topPicks`, `introSlides`, `viewers` (your view, the Recruiter tile and recruiter roles), `sections` (menu names), `theme` (colours, fonts) and `settings` (toggles, hidden sections, photo crop). JSON needs double quotes and no trailing commas; if the site stops loading after a hand edit, the terminal running `npm run dev` shows the line with the mistake.

**Resume:** upload in the admin, or replace `public/assets/Himanshu_Kumar_Resume.pdf` (the download filename is `profile.resumeFileName`).

**Photo:** upload in the admin, or replace `photo.jpg` (or `photo.png` with a transparent background) and run:

```bash
npm run images
```

This rebuilds the responsive WebP portraits and the social share image in `public/assets/`, using the crop in `settings.photoCrop` (`"auto"` finds you in the frame).

## What's inside

```
src/
  data/content.json        ← all content, theme and settings (edited by hand or by the admin)
  data/portfolio.ts        ← typed access to content.json for the components
  theme.ts                 ← applies theme colours and fonts as CSS variables
  focus.tsx                ← the chosen view/role: puts its projects, skills, top picks and Journey season first
  admin/                   ← admin dashboard UI (served at /admin in dev only)
  App.tsx                  ← stages: opening → profile select → home; overlays
  components/
    OpeningSequence        ← black → studio card → HIMANSHU → THE SERIES → portrait → ▶ PLAY
    ProfileSelector        ← "Who's watching?": your view or Recruiter → pick a role (AI / ML, Full-Stack, Embedded)
    Navbar                 ← hide-on-scroll nav, profile switcher, mobile menu
    Hero                   ← billboard: parallax portrait, particles, light streaks, floating chips
    PlayIntro              ← ▶ Play Intro: zoom into portrait → highlight reel (pause, ← →, tap zones)
    ContinueWatching       ← cards with real "watched" progress bars
    About                  ← The Pilot
    Seasons / EpisodeCard  ← My Journey as seasons and episodes
    Originals / ProjectCard← pinned horizontal sequence on desktop, swipe rail on touch
    ProjectModal           ← full-screen project overlay with a shared-element transition
    TopPicks               ← Top 10-style row
    Skills                 ← skill genres; each card shows where the skill appears
    Achievements           ← award-poster cards + certification rail (links to credentials)
    ResumeViewer/ResumeModal ← designed resume sheet, PDF viewer, download
    FinalCTA               ← TO BE CONTINUED… + contact links
    CustomCursor, fx.tsx   ← cursor states, magnetic buttons, 3D tilt, text reveals, particles
  hooks/                   ← Lenis smooth scroll + scroll lock, media queries, watch progress
admin/vite-plugin-admin.ts ← admin API (save, uploads, backups, publish) — dev server only
scripts/portrait.mjs       ← portrait/share-image pipeline (sharp), used by the admin and `npm run images`
```

**Stack:** React 18, TypeScript, Vite 6, Tailwind CSS 4, Framer Motion 11, Lenis.

## Accessibility and performance

- `prefers-reduced-motion` is respected: smooth scroll, the custom cursor, tilt, particles, grain and the pinned horizontal scroll turn off, and the opening jumps straight to its final frame.
- Hover effects only run on devices with a precise pointer. Touch devices get tap interactions and native swipe rails.
- The custom cursor appears only with a mouse or trackpad.
- Overlays close with Esc, and the highlight reel supports Space and the ← → keys.
- Portraits are responsive WebP files (25–90 KB). Overlays are code-split, and particles pause when they're off screen.

## Keyboard shortcuts

- **Opening:** Enter or Esc skips it.
- **Play Intro:** Space pauses, ← and → change slides, Esc closes.
- **Project and resume overlays:** Esc closes.
