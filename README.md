# Design Lang ✦ Beyond CSS

A declarative design language that compiles to CSS + JS. Instead of hacking CSS to do modern UI patterns, Design Lang makes them native — physics, materials, adaptive layout, accessibility, haptic feedback, and more.

```
element button {
  surface: glass(blur: 12px)
  physics: spring(stiffness: 180, damping: 20, mass: 12g)
  haptic: { on_interact: click(force: 25g) }

  @hover: scale(amount: 1.04)
  @press: scale(amount: 0.95)
}
```

## Install

```bash
npm install -g @empire/design-lang
```

## Usage

```bash
# Compile a .dl file
dl compile button.dl

# Specify output path
dl compile src/components/card.dl -o dist/card

# Scaffold a new project
dl init
```

### Output

Running `dl compile button.dl` produces:
- `button.css` — Compiled CSS
- `button.runtime.js` — JS runtime (spring physics, haptic, audio)
- `button.html` — Preview page

## Syntax

### Elements
```
element name {
  properties...
}
```

### Properties

| Category | Examples |
|---|---|
| **Surfaces** | `glass(blur: 12px)`, `ceramic(glaze: 0.85)`, `metal(finish: brushed)`, `textile(weave: twill)`, `clay(softness: 0.3)`, `grain(intensity: 0.03)` |
| **Physics** | `spring(stiffness: 180, damping: 20, mass: 12g)` |
| **Typography** | `gradient(linear, [cyan, purple])`, `volumetric(value: 900)` |
| **Layout** | `adaptive(priority: "importance")`, `container-relative(gap: 16px)`, `reflow(breakpoints: auto)` |
| **Accessibility** | `contrast: auto(base: WCAG.AAA)`, `touch_targets: 48px`, `motion: respect(user.preference)` |
| **Interactions** | `haptic: { on_interact: click(force: 25g) }`, `audio: { on_hover: chime(freq: 880hz) }` |
| **Effects** | `light: glow(color: cyan, spread: 20px)`, `morph: rounded(radius: 8px, active: 50%)` |
| **Density** | `spacious`, `cozy`, `compact`, `auto` |
| **Accents** | `brutal(color: #FF2D78, weight: 3px, offset: 4px)` |

### Lifecycle Hooks
```
@birth: fade-in(duration: 0.5s)
@hover: scale(amount: 1.04)
@press: scale(amount: 0.95)
```

## Roadmap

- **v0.1** — CLI compiler (current)
- **v0.2** — WAT mode (recompile on save)
- **v0.3** — VS Code extension (syntax highlighting + hover previews)
- **v0.4** — Vite/Rspack plugin (process .dl at build time)
- **v1.0** — Standalone runtime (< 5KB), npm package, playground

## License

MIT — Empire Creative
