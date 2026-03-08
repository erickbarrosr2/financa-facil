

## Dark Mode Implementation Plan

### Current State

The project is already well-prepared for dark mode:
- **CSS variables** for both light and `.dark` class are fully defined in `src/index.css`
- **Tailwind config** already has `darkMode: ["class"]`
- **`next-themes`** package is already installed
- All UI components use semantic Tailwind classes (`bg-background`, `text-foreground`, etc.)
- No hardcoded hex/rgb colors in components (only HSL values in chart configs)

### What Needs to Be Done

**1. Wire up ThemeProvider (next-themes)**

Create `src/components/ThemeProvider.tsx` wrapping `next-themes`'s `ThemeProvider` with:
- `attribute="class"` (matches Tailwind's `darkMode: ["class"]`)
- `defaultTheme="system"` (respects `prefers-color-scheme`)
- `storageKey="financa-facil-theme"` (localStorage persistence)
- `enableSystem={true}`

Wrap the app in `src/App.tsx` with this provider.

**2. Anti-flicker script in `index.html`**

Add an inline `<script>` in `<head>` that reads `localStorage` and applies the `.dark` class before first paint, preventing white flash.

**3. Theme Toggle component**

Create `src/components/ThemeToggle.tsx`:
- Sun/Moon icons with smooth transition
- `aria-label` for accessibility
- Keyboard navigable
- Uses `useTheme()` from `next-themes`

**4. Place the toggle in two locations**

- **AppLayout header** (`src/components/AppLayout.tsx`) -- next to the sidebar trigger
- **Auth page** (`src/pages/Auth.tsx`) -- top-right corner for unauthenticated users

**5. Fix hardcoded chart colors for dark mode**

In `src/pages/Reports.tsx`, the `CartesianGrid` stroke is hardcoded to light mode border color (`hsl(220, 13%, 91%)`). Update to use CSS variable via `getComputedStyle` or a theme-aware approach. The chart colors themselves (green, blue, purple, etc.) work fine in both themes -- only grid/axis strokes need fixing.

**6. Add dark mode tokens for income/expense light backgrounds**

The `.dark` class in `index.css` is missing `--income-light`, `--expense-light`, and `--chart-*` variables. Add appropriate dark variants so colored backgrounds remain visible.

**7. Settings page: add Appearance section**

Add a theme preference selector in `src/pages/SettingsPage.tsx` with three options: Light, Dark, System.

### Files to Create/Edit

| File | Action |
|---|---|
| `src/components/ThemeProvider.tsx` | Create -- thin wrapper around next-themes |
| `src/components/ThemeToggle.tsx` | Create -- accessible toggle button |
| `index.html` | Edit -- add anti-flicker script |
| `src/App.tsx` | Edit -- wrap with ThemeProvider |
| `src/components/AppLayout.tsx` | Edit -- add ThemeToggle to header |
| `src/pages/Auth.tsx` | Edit -- add ThemeToggle |
| `src/index.css` | Edit -- add missing dark mode variables (income-light, expense-light, chart colors) |
| `src/pages/Reports.tsx` | Edit -- fix hardcoded grid stroke color |
| `src/pages/SettingsPage.tsx` | Edit -- add appearance/theme section |

### Technical Details

**Anti-flicker script:**
```html
<script>
  (function(){
    var t=localStorage.getItem('financa-facil-theme');
    if(t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme:dark)').matches))
      document.documentElement.classList.add('dark');
  })();
</script>
```

**Missing dark CSS variables to add:**
```css
.dark {
  --income-light: 160 30% 15%;
  --expense-light: 0 30% 15%;
  --chart-1 through --chart-6: slightly adjusted for dark backgrounds
}
```

**Chart grid fix** -- replace hardcoded `stroke="hsl(220, 13%, 91%)"` with `stroke="hsl(var(--border))"`.

