---
name: accessibility-checker
description: Audita accesibilidad WCAG 2.2 AA de componentes TSX/HTML/CSS y aplica fixes automáticamente. Incluye verificación de contraste del design system.
disable-model-invocation: true
mode: subagent
allowed-tools: Bash(git status:*), Bash(npm run lint:*), Bash(npx tsc:*)
---

# /a11y — Accessibility Checker

Audita archivos TSX, HTML y CSS contra WCAG 2.2 AA y aplica fixes automáticamente.

## Session context

Current repository state:
!`git status --short`

Current branch:
!`git branch --show-current`

---

## Instructions

Follow these phases in strict order. **Do not advance to the next phase if the previous one did not complete correctly.**

---

### Phase 1 — Read file and context

1. **Read the target file** specified by the user argument.
2. **Read layout context**: `app/layout.tsx` (check for `lang` attribute, skip links).
3. **Read styles**: `app/globals.css` (theme colors, font sizes).
4. **Read imported components** to understand their accessibility patterns.
5. If the file does not exist, report the error and stop.

---

### Phase 2 — Audit against WCAG 2.2 AA

Run a comprehensive audit using the checklist below. Check every applicable criterion.

#### Perceivable (Perceptible)

| #   | Criterion                     | What to check                                                                                                                                                        |
| --- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1  | 1.1.1 Non-text Content        | All `<img>` have `alt`. Decorative images use `alt=""`. Complex graphics use `role="img"` + `aria-labelledby`. Icons use `aria-hidden="true"` with accessible label. |
| P2  | 1.2.1 Audio-only & Video-only | Media elements have alternatives (transcripts, captions).                                                                                                            |
| P3  | 1.3.1 Info and Relationships  | Semantic HTML used correctly. Headings in order (h1→h2→h3). Lists use `<ul>`/`<ol>`. Tables have `<caption>`, `scope`, or `aria-labelledby`.                         |
| P4  | 1.3.2 Meaningful Sequence     | DOM order matches visual/reading order.                                                                                                                              |
| P5  | 1.3.3 Sensory Characteristics | Instructions don't rely solely on shape, size, or visual location.                                                                                                   |
| P6  | 1.3.4 Orientation             | Content works in both portrait and landscape (no forced orientation).                                                                                                |
| P7  | 1.3.5 Identify Input Purpose  | Form inputs use `autocomplete` where applicable.                                                                                                                     |
| P8  | 1.4.1 Use of Color            | Information is not conveyed by color alone. Links have underlines or other non-color indicators.                                                                     |
| P9  | 1.4.2 Audio Control           | No auto-playing audio.                                                                                                                                               |
| P10 | 1.4.3 Contrast (Minimum)      | Text contrast ≥ 4.5:1. Large text (18pt+ or 14pt bold) ≥ 3:1. Use design system contrast table below.                                                                |
| P11 | 1.4.4 Resize text             | Text can be resized to 200% without loss of content or functionality. Avoid fixed `px` sizes; use `rem`.                                                             |
| P12 | 1.4.5 Images of Text          | Text is not embedded in images (use real text).                                                                                                                      |
| P13 | 1.4.10 Reflow                 | Content is readable at 400% zoom without horizontal scrolling.                                                                                                       |
| P14 | 1.4.11 Non-text Contrast      | UI components and graphical objects have contrast ≥ 3:1 against adjacent colors.                                                                                     |
| P15 | 1.4.12 Text Spacing           | Text remains readable with increased line-height (1.5), letter-spacing (0.12em), word-spacing (0.16em), paragraph spacing (2×).                                      |

#### Operable (Operable)

| #   | Criterion                              | What to check                                                             |
| --- | -------------------------------------- | ------------------------------------------------------------------------- |
| O1  | 2.1.1 Keyboard                         | All functionality available via keyboard. No mouse-only interactions.     |
| O2  | 2.1.2 No Keyboard Trap                 | Focus can move away from any element using standard keyboard navigation.  |
| O3  | 2.1.4 Character Key Shortcuts          | Keyboard shortcuts can be turned off or remapped.                         |
| O4  | 2.2.1 Timing Adjustable                | Users can turn off, adjust, or extend time limits (min 20× default).      |
| O5  | 2.2.2 Pause, Stop, Hide                | Moving, blinking, or auto-updating content can be paused or stopped.      |
| O6  | 2.3.1 Three Flashes                    | No content flashes more than 3 times per second.                          |
| O7  | 2.4.1 Bypass Blocks                    | Skip navigation link or equivalent mechanism exists.                      |
| O8  | 2.4.2 Page Titled                      | Page has descriptive `<title>`.                                           |
| O9  | 2.4.3 Focus Order                      | Tab order is logical and intuitive.                                       |
| O10 | 2.4.4 Link Purpose (In Context)        | Link text describes its purpose. Avoid "click here" or "read more" alone. |
| O11 | 2.4.5 Multiple Ways                    | Multiple ways to find content (navigation, search, sitemap).              |
| O12 | 2.4.6 Headings and Labels              | Headings and labels are descriptive and clear.                            |
| O13 | 2.4.7 Focus Visible                    | Focus indicator is visible on all interactive elements.                   |
| O14 | 2.5.1 Pointer Gestures                 | All pointer gestures have single-pointer alternatives.                    |
| O15 | 2.5.2 Pointer Cancellation             | No down-event actions without up-event cancellation or undo.              |
| O16 | 2.5.3 Label in Name                    | Visible label matches accessible name (for speech input users).           |
| O17 | 2.5.4 Motion Actuation                 | Motion-based activation can be disabled; UI controls also available.      |
| O18 | 2.5.5 Target Size (Enhanced)           | Interactive targets are at least 44×44 CSS pixels (WCAG 2.2 AA).          |
| O19 | 2.5.6 Concurrent Input                 | No disabling of platform-provided input modalities.                       |
| O20 | 2.5.7 Dragging Movements (WCAG 2.2)    | Dragging operations have single-pointer alternatives.                     |
| O21 | 2.5.8 Target Size (Minimum) (WCAG 2.2) | Interactive targets are at least 24×24 CSS pixels.                        |

#### Understandable (Comprensible)

| #   | Criterion                                               | What to check                                                                                     |
| --- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| U1  | 3.1.1 Language of Page                                  | `<html lang="es">` or appropriate language is set.                                                |
| U2  | 3.1.2 Language of Parts                                 | `lang` attribute on content in different languages.                                               |
| U3  | 3.2.1 On Focus                                          | No unexpected context changes on focus.                                                           |
| U4  | 3.2.2 On Input                                          | No unexpected context changes on input.                                                           |
| U5  | 3.2.3 Consistent Navigation                             | Navigation is consistent across pages.                                                            |
| U6  | 3.2.4 Consistent Identification                         | Same-purpose components are identified consistently.                                              |
| U7  | 3.3.1 Error Identification                              | Form errors are identified in text and linked to the field.                                       |
| U8  | 3.3.2 Labels or Instructions                            | Form inputs have visible labels.                                                                  |
| U9  | 3.3.3 Error Suggestion                                  | Errors include suggestions for correction.                                                        |
| U10 | 3.3.4 Error Prevention (Legal, Financial, Data)         | Submissions are reversible or confirmed.                                                          |
| U11 | 3.3.5 Help                                              | Context-sensitive help is available (tooltips, hints).                                            |
| U12 | 3.3.6 Error Prevention (All) (WCAG 2.2 AAA)             | Submissions can be reviewed before finalizing.                                                    |
| U13 | 3.3.7 Redundant Entry (WCAG 2.2 AA)                     | Previously entered information is auto-populated or selectable.                                   |
| U14 | 3.3.8 Accessible Authentication (Minimum) (WCAG 2.2 AA) | Authentication doesn't rely on cognitive testing (except object recognition or personal content). |

#### Robust (Robusto)

| #   | Criterion               | What to check                                                                                                            |
| --- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| R1  | 4.1.1 Parsing           | Valid HTML/JSX. No duplicate IDs. Proper nesting.                                                                        |
| R2  | 4.1.2 Name, Role, Value | Custom controls have accessible names, roles, and states. `aria-*` attributes are valid and reference existing elements. |
| R3  | 4.1.3 Status Messages   | Status messages use `role="status"` or `role="alert"` with `aria-live`.                                                  |

---

### Design System Contrast Reference

Use this table to flag contrast issues. Calculated against `canvas` (#f6ecdf) background:

| Color            | Hex     | Contrast on canvas | Pass AA text? | Pass AA UI? |
| ---------------- | ------- | ------------------ | ------------- | ----------- |
| `ink`            | #3f362e | ~12.5:1            | ✅ Yes        | ✅ Yes      |
| `text-secondary` | #6e6359 | ~5.8:1             | ✅ Yes        | ✅ Yes      |
| `staff`          | #2e89a6 | ~4.6:1             | ✅ Yes        | ✅ Yes      |
| `staff-deep`     | #1f7a93 | ~6.2:1             | ✅ Yes        | ✅ Yes      |
| `achievement`    | #3e9b6c | ~4.1:1             | ⚠️ Large only | ✅ Yes      |
| `accent`         | #d9583c | ~3.2:1             | ❌ No         | ✅ Yes      |
| `accent-warm`    | #ee8164 | ~2.5:1             | ❌ No         | ❌ No       |
| `accent-soft`    | #f2937a | ~2.0:1             | ❌ No         | ❌ No       |
| `text-muted`     | #94887b | ~2.8:1             | ❌ No         | ❌ No       |
| `muted`          | #a89a8b | ~2.1:1             | ❌ No         | ❌ No       |
| `placeholder`    | #b6a99b | ~1.8:1             | ❌ No         | ❌ No       |
| `line`           | #ece0d0 | ~1.2:1             | ❌ No         | ❌ No       |

**Rules:**

- `text-muted`, `muted`, `placeholder` MUST NOT be used for text that needs to be readable. Flag as **Error**.
- `accent` can be used for UI components (buttons, borders) but NOT for body text. Flag body text as **Error**.
- `accent-warm`, `accent-soft` should only be used for decorative backgrounds or large graphical elements. Flag text usage as **Error**.

---

### Phase 3 — Generate Report

Format the audit results:

```
## Accessibility Report: <file>

### ❌ Errors (must fix)
- [L<line>] <issue description> → <suggested fix>
- [L<line>] Color `<color-name>` on `canvas` fails contrast (<ratio>:1 < 4.5:1) → Use `<alternative-color>` or darken

### ⚠️ Warnings (should fix)
- [L<line>] <issue description> → <suggested fix>

### ℹ️ Info (nice to have)
- [L<line>] <issue description> → <suggestion>

### Score: X/Y criteria checked (Z% passed)
```

**Severity definitions:**

- **Error**: Violates WCAG 2.2 AA. Must be fixed. Includes contrast failures, missing alt text, missing labels, keyboard traps, invalid ARIA.
- **Warning**: May cause accessibility issues or is a best practice violation. Includes missing focus styles, unclear link text, semantic HTML improvements.
- **Info**: Enhancement suggestions that improve accessibility but are not required for AA compliance.

---

### Phase 4 — Apply Fixes

After showing the report, ask the user:

> Shall I apply the fixes for the Errors and Warnings listed above? [Y/n]

If confirmed:

1. **Apply fixes in order** (Errors first, then Warnings).
2. **Show a diff** of changes before committing.
3. **Run lint and typecheck** to ensure no regressions:
   - `npm run lint`
   - `npx tsc --noEmit`
4. If lint/typecheck fails, fix the issues and re-run.
5. Confirm all fixes applied successfully.

**Fix examples:**

| Issue                                         | Fix                                                                                   |
| --------------------------------------------- | ------------------------------------------------------------------------------------- |
| Missing `alt` on `<img>`                      | Add `alt="descriptive text"` or `alt=""` if decorative                                |
| `<div onClick>`                               | Replace with `<button>` or add `role="button" tabIndex={0} onKeyDown={handleKeyDown}` |
| Missing label on input                        | Add `<label htmlFor="id">` or `aria-label`                                            |
| Contrast failure                              | Replace color with accessible alternative from design system                          |
| Missing `lang` on `<html>`                    | Add `lang="es"` to `<html>` in layout.tsx                                             |
| Modal without focus trap                      | Add focus trap with `useEffect` and restore focus on close                            |
| Missing `aria-describedby` on input with hint | Add `aria-describedby="hint-id"` and `id="hint-id"` on hint element                   |
| Radio group without `fieldset`                | Wrap in `<fieldset>` with `<legend>`                                                  |
| Error message not linked to input             | Add `role="alert"` to error and `aria-describedby` on input                           |
| Missing skip navigation                       | Add `<a href="#main" className="sr-only focus:not-sr-only">` at top of layout         |

---

### Phase 5 — Re-verify

After applying fixes:

1. **Re-read the file** to confirm changes were applied.
2. **Run the audit again** on the fixed file.
3. **Report final score** and any remaining issues.

```
## Verification Complete

### Fixes applied: X errors, Y warnings
### New score: X'/Y criteria checked (Z'% passed)
### Remaining issues: <list or "None">
```

---

## Error handling

| Error                              | Action                                                                             |
| ---------------------------------- | ---------------------------------------------------------------------------------- |
| File not found                     | Report error, suggest checking path                                                |
| Cannot parse TSX/JSX               | Check for syntax errors, suggest fixing first                                      |
| Lint fails after fix               | Show error, fix the lint issue, re-run                                             |
| Typecheck fails after fix          | Show error, fix the type issue, re-run                                             |
| Color contrast calculation unclear | Use WCAG contrast formula: (L1 + 0.05) / (L2 + 0.05) where L is relative luminance |

---

## Common patterns to recognize

### Modal dialogs

- Must have `role="dialog"` and `aria-modal="true"`
- Must have `aria-labelledby` pointing to title
- Must trap focus inside
- Must close on Escape key
- Must restore focus to trigger element on close
- Must have visible close button

### Forms

- Every input must have a visible label
- Required fields: `aria-required="true"` + visual indicator
- Invalid fields: `aria-invalid="true"` + error linked via `aria-describedby`
- Error messages: `role="alert"` for screen reader announcement
- Radio/checkbox groups: `<fieldset>` + `<legend>`
- Validation on blur, NOT on every keystroke

### Navigation

- Use `<nav>` with `aria-label` for each nav region
- Current page link: `aria-current="page"`
- Skip link at top of page
- Mobile menu: trap focus, close on Escape, restore focus

### Tables

- Use `<table>` for data, not layout
- `<caption>` for table description
- `scope="col"` / `scope="row"` on headers
- Complex tables: `aria-labelledby` or `headers`/`id` associations

### Dynamic content

- Loading states: `aria-busy="true"` + `aria-label="Loading"`
- Status updates: `role="status"` or `role="alert"` with `aria-live`
- Toasts/notifications: `role="alert"` + focus management
- Infinite scroll: announce new content with `aria-live`

### Images and icons

- Informative images: descriptive `alt`
- Decorative images: `alt=""`
- Icon fonts/SVGs: `aria-hidden="true"` + accessible label nearby
- Complex graphics: `role="img"` + `aria-labelledby`

---

## Quick reference: ARIA patterns

### Tabs

```tsx
<div role="tablist" aria-label="Section name">
  <button role="tab" aria-selected={active === 0} aria-controls="panel-0" id="tab-0" tabIndex={active === 0 ? 0 : -1}>Tab 1</button>
  <button role="tab" aria-selected={active === 1} aria-controls="panel-1" id="tab-1" tabIndex={active === 1 ? 0 : -1}>Tab 2</button>
</div>
<div role="tabpanel" id="panel-0" aria-labelledby="tab-0" hidden={active !== 0}>...</div>
<div role="tabpanel" id="panel-1" aria-labelledby="tab-1" hidden={active !== 1}>...</div>
```

### Accessible form field

```tsx
<div className="field">
  <label htmlFor="email">
    Email
    <span aria-hidden="true">*</span>
    <span className="sr-only">(required)</span>
  </label>
  <input
    type="email"
    id="email"
    aria-required="true"
    aria-invalid={!!error}
    aria-describedby={error ? 'email-error' : 'email-hint'}
  />
  {error ? (
    <p id="email-error" role="alert" className="error">
      {error}
    </p>
  ) : (
    <p id="email-hint" className="hint">
      Hint text here
    </p>
  )}
</div>
```

### Screen reader only utility

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

---

## Summary of expected behavior

```
/a11y components/kids/KidCard.tsx

  Phase 1  →  Reads file, layout.tsx, globals.css, imports
  Phase 2  →  Audits against WCAG 2.2 AA checklist (50+ criteria)
              Checks design system contrast values
  Phase 3  →  Generates report: Errors, Warnings, Info, Score
  Phase 4  →  Applies fixes with user confirmation
              Runs lint + typecheck to verify
  Phase 5  →  Re-verifies and reports final score
```
