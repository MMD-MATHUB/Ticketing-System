# Ticketing System UI Style Reference

This document is the shared visual reference for the Requester, Processing, and Analysis applications. Reuse the existing classes and values documented here before creating a new style.

## Source Of Truth

- Shared application styles: `src/App.css`
- Global reset and base typography: `src/index.css`
- Authentication-only styles: `src/features/authentication/pages/LoginPage.css` and `ApplicationSelectionPage.css`
- Shared shell and navigation: `src/app/AppShell.jsx`
- App routes:
  - Requester: `/dashboard`, `/tickets/*`, `/new-ticket`, `/search`
  - Processing: `/processing`
  - Analysis: `/analysis`
  - Shared component gallery: `/style-reference`

The three application surfaces use the shared shell and `App.css`. Authentication styles are intentionally separate and should not be copied into application pages.

## Design Direction

The interface is a quiet operational tool:

- White panels on a very light gray-lilac page background.
- Purple is the primary action and active-state color.
- Red, amber, and green are reserved for status or semantic emphasis.
- Use compact, scannable layouts with clear labels and restrained shadows.
- Prefer existing shared classes over one-off inline styles.
- Keep controls keyboard accessible with visible `:focus-visible` states.

## Color Palette

| Token / use | Value | Current usage |
| --- | --- | --- |
| Primary purple | `#584cb9` | Primary buttons, active tabs, links, charts, ticket heading |
| Primary pale | `#efedff` | Badges, selected navigation and application accents |
| Page background | `#f7f7fa` | Main application shell and pages |
| Global background | `#eef3ff` | Root/base background before the shell is rendered |
| Surface | `#fff` | Cards, panels, inputs, menus, dialogs |
| Border | `#e4e4ed` | Cards, panels, tables, dialogs |
| Input border | `#dcdce6` | Search fields, outlined controls, back button |
| Divider | `#f0f0f5` | Table rows and filter separators |
| Primary text | `#18181b` | Shell text and headings |
| Body text | `#22222d` | Ticket/comment content |
| Secondary text | `#666678` | Values, labels, muted table content |
| Tertiary text | `#707084` | Descriptions and subtitles |
| Quiet text | `#8a8a99` | Eyebrows, empty states, optional labels |
| Focus/selection fill | `#f3f3fb` | Action menu hover and comment bubbles |
| Success | `#16a34a` / `#0f9f75` | Completed metrics and positive outcomes |
| Warning | `#d97706` / `#b45309` | In-progress states and processing accent |
| Error | `#dc2626` / `#c33` | Validation and error messages |
| Chart track | `#ececf3` | Bar chart background |
| Scroll thumb | `#c9c7e8` | Dashboard and timeline scrollbars |

Avoid introducing a new purple, gray, or border value when an existing palette value fits.

## Typography

- Base family: `Inter, 'Segoe UI', sans-serif` from `src/index.css` and the shared shell.
- Use `font: inherit` on controls so inputs and buttons match their surrounding app.
- Page headings use a responsive size from `1.5rem` to `2.1rem`.
- Ticket detail headings use `2rem` and primary purple.
- Panel titles are compact and bold; subtitles use `#707084` at approximately `12px`.
- Labels are usually `12px` to `14px` and `font-weight: 700`.
- Body values use `15px`, `font-weight: 500`, and `line-height: 1.45`.
- Do not use uppercase text except for the existing `.eyebrow` pattern.

## Layout And Shell

Use the existing structure for all three apps:

```jsx
<section className="page">
  <header className="page-header">...</header>
  <section className="panel">...</section>
</section>
```

| Pattern | Class / rule |
| --- | --- |
| Application shell | `.shell`, `.sidebar`, `.content` |
| Page wrapper | `.page` |
| Header row | `.page-header` |
| Compact header | `.page-header.compact` |
| Centered detail page | `.detail-page` |
| Standard surface | `.card` or `.panel` |
| Empty/loading/error state | `.state-panel` |
| Standard panel radius | `16px` |
| Standard surface border | `1px solid #e4e4ed` |
| Standard surface padding | `16px` |
| Content gap | `clamp(14px, 1.4vw, 22px)` |

The desktop sidebar is sticky. At `900px` and below, the sidebar becomes a top bar and the navigation becomes a mobile menu. At `640px` and below, grids collapse to one column where defined.

## Buttons

### Primary Button

Use `.primary-button` for the main action in a section:

```jsx
<button type="button" className="primary-button">Create ticket</button>
```

- Background: `#584cb9`
- Text: white
- Border: none
- Radius: `12px`
- Padding: `10px 16px`
- Weight: `600`
- Cursor: pointer

Use `.primary-button.small` for compact header actions. Disabled primary buttons use `opacity: 0.5` and `cursor: not-allowed`.

### Secondary / Outlined Button

Use `.secondary-button` for a secondary action:

- White background
- `1px solid #584cb9`
- Purple text
- `12px` radius
- `10px 16px` padding
- `font-weight: 600`

The ticket detail Action trigger uses `.action-menu-trigger`, which is the outlined variant with a chevron. Do not replace it with a solid primary button.

### Text Button

Use `.text-button` for low-emphasis actions such as `View all`:

- No border or background
- Purple text
- `13px` font size
- `font-weight: 700`
- Compact `4px 0` padding

### Back Button

Use `.back-button` for ticket detail navigation. It is a centered `28px` square with:

- White background
- `1px solid #dcdce6`
- `8px` radius
- A separate `.back-chevron` element, not a text glyph
- Accessible `aria-label="Back to dashboard"`

The chevron uses a `2px` rounded CSS stroke. Keep the arrow centered with absolute positioning; do not use a font character because glyph baselines vary.

## Action Menus And Navigation

### Action Menu

Use this structure for contextual ticket actions:

```jsx
<div className="action-menu">
  <button className="action-menu-trigger" aria-haspopup="menu" aria-expanded={open}>
    Action <span className="action-menu-chevron" aria-hidden="true" />
  </button>
  {open && (
    <div className="action-menu-list" role="menu">
      <button type="button" role="menuitem">Action 1</button>
    </div>
  )}
</div>
```

- Menu width: `182px`
- Menu padding: `8px`
- Menu radius: `10px`
- Menu border: `1px solid #dcdce6`
- Menu shadow: `0 10px 24px rgba(36, 35, 67, 0.12)`
- Menu item padding: `10px 12px`
- Menu item radius: `6px`
- Hover/focus fill: `#f3f3fb`

Close menus on Escape, outside click, and after selecting an item. Navigation menus should also close after route changes.

### Application Navigation

Use `.nav`, `.nav a`, `.nav a.active`, and `.badge` inside `AppShell`.

- Navigation links are `14px`, muted gray, and use `11px 12px` padding.
- Active and hover state uses `#f2f0ff` background and `#584cb9` text.
- Badges use a pale purple fill, purple text, `20px` minimum height, and a pill radius.
- Keep the mobile menu inside `.mobile-menu-control` so the existing outside-click behavior works.

## Inputs And Search

### Search Field

Use `.search` for the standard search control:

- Height: `42px`
- White background
- Border: `1px solid #dcdce6`
- Radius: `16px`
- Standard max width: `620px`.
- Input has no own border and uses `14px` horizontal padding.
- Submit button is purple, `112px` wide, and keeps the right `16px` radius.

The Requester dashboard uses `.dashboard-search` with a `38px` height and a compact `92px` search button. The Analysis dashboard uses `.analysis-dashboard-search` with the same visual treatment and a `760px` max width so its wider dashboard layout does not make the rounded corners feel oversized.

Keep the search radius at `16px` across both dashboard applications; widen the control before changing the radius.

### Form Fields

- Use `.field-label` for form labels: `#445877`, `0.9rem`, `font-weight: 600`.
- Keep field groups aligned in `.form-grid`.
- Use existing input/select styles rather than adding a local border or radius.
- Optional labels use `.optional-label` and `#8a8a99`.
- Searchable dropdowns use `.searchable-select`, `.searchable-select-options`, and role attributes for accessibility.
- When a value is selected, `.searchable-select-clear` displays a gray `×` beside the purple arrow. It clears the value without opening the list.
- The clear control keeps an accessible button hit area and is vertically centered with `.searchable-select-arrow`.

## User Access Profiles

Login access is defined by the persisted `UserType` and controls which application cards and API policies are available:

| User type | Applications |
| --- | --- |
| Requester | Requester only |
| Team member | Analysis and Processing |
| Admin | Requester, Analysis, and Processing |

The application chooser displays Admin applications in this order: Requester, Analysis, Processing. The demo credentials are shown on the login page and use the shared development password.

## Tables

### Standard Data Table

Use this structure:

```jsx
<div className="panel table-card ticket-table-card">
  <div className="table-wrap">
    <table>
      <thead>...</thead>
      <tbody>...</tbody>
    </table>
  </div>
</div>
```

| Rule | Value |
| --- | --- |
| Outer table surface | `.ticket-table-card` |
| Horizontal scrolling | `.table-wrap` with `overflow-x: auto` |
| Vertical overflow | Hidden in `.table-wrap`; keep scrolling local to a dedicated list when needed |
| Table width | `width: max-content; min-width: 100%` |
| Layout | `table-layout: fixed` |
| Cell padding | `16px 20px` |
| Cell alignment | Left aligned by default |
| Row divider | `1px solid #f0f0f5` on the top border |
| Overflow text | `white-space: nowrap`, ellipsis, hidden overflow |

### Materials Table

Use `.materials-table-wrap` and `.materials-table` for the ticket wizard materials list.

- Horizontal scrolling is allowed.
- Minimum table width: `620px`.
- Header and cell padding: `11px 14px`.
- Header fill: `#f1f1f2`.
- First column width: `64px`.
- Final action column width: `120px`, centered.
- Empty state height: `220px` with muted text.

Do not create a second table treatment for Processing or Analysis. Compose their data inside the existing panel/table patterns.

### Selectable Assignment Table

The Analysis Not Started page adds selection and assignment without changing the base table treatment:

- Use native checkbox semantics with the custom `.analysis-ticket-page tbody input[type='checkbox']` styling.
- Empty checkbox: `20px` rounded square with a light gray border.
- Selected checkbox: purple `#584cb9` fill with a centered rounded white check.
- Center the checkbox in the Select column.
- Show `Select all` and `Assign` only after at least one ticket is selected.
- Keep the assignment controls in the same row as the compact filters.
- Assignment changes selected tickets from `NotStarted` to `InProgress` and publishes a live update.

Each selected ticket creates one persisted Analysis task per plant/material combination. Task numbers use `SMD-TSK-...` and are unique per ticket, plant, and material. The Re-analyse and My Analysis Tasks tables expose a dedicated Task number column.

## Dashboard Metrics And Charts

### KPI Cards

Use `.kpis`, `.dashboard-kpis`, `.card`, and `.dashboard-kpi`.

- Dashboard uses five equal KPI columns on wide screens.
- Cards are white with `16px` radius and `1px solid #e4e4ed`.
- KPI values can use semantic inline colors already used by `DashboardPage`:
  - Purple `#584cb9`
  - Red `#b85c5c`
  - Amber `#d97706`
  - Green `#0f9f75`
- Keep the card height stable so dashboard rows do not jump.

### Horizontal Bars

Use `.bar-row`, `.bar`, `.fill`, `.plant-row`, and `.accent`.

- Track: `#ececf3`, height `10px`, pill radius.
- Fill: purple by default, full height, pill radius.
- Labels: `#666678`, approximately `13px`.
- Keep the numeric value in its own final column.
- For plant rows, use the `4px` pill-shaped `.accent` marker.

These patterns are shared by the Dashboard and Analysis app. Only the data and labels should change.

### Processed Today Switcher

The Analysis Processed Today page uses the Requester segmented-tab component:

```jsx
<div className="ticket-status-tabs" role="tablist">
  <button className="active">Tickets <span className="badge">6</span></button>
  <button>Tasks <span className="badge">0</span></button>
</div>
```

- Tickets is selected by default.
- The tab sits beside the page title on desktop and wraps naturally on mobile.
- Counts represent today’s processed tickets and today’s created Analysis tasks.
- The Tasks view uses task number, ticket, plant, material, title, and created-on columns.

### Cancellation Tabs

Analysis cancellation views reuse `.ticket-status-tabs` with `Cancellation requests` and `Cancelled tickets`. The first tab displays resolved tickets with the visible status `Cancellation requested`; the second displays cancelled tickets with status `Cancelled`.

## Timeline And Comments

Use the ticket detail structure:

```jsx
<div className="panel detail-panel">
  <div className="timeline-box" ref={timelineBoxRef}>
    <div className="comment-bubble">
      <div className="comment-author">Requester</div>
      <div className="comment-text">Message</div>
    </div>
  </div>
  <div className="comment-box">
    <input placeholder="Comment" />
    <button type="button">Send</button>
  </div>
</div>
```

- Timeline height is fixed at `220px` so the composer does not jump.
- Timeline scrolling is vertical and uses:
  - `overflow-y: auto`
  - `scrollbar-width: thin`
  - `scrollbar-color: #c9c7e8 transparent`
- Timeline entries use a pale `#f3f3fb` bubble, `16px` radius, and `14px 16px` padding.
- The author is `12px`, bold, and `#596273`.
- Comment text is `#22222d` with `1.5` line height.
- The composer has a top divider and `10px` top padding.
- Scroll to `scrollHeight` when comments change so the newest message is focused.
- Enter sends a single-line comment. Prevent the default event before calling the send handler.
- Action selections should use the same comment endpoint and appear as timeline messages.

The backend currently exposes a single ticket description rather than a persisted comment collection. Treat in-session timeline entries as temporary until comment storage is added server-side.

## Modals And Overlays

Use `.modal-backdrop`, `.modal-card`, `.modal-actions`, and `.modal-close`.

- Backdrop is fixed to the viewport with `z-index: 30`.
- Backdrop fill: `rgba(24, 24, 27, 0.42)`.
- Center content with CSS grid and `20px` outer padding.
- Modal width: `min(100%, 520px)`.
- Modal padding: `26px`.
- Modal radius: `14px`.
- Modal shadow: `0 18px 45px rgba(36, 35, 67, 0.24)`.
- Close buttons are transparent, borderless, and keyboard accessible.

## Loading, Empty, And Error States

Use `.state-panel` inside a `.panel` for loading and generic empty states:

- Padding: `48px 20px`
- Centered text
- Text color: `#7a7a89`

Use the existing dashboard and ticket error dialog classes for errors instead of creating a new alert surface. Error colors should remain semantic red or amber and never use purple for error meaning.

## Responsive Rules

| Breakpoint | Behavior |
| --- | --- |
| `1240px` | Dashboard layout becomes less dense; multi-column grids reduce to two columns where defined |
| `900px` | Sidebar becomes a top navigation bar; dashboard grids become single-column; mobile menu is enabled |
| `640px` | Form, filter, and ticket information grids become one column; detail page uses compact padding |

Responsive requirements:

- Do not allow text to overlap controls.
- Preserve stable button, table, and timeline dimensions.
- Use local overflow for tables and timelines instead of page-wide horizontal scrolling.
- Keep action menus inside the viewport on narrow screens.
- Keep touch targets usable even when visual controls are compact.

## Three-App Usage Map

### Requester

Use the dashboard KPI, search, ticket table, detail header, action menu, and timeline patterns. Requester-specific classes include `.dashboard-*`, `.ticket-*`, `.detail-*`, and `.timeline-*`.

### Processing

Use `.page`, `.page-header`, `.panel`, `.table-card`, `.table-wrap`, `.primary-button`, `.secondary-button`, and existing status colors. The Processing queue should look like an operational table, not a separate visual theme.

### Analysis

Use `.panel`, `.panel-title`, `.panel-subtitle`, `.bar-row`, `.bar`, `.fill`, and `.label`. Analysis visualizations should reuse the shared chart colors and spacing rather than introducing new chart components for equivalent data.

## Do And Do Not

### Do

- Reuse existing class names and palette values.
- Use semantic HTML and button elements for actions.
- Add `aria-label`, `aria-expanded`, `aria-haspopup`, and menu roles where the interaction requires them.
- Keep scroll areas local and stable.
- Add responsive rules near the existing breakpoint sections.
- Validate with `npm run lint` and `npm run build`.

### Do Not

- Do not create a new color for a state that already has a semantic color.
- Do not use a text glyph for the ticket back chevron; use the existing CSS chevron pattern.
- Do not make a timeline or table change the surrounding page height unexpectedly.
- Do not duplicate the dashboard scrollbar treatment with a different thumb color.
- Do not create a new button style when `.primary-button`, `.secondary-button`, or `.text-button` applies.
- Do not put page-wide horizontal overflow on mobile.

## Before Opening A Pull Request

- Confirm the component uses the shared class pattern.
- Check desktop and mobile layouts at `900px` and `640px` breakpoints.
- Check keyboard focus, Escape behavior, outside-click behavior, and Enter-to-send where applicable.
- Check long labels and long ticket text for clipping or overlap.
- Run `npm run lint`.
- Run `npm run build`.
- Update this reference when a shared component contract changes.
