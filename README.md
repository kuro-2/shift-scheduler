# Handoff: Cadence — Shift Scheduling Application

A complete frontend design for an enterprise workforce-management / shift-scheduling SaaS. Built in HTML as a high-fidelity, interactive design reference. Ready to be recreated in Next.js + React + TypeScript + Tailwind + shadcn/ui.

---

## 1. Overview

**Cadence** is a shift-scheduling tool for managers of teams from 5 to ~5,000 employees. It covers:

- An **operational dashboard** that prioritizes "what needs you today" over vanity stats.
- A **week-grid scheduler** with drag-affordance, status-coded shift cards, density toggle, and live conflict detection.
- People management, time off, shift swaps, attendance with GPS, reports, and full settings.
- A **mobile companion** (clock-in, my-schedule, personal dashboard).
- First-time-user **auth** (email + Google + Microsoft SSO + remember me) and a multi-step **onboarding** wizard.

Design priorities — in order:
1. A non-scheduling-software-trained user understands the app in 2–3 minutes.
2. Power users move fast (keyboard shortcuts, command palette, density toggle, multi-select).
3. Restrained, calm aesthetic (Notion-warm). Status-coded, not decoration-coded.
4. WCAG AA, dark mode, fully responsive.

---

## 2. About the Design Files

The files in `design/` are **design references** — interactive HTML prototypes that show the intended look, behavior, and structure. They are **not production code to copy literally**.

The task is to **recreate these designs inside the target codebase** (Next.js + React + TypeScript + Tailwind + shadcn/ui per the user's stack request) using established patterns and componentization. Treat the HTML as the source of truth for visual specs, copy, behavior, and information architecture.

### Files

```
design_handoff_cadence/
├── README.md                       ← this document
└── design/
    ├── Cadence.dc.html             ← the clickable app (open in a browser)
    ├── Cadence Canvas.dc.html      ← pannable canvas: 2 dashboard + 2 scheduler directions + mobile views
    ├── support.js                  ← runtime for the .dc.html files (auto-loaded)
    └── ios-frame.jsx               ← iOS device frame used by mobile mocks in the canvas
```

To open: serve the `design/` folder over any local static server (e.g. `npx http-server design/`) and open `Cadence.dc.html` in a browser. The runtime is fully self-contained.

### Try in the running prototype

- **⌘K / Ctrl K** opens the command palette → jump between screens, open Create Shift, replay onboarding, view the sign-in screen
- **+ New shift** button (top-right) opens the right-side drawer
- **Bell icon** opens the notifications drawer
- **Theme toggle** (sun/moon) flips to dark mode — full palette swap
- **Density toggle** (Cozy / Compact) changes scheduler row height live
- **Sidebar collapse** button (top-left of sidebar) collapses to icon-only

---

## 3. Fidelity

**High-fidelity (hifi).**

Colors, type, spacing, copy, and interaction patterns are final and intentional. The developer should recreate the UI pixel-accurately using the target stack's primitives (shadcn/ui components for table/dialog/sheet/dropdown/command/toast, custom CSS or Tailwind for the scheduler grid, etc.). Replace the inline styles in the prototype with Tailwind utilities and shadcn components — but the visual result should match.

The user's brand name is **Cadence** — feel free to change before launch.

---

## 4. Tech Stack (required by user)

- Next.js (App Router recommended)
- React
- TypeScript (strict)
- TailwindCSS
- shadcn/ui
- Lucide Icons (the prototype uses inline Lucide-shape SVGs; install lucide-react and use named icons)
- Framer Motion (subtle animations only — drawer slide-in, modal fade. **Avoid heavy / decorative motion.**)

**Other recommendations:**
- `zustand` or React Context + reducer for cross-cutting UI state (theme, density, sidebar open, command palette open)
- `@tanstack/react-query` for server state, with a mock layer (`/services/*.mock.ts`) the developer can later swap for real fetchers
- `@tanstack/react-virtual` for the scheduler grid and people table once they grow past ~200 rows
- `date-fns` for date math (week start, day labels, range navigation)
- `cmdk` (already used by shadcn's Command) for ⌘K
- `react-hotkeys-hook` for keyboard shortcuts

---

## 5. Information Architecture

### Top-level routes

```
/login                          → Auth split screen
/onboarding                     → Multi-step setup wizard (first login only)
/dashboard                      → Default home
/schedule                       → The hero screen
/people                         → Employee directory
/people/[id]                    → Employee profile (drawer or page)
/time-off                       → Requests + swaps queue
/attendance                     → Live + historical timesheet
/reports                        → KPIs + charts + breakdowns
/settings/[section]             → Workspace, branding, billing, departments, roles, locations, templates, hours, permissions, integrations, api-keys, audit-log
```

### Persistent shell

```
┌───────────┬──────────────────────────────────────────────────┐
│  Sidebar  │  Topbar                                          │
│ (236px /  ├──────────────────────────────────────────────────┤
│  60px     │                                                  │
│  collapsed)│  Screen content                                  │
│           │                                                  │
└───────────┴──────────────────────────────────────────────────┘
```

**Sidebar (236 px expanded, 60 px collapsed)** — top to bottom:
- Logo + workspace name (with company subtitle)
- Group label "WORKSPACE"
- Dashboard, Schedule (with badge for open shifts), People, Time off (with pending count badge), Attendance, Reports
- Group label "ADMIN"
- Settings
- Bottom: current user card with role + dropdown chevron

**Topbar (60 px tall)**:
- Sidebar-toggle button (hamburger / panel-left icon)
- ⌘K search trigger (280 px min — looks like a search input, says "Search or jump to…")
- Spacer
- Density toggle button ("Cozy" / "Compact" label, lines icon)
- Theme toggle (sun ↔ moon)
- Notifications bell (with red dot indicator when unread)
- Primary CTA: `+ New shift` (filled, accent color)

---

## 6. Screens — detailed specs

### 6.1 Dashboard (`/dashboard`)

**Purpose:** answer "what needs my attention today?" in under 10 seconds.

**Layout** (max-width 1440 px, 28px top padding, 32px side padding):

```
┌──────────────────────────────────────────────────────────┐
│ Greeting block (left) ··············· Export / Open btn  │
├──────────────────────────────────────────────────────────┤
│ ┌─Live now (1.4fr)─┬─Coverage─┬─Labor cost─┬─Hours──┐    │
│ │                  │          │            │        │    │
│ └──────────────────┴──────────┴────────────┴────────┘    │
├──────────────────────────────────────────────────────────┤
│ ┌──Needs attention (1.5fr)────┬──Today's shifts───┐      │
│ │ List of 4 items, each with  │  Time-strip list  │      │
│ │ icon + title + sub + action │                   │      │
│ │                             ├──Recent activity──┤      │
│ │                             │  Last 4 events    │      │
│ └─────────────────────────────┴───────────────────┘      │
└──────────────────────────────────────────────────────────┘
```

**Greeting block**
- Small date label, 13px, muted: `Sunday, June 28`
- H1: `Good evening, Sarah` (24px, weight 600, letter-spacing −0.02em)
- Sub: `Here's what's happening at Northgate today.`

**Live "right now" tile**
- Pulse dot (5A9B6E with 3px box-shadow ring, 2.4s ease-in-out pulse animation)
- Label "LIVE · RIGHT NOW" (11px, weight 600, uppercase, tracked 0.06em)
- Big number 14 (36px, weight 600, letter-spacing −0.03em) + "people on shift"
- Stacked avatar row (28 px circles, −8px overlap, 2px white border) — 5 visible + "+9" chip
- Footer row: "Clocked in 13 / On break 2 / Scheduled next 4"

**Other tiles** all use the pattern: label (uppercase tracked) → big number → small sub. Coverage tile has a 3-segment progress bar (green/amber/grey).

**Needs attention list**
- Header: "Needs attention" + danger badge "7" + "View all →" link right
- Each row: 32×32 colored icon tile + title + sub + outlined action button (right)
- Item types: conflict (red), open shifts (amber), shift swap (blue), time-off pending (blue)

**Today's shifts**
- Each row: monospace time range (80px col) + label / people + status pill (FILLED / OPEN)
- 3px left border in status color

**Recent activity**
- 22 px avatar circle + name (bold) + verb + faded time

### 6.2 Schedule (`/schedule`) — the hero

**Purpose:** view, build, edit, and publish weekly rosters.

**Toolbar (full width, sticky):**
- H1 "Schedule"
- Segmented control: Day / **Week** (active) / Month / Timeline (inside surface-2 pill, 2px padding, 7px radius)
- Date navigator: chevron left | "Jun 22 – 28, 2026" | chevron right | "Today" outline button
- Spacer
- Filter button (lines icon + label + accent badge "2" showing active filter count)
- Copy week button
- Publish button (filled black bg, white text, "Publish · 3 drafts")

**Grid:**
- Sticky header row: 240 px person column + 7 day columns
- Day cell: weekday label (10px tracked uppercase) + date (14px weight 600). Today's column has `--accent-soft` background and `--accent-text` text.
- Person column: 32 px avatar + name + role · monospace hours label (`36h / 40h`)
- Each shift cell renders one of:
  - **Shift card**: padded 5/7 px, status background, 3 px left border in status dot color, monospace time + role beneath, conflict icon if `warn`
  - **"Off"** label (centered, muted)
  - **Empty `+`** button (opacity 0 until cell-hover, dashed border, hover background)
- Density toggle swaps `--row-h` (64 → 44 px) and `--shift-h` (52 → 36 px) via CSS variable — no re-render needed

**Bottom legend (sticky):**
- Filled · 47 / Open · 3 / Conflict · 1 / Draft · 3 with color swatches
- Right side: "Last saved 2 min ago · ⌘Z undo" (monospace, dim)

### 6.3 People (`/people`)

- Header: H1 "People" + sub "8 active · 2 part-time · all Northgate Co."
- Import CSV + Invite person buttons right
- Filter bar: search (320px max), All departments, All roles, All statuses dropdowns, row count right
- Table columns: Name (avatar + name + email), Role, Department, Hours (monospace `X / Y`), Status (pill with dot), `⋯` action button

### 6.4 Time off + swaps (`/time-off`)

- Tabs: Pending (6) / Approved (12) / Rejected (3) / All requests
- Each request card: avatar(s) + person name + type pill + age + dates + reason + auto-detected impact line at bottom + Decline/Approve buttons right
- Swap card shows two overlapping avatars and "↔" in title
- Impact line: green check (no conflicts) or amber warning (coverage issue)

### 6.5 Attendance (`/attendance`)

- 4 stat tiles: On time (12) / Late arrivals (2) / No-shows (0) / Overtime (3.5h)
- "Today's clock-ins" table with live indicator pulse dot
- Columns: Employee, Scheduled (monospace), Clock in (monospace, **late shows in `--open-text` weight 600**), Clock out, Location (GPS check + name), Status pill

### 6.6 Reports (`/reports`)

- Sub: date range + comparison ("vs previous 4 weeks")
- Date range picker, Export CSV, Export PDF
- 4 KPI tiles: Labor cost / Overtime hours / Coverage rate / Attendance, each with delta chip (▲ / ▼) colored by direction
- Big SVG line chart: daily labor cost — actual (accent solid) vs scheduled (text-dim dashed) over 28 days
- 2-up below: Hours by department (horizontal bars with department dot colors) + Top performers (avatar + name + sub + monospace grade chip)

### 6.7 Settings (`/settings/*`)

Internal layout: 220 px nav sidebar + content area.

- Nav groups: Workspace (Company / Branding / Plan & billing), Scheduling (Departments / Roles & skills / Locations / Shift templates / Business hours), Admin (Permissions / Integrations / API keys / Audit log)
- Company panel: workspace logo + upload, 2-col form (Company name, Industry, Time zone, Week starts on), then "Scheduling preferences" card with toggle rows
- Toggle component: 34×20 pill, 16×16 circle, accent fill when on, surface-3 when off

### 6.8 Create Shift drawer (440 px wide, right side)

Sections in order:
1. **Assign to** — chips with avatar + remove × + "Add person" dashed chip + "Open shift" chip
2. **Role** (with color swatch dot) + **Department** — dropdown buttons
3. **Starts** + **Ends** + **Break** + **Location** — 2-col grid
4. **Estimate strip**: clock icon + "7.5h shift · estimated $172 at $23/h" in surface-2
5. **Required skills** — green check chips + dashed "+ skill"
6. **Notes for the team** — textarea
7. **Repeat** — segmented control (No repeat / Daily / Weekly / Custom…)
8. **Save as template** link (bookmark icon)

Footer (sticky): "Save as draft" outline + "Publish shift" filled — both full-width split.

### 6.9 Notifications drawer (400 px wide, right side)

- Header: "Inbox" + "Mark all read" + close ×
- Tabs row: All (8) / Mentions / Approvals (6)
- List items: 32 px icon tile or avatar + title (with `<strong>` for names) + sub + monospace timestamp
- Unread items have `accent-soft` background and 3 px accent left border

### 6.10 Command palette (⌘K)

- Centered, max-width 560 px, top padded 14 vh
- Backdrop: 32% opaque dark + 2px blur
- Search input row + esc kbd hint right
- Sections: Suggested / Navigation / Demo & preferences
- Each item: 15 px icon + label + (optional) hotkey hint or sub-meta
- Footer bar: enter/arrow kbd hints + "Cadence" tag

### 6.11 Shift detail drawer

Opens when a shift card in the scheduler is clicked.
- Status pill (top) + day + time range + role · department
- "Assigned" section: avatar row with email + Message button
- 2×2 grid: Duration / Break / Location / Cost
- Notes section
- Edit / Duplicate / Delete buttons (Delete in conflict color)

### 6.12 Auth (`/login`)

Split screen, 1fr / 1fr:

**Left (form, max 520 px):**
- Logo + brand
- H1 "Welcome back" + sub "Sign in to your Northgate Co. workspace."
- Two SSO buttons side-by-side: Continue with Google / Microsoft SSO
- "or with email" divider
- Email + Password (with "Forgot?" link) + Remember-me checkbox
- "Sign in →" filled CTA
- "First time here? Set up a workspace" link

**Right (surface bg, left-bordered):**
- Eyebrow: "BUILT FOR TEAMS OF 5 TO 5,000"
- H2 (32 px, weight 600): "Schedules that respect everyone's time."
- Body paragraph
- 3 bullet rows with green check tiles

OTP / reset password flows aren't fully mocked — use the same split-screen layout. Reset: email field. OTP: 6 input boxes monospace, resend link, 30 s countdown.

### 6.13 Onboarding wizard

Modal, max-width 720 px, max-height 90vh.

- Header: eyebrow "SET UP WORKSPACE" + "Step 2 of 7" + close ×
- Progress bar (7 segments, fill in accent for completed steps)
- Body: per-step (designed: department editor with color swatches + name input + delete + dashed "Add another" + helpful info banner in accent-soft)
- Steps in order: Company info → Departments → Locations → Business hours → Roles → Shift templates → Invite employees
- Footer: ← Back / Skip for now / Continue →

### 6.14 Mobile views (employee-facing)

Three frames in `Cadence Canvas.dc.html`:

1. **Dashboard** — live status hero + needs-attention list + today's shifts + bottom tab bar (Today / Schedule / Clock / More)
2. **My schedule** — date pills row (today highlighted in accent), grouped day list (Today / Tomorrow), each shift card has status border + time + role + location + actions; FAB bottom-right to clock in
3. **Clock in** — large current time, "At Main store · within range" GPS pill (filled/conflict colors), next-shift card, big gradient clock-in CTA (100 px tall), last-3-days history

---

## 7. Design Tokens

These are defined as CSS custom properties in the prototype and re-themed by setting `data-theme="dark"` on `<html>`. Tailwind equivalent: configure `tailwind.config.ts` `theme.extend.colors` with the same names and enable class-based dark mode (`darkMode: ['class']`) — the developer should map every token to a Tailwind utility or shadcn theme variable.

### Color tokens — light theme

| Token | Value | Use |
|---|---|---|
| `--bg` | `#FAF8F4` | App background |
| `--surface` | `#FFFFFF` | Cards, sidebars, topbars |
| `--surface-2` | `#F4F1EA` | Hover, subtle wells, input bg |
| `--surface-3` | `#EDE8DD` | Deeper wells, disabled tracks |
| `--border` | `#ECE6D8` | Default 1 px borders |
| `--border-strong` | `#D8D1BF` | Hover state borders |
| `--text` | `#1F1A14` | Primary text (warm near-black) |
| `--text-muted` | `#6B6357` | Secondary text, labels |
| `--text-dim` | `#A39787` | Tertiary text, placeholders |
| `--accent` | `#4F46E5` | Primary CTA, links, focused active |
| `--accent-hover` | `#4338CA` | Hover state |
| `--accent-soft` | `#EEEDFB` | Active nav background, badges |
| `--accent-text` | `#3730A3` | Text on accent-soft |

### Color tokens — dark theme

| Token | Value |
|---|---|
| `--bg` | `#16151A` |
| `--surface` | `#1F1E24` |
| `--surface-2` | `#27262E` |
| `--surface-3` | `#32313A` |
| `--border` | `#2E2D36` |
| `--border-strong` | `#45444F` |
| `--text` | `#F0EBE0` |
| `--text-muted` | `#A39E94` |
| `--text-dim` | `#6E6A62` |
| `--accent` | `#8B85FF` |
| `--accent-hover` | `#A09BFF` |
| `--accent-soft` | `#2A2750` |
| `--accent-text` | `#B8B3FF` |

### Status tokens (4 status colors × 4 variables each)

Each status has `--{status}-bg`, `--{status}-text`, `--{status}-dot`, `--{status}-border`.

| Status | bg (light) | text (light) | dot | border (light) |
|---|---|---|---|---|
| **filled** | `#E8F0E9` | `#2F6841` | `#5A9B6E` | `#C9DDC9` |
| **open** | `#FAEFD8` | `#8A6017` | `#D4A04A` | `#EAD8AC` |
| **conflict** | `#F5E0DB` | `#9A3D34` | `#C76054` | `#E8C5BD` |
| **draft** | `#EEE9DE` | `#6B6357` | `#A39787` | `#D8D1BF` |
| **pending** | `#E3E8F5` | `#3D4D8A` | `#6373B5` | `#C5CFE6` |

Dark-theme equivalents are in the prototype's helmet `<style>` block.

### Department colors (used on avatars + dept dot indicators)

- Operations: `#7C6AC4` (purple)
- Sales: `#5A9B6E` (green)
- Front Desk: `#C76054` (terracotta)
- Management: `#3D4D8A` (indigo)
- Operations alt: `#D4A04A` (amber)
- Operations alt 2: `#6B8E7A` (sage)
- Sales alt: `#B5713F` (rust)
- Operations alt 3: `#4F76B5` (blue)

### Typography

- **Sans**: `Geist` (Google Fonts; weights 400 / 500 / 600 / 700). Fallback: `ui-sans-serif, system-ui, -apple-system, sans-serif`.
- **Mono**: `Geist Mono` (weights 400 / 500). Used for times, hours counters, kbd hints, numeric stats.
- Font features enabled: `'ss01', 'cv11'` (subtle stylistic alternates).
- Smoothing: `-webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;`

Type scale (used consistently):

| Use | Size | Weight | Letter-spacing | Color |
|---|---|---|---|---|
| H1 (screen title) | 22–24 px | 600 | −0.02em | text |
| H2 (section) | 14–15 px | 600 | −0.01em | text |
| Big stat | 26–36 px | 600 | −0.03em | text |
| Body | 13–14 px | 400 | normal | text |
| Label / meta | 11–12 px | 500 | normal | text-muted |
| Uppercase label | 10–11 px | 600 | 0.04–0.06em | text-muted |
| Caption | 10–11 px | 400 | normal | text-dim |

### Spacing scale

The prototype uses ad-hoc pixel values that map cleanly to a 4 px scale: 4 / 6 / 8 / 10 / 12 / 14 / 16 / 18 / 20 / 24 / 28 / 32. Tailwind defaults already cover this — use `gap-2 / gap-3 / gap-4 / gap-5 / gap-6` etc.

### Radius

| Use | Value |
|---|---|
| Inputs, small buttons | 6 px (`rounded-md`) |
| Standard buttons, chips, drawers | 7–8 px (`rounded-lg`) |
| Cards | 10 px (`rounded-xl`) — custom: define `--radius: 10px` |
| Tiles in shift cells | 6 px (`--radius-sm`) |
| Big modals | 12–14 px |

### Shadows

| Token | Value |
|---|---|
| `--shadow-sm` | `0 1px 2px rgba(31,26,20,0.04)` |
| `--shadow-md` | `0 1px 3px rgba(31,26,20,0.06), 0 6px 16px rgba(31,26,20,0.04)` |
| `--shadow-lg` | `0 4px 12px rgba(31,26,20,0.08), 0 24px 64px rgba(31,26,20,0.12)` |

### Density variables

`--row-h` and `--shift-h` switch values based on `data-density` on `<html>`:

- `comfortable` (default): `--row-h: 64px; --shift-h: 52px`
- `compact`: `--row-h: 44px; --shift-h: 36px`

---

## 8. Iconography

The prototype uses **Lucide icons inlined as SVG**. Use the `lucide-react` package and import named icons. Mapping:

| Use in design | Lucide name |
|---|---|
| Logo glyph | (custom — a starburst SVG, see Cadence.dc.html) |
| Dashboard nav | `LayoutDashboard` |
| Schedule nav | `Calendar` |
| People nav | `Users` |
| Time off nav | `Waves` (custom-ish — use `CalendarOff` or keep waves) |
| Attendance nav | `Clock` |
| Reports nav | `TrendingUp` |
| Settings nav | `Settings` |
| Search | `Search` |
| New shift `+` | `Plus` |
| Notification | `Bell` |
| Sun (light) | `Sun` |
| Moon (dark) | `Moon` |
| Density | `AlignJustify` |
| Conflict / warning | `AlertTriangle` |
| Open / clock | `Clock` |
| Approve / success | `Check` |
| Cancel / decline | `X` |
| Map pin (GPS) | `MapPin` |
| Trash | `Trash2` |
| More menu | `MoreHorizontal` |
| Chevrons | `ChevronLeft / Right / Down` |
| Sort | `ChevronsUpDown` |
| Filter | `Filter` |
| Copy week | `Copy` |
| Edit | `Pencil` |
| Save as template | `Bookmark` |
| Activity | `Activity` |

Stroke width used throughout: **1.75** for navigation/UI icons, **2** for inline status icons, **2.4** for tiny in-chip checkmarks.

---

## 9. Interactions & Behavior

### Animations

The prototype uses **almost no animation** by design — the user explicitly requested "Framer Motion (subtle animations only). Do NOT use heavy animations." Honor that.

Add only:
- Drawer slide-in (220 ms, `cubic-bezier(.2, .8, .2, 1)`)
- Modal fade + 4 px translate up (160 ms)
- Backdrop fade (150 ms)
- Pulse for live indicators (`pulse-live` — 2.4 s ease-in-out infinite, opacity 1 → 0.55 + scale 1 → 0.85)
- Hover state transitions on buttons / nav items (120 ms background)

No page transitions. No layout animations. No springs on data.

### Keyboard shortcuts

- `⌘K / Ctrl K` — open command palette
- `Esc` — close any open overlay
- `⌘Z / Ctrl Z` — undo (scheduler — needs to be wired)
- `G then D` — go to Dashboard
- `G then S` — go to Schedule
- `C` — create shift (when on schedule)
- `⌘ ⇧ L` — toggle theme

### Drag & drop (scheduler)

The prototype has visual affordance only. In implementation:
- Use `@dnd-kit/core` for drag of shift cards from one cell to another
- Shift cards: drag handle is the card itself; resize handles on the left/right edges (4 px wide, cursor-resize)
- On drop, optimistic update + mutation; rollback on error with toast
- During drag: show drop targets with dashed border, source cell semi-transparent
- Conflict detection runs on drop — if collision with another shift, show conflict warning before commit

### Empty / loading / error states

For every list and table screen, design these three states (the prototype shows populated states only):

- **Empty**: centered illustration-free panel with: muted icon (Lucide `Inbox` / `Calendar` / `Users` per screen), heading "No shifts scheduled this week", subtext, primary CTA "Create the first shift"
- **Loading**: shadcn `Skeleton` rows matching the row layout (3–5 rows on first load, 1 row on pagination)
- **Error**: muted icon (`AlertCircle`), heading "Couldn't load the schedule", subtext from error message, "Try again" button

### Toasts

Use shadcn `<Sonner />`. Patterns:
- Success: "Shift published" (and undo button if undo-able for 5 s)
- Warning: "1 conflict detected — review before publishing"
- Error: "Couldn't save. Retry?" with retry button

---

## 10. State Management

### Global UI state (Context or zustand)

```ts
interface UIState {
  theme: 'light' | 'dark';
  density: 'comfortable' | 'compact';
  sidebarOpen: boolean;
  cmdkOpen: boolean;
  createShiftOpen: boolean;
  notificationsOpen: boolean;
  selectedShiftId: string | null;
}
```

Persist `theme` and `density` to `localStorage`. Apply to `<html>` as `data-theme` and `data-density` attributes (CSS variable swap handles the rest).

### Server state (`@tanstack/react-query`)

Each domain gets its own query keys + mock service module:

```
services/
├── auth.service.ts
├── employees.service.ts
├── shifts.service.ts
├── time-off.service.ts
├── attendance.service.ts
├── reports.service.ts
└── notifications.service.ts
```

Each exports `mock` async functions matching this contract:

```ts
// shifts.service.ts
export interface Shift {
  id: string;
  employeeId: string | null;     // null = open shift
  date: string;                  // ISO yyyy-mm-dd
  startTime: string;             // HH:mm 24h
  endTime: string;
  breakMinutes: number;
  roleId: string;
  departmentId: string;
  locationId: string;
  status: 'filled' | 'open' | 'conflict' | 'draft';
  warning?: 'overtime' | 'overlap' | 'missing_skill' | 'underage_hours' | null;
  notes?: string;
  requiredSkills?: string[];
  publishedAt?: string;
}

export async function getShifts(range: { from: string; to: string }): Promise<Shift[]>;
export async function getShift(id: string): Promise<Shift>;
export async function createShift(input: Omit<Shift, 'id'>): Promise<Shift>;
export async function updateShift(id: string, patch: Partial<Shift>): Promise<Shift>;
export async function deleteShift(id: string): Promise<void>;
export async function publishWeek(weekStart: string): Promise<{ publishedCount: number }>;
```

Mocks return seeded data with a 200–600 ms artificial delay so loading skeletons can be verified.

### Data model

```ts
interface Employee {
  id: string;
  name: string;
  email: string;
  initials: string;          // computed from name
  avatarColor: string;       // see Department colors
  roleId: string;
  departmentId: string;
  locationIds: string[];
  scheduledHours: number;    // current week
  contractHours: number;
  status: 'active' | 'part-time' | 'inactive';
  skills: string[];
  certifications: { name: string; expiresAt: string }[];
  hourlyRate?: number;
  startDate: string;
  emergencyContact?: { name: string; phone: string };
}

interface Department {
  id: string;
  name: string;
  color: string;             // hex
}

interface Role {
  id: string;
  name: string;
  departmentId: string;
  defaultBreak: number;
  requiredSkills: string[];
}

interface Location {
  id: string;
  name: string;
  address: string;
  coordinates?: { lat: number; lng: number };
  geofenceRadius?: number;   // meters
}

interface TimeOffRequest {
  id: string;
  employeeId: string;
  type: 'vacation' | 'sick' | 'personal' | 'unpaid';
  startDate: string;
  endDate: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  decidedAt?: string;
  decidedBy?: string;
  managerComment?: string;
}

interface ShiftSwap {
  id: string;
  fromEmployeeId: string;
  toEmployeeId: string;
  fromShiftId: string;
  toShiftId: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  conflictCheck: { hasConflict: boolean; reasons: string[] };
}

interface AttendanceEvent {
  id: string;
  employeeId: string;
  shiftId: string;
  clockIn?: string;       // ISO datetime
  clockOut?: string;
  breaks: { start: string; end: string }[];
  gpsVerified: boolean;
  locationId?: string;
  status: 'on_time' | 'late' | 'early' | 'no_show' | 'on_shift' | 'on_break' | 'complete' | 'sick';
  notes?: string;
}

interface Notification {
  id: string;
  type: 'conflict' | 'time_off_request' | 'swap_request' | 'late' | 'sick' | 'published' | 'mention';
  title: string;
  subtitle: string;
  actorId?: string;
  unread: boolean;
  createdAt: string;
  link?: string;
}
```

Use this contract as the boundary the developer's backend team can implement against later.

---

## 11. Accessibility (WCAG AA)

- **Contrast**: every text/background combination in the token table above passes AA. Verify with axe.
- **Focus rings**: do not remove. Add a custom 2 px `outline-color: var(--accent)` with 2 px `outline-offset` on all interactive elements. Visible on keyboard focus only (`:focus-visible`).
- **Keyboard**: every interactive control reachable by Tab. Drawers trap focus while open and return to trigger on close. Esc closes overlays.
- **ARIA**: nav items use `aria-current="page"`. Toggles use `role="switch"` + `aria-checked`. Live regions on the attendance live indicator + notifications new-item announcer.
- **Screen reader**: icon-only buttons (toggles, close, more) have `aria-label`. Status pills should also include screen-reader text for the status name when only the color or dot conveys it.
- **Click targets**: minimum 44×44 on mobile (the FAB on the mobile scheduler is 50×50 — fine). Some 28–32 px desktop icon buttons are below this and acceptable on desktop only; do not shrink for mobile.
- **Motion**: respect `prefers-reduced-motion` — disable pulse animation and drawer slide.
- **High contrast mode**: tokens already accommodate. Test with Windows high contrast.

---

## 12. Performance (10,000+ employees)

- **Virtualize**: the scheduler grid (`@tanstack/react-virtual` over the employee rows), the people table, the attendance table, the notifications list. Anything past 50 visible rows.
- **Code split**: each top-level route. Settings sub-routes likewise.
- **Optimistic updates** on all mutations (shift create, swap approve, time-off decide, etc.).
- **Memoize** shift-row components and shift-cell components; key by `${employeeId}-${date}`.
- **Debounce** the find-person search in the scheduler and people table.
- **Pagination**: people table, attendance history, reports detail tables — 50/page.
- **Server-side filters** on people/attendance/reports — don't ship 10k employees to the client.

---

## 13. Recommended Folder Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── forgot/page.tsx
│   │   ├── reset/page.tsx
│   │   └── otp/page.tsx
│   ├── (onboarding)/onboarding/page.tsx
│   ├── (app)/
│   │   ├── layout.tsx            # Sidebar + Topbar shell
│   │   ├── dashboard/page.tsx
│   │   ├── schedule/page.tsx
│   │   ├── people/page.tsx
│   │   ├── people/[id]/page.tsx
│   │   ├── time-off/page.tsx
│   │   ├── attendance/page.tsx
│   │   ├── reports/page.tsx
│   │   └── settings/
│   │       ├── layout.tsx
│   │       └── [section]/page.tsx
│   └── layout.tsx                # html, body, providers
├── components/
│   ├── ui/                       # shadcn primitives
│   ├── app-shell/
│   │   ├── Sidebar.tsx
│   │   ├── Topbar.tsx
│   │   ├── CommandPalette.tsx
│   │   ├── NotificationsDrawer.tsx
│   │   └── UserMenu.tsx
│   ├── scheduler/
│   │   ├── WeekGrid.tsx
│   │   ├── ShiftCard.tsx
│   │   ├── ShiftCell.tsx
│   │   ├── PersonRow.tsx
│   │   ├── ScheduleToolbar.tsx
│   │   ├── CreateShiftDrawer.tsx
│   │   ├── ShiftDetailDrawer.tsx
│   │   └── useScheduleState.ts
│   ├── dashboard/
│   │   ├── LiveNowTile.tsx
│   │   ├── CoverageTile.tsx
│   │   ├── NeedsAttention.tsx
│   │   ├── TodayShifts.tsx
│   │   └── ActivityFeed.tsx
│   ├── people/
│   │   ├── PeopleTable.tsx
│   │   ├── EmployeeRow.tsx
│   │   └── EmployeeProfileDrawer.tsx
│   ├── time-off/
│   │   ├── RequestCard.tsx
│   │   └── SwapCard.tsx
│   ├── attendance/
│   │   ├── AttendanceTable.tsx
│   │   └── ClockInRow.tsx
│   ├── reports/
│   │   ├── KpiTile.tsx
│   │   ├── LaborCostChart.tsx
│   │   ├── DepartmentBreakdown.tsx
│   │   └── TopPerformers.tsx
│   └── common/
│       ├── StatusPill.tsx
│       ├── Avatar.tsx
│       ├── AvatarStack.tsx
│       ├── ThemeToggle.tsx
│       ├── DensityToggle.tsx
│       └── EmptyState.tsx
├── services/                     # mock API layer
│   └── (see §10)
├── hooks/
│   ├── useTheme.ts
│   ├── useDensity.ts
│   ├── useHotkeys.ts
│   ├── useUndoRedo.ts
│   └── useShiftConflicts.ts
├── lib/
│   ├── date.ts                   # date-fns wrappers
│   ├── format.ts                 # currency, duration, ago
│   └── status.ts                 # status → color token mapping
├── styles/
│   └── globals.css               # CSS variables + base resets
└── types/
    └── index.ts                  # data model from §10
```

---

## 14. Implementation Order (recommended)

1. **Foundation** — Next.js scaffold, Tailwind config with custom colors mapped to CSS vars, shadcn init, globals.css with token definitions, dark + density data-attribute support, theme/density hooks with localStorage.
2. **App shell** — Sidebar, Topbar, Layout. Wire ⌘K command palette stub (just navigation). Wire theme + density toggles. Wire mobile responsive collapse.
3. **Dashboard** — static first with mock service data; live-now tile, KPI tiles, needs-attention list, today's shifts, activity feed.
4. **Schedule (the hero)** — start with static week grid + status colors + density toggle. Add Create Shift drawer. Then drag-drop + resize. Then conflict detection. Then publish flow with optimistic updates.
5. **People** — table with filters, sort, search. Employee profile drawer.
6. **Time off + swaps** — tabs, request cards, approval flow with auto-conflict-check on approve.
7. **Attendance** — KPI tiles, live table with auto-refresh (poll every 30 s), late/early indicators.
8. **Reports** — KPI tiles, line chart (recharts or visx), department breakdown, top performers.
9. **Notifications drawer** — list with unread state, mark all read, tabs.
10. **Settings** — sub-nav + Company panel first, then Departments / Roles / Locations / Templates editors.
11. **Auth + Onboarding** — split-screen login, SSO buttons (stubbed handlers), OTP, password reset. Onboarding wizard reusing the form components built for Settings.
12. **Mobile** — separate routes or responsive collapse. Mobile scheduler shows day list + cards instead of grid. Mobile dashboard reuses tiles in a single column. Clock-in screen with GPS check.
13. **Accessibility audit + perf pass** — keyboard nav, focus traps, virtualization, code splitting.

---

## 15. Assets

Nothing besides Google Fonts (Geist + Geist Mono) — the prototype uses no images. Avatars are colored circles with monogram initials. The logo glyph is the custom SVG starburst in `Cadence.dc.html`.

---

## 16. Open Questions for the User

When the developer kicks off, the user should answer:

1. Brand name — keep "Cadence" or change?
2. Which dashboard direction wins — **A** (operational triage) or **B** (single ordered briefing)?
3. Which scheduler direction wins — **A** (week grid) or **B** (daily timeline)?
4. Backend API base URL + auth scheme (NextAuth / Auth.js, Clerk, custom JWT, …)?
5. Real industry/data to seed with? (the prototype uses retail names)
6. Multi-tenancy required day-one, or single-workspace MVP?

---

## 17. Files in this bundle

| File | Purpose |
|---|---|
| `README.md` | This document — the spec |
| `design/Cadence.dc.html` | Main clickable app — open this in a browser to interact with every screen |
| `design/Cadence Canvas.dc.html` | Pannable canvas with the 2×2 hero screen variations + 3 mobile screens |
| `design/support.js` | Runtime that hydrates the `.dc.html` files (already wired) |
| `design/ios-frame.jsx` | iOS device frame used by mobile mocks in the canvas |
