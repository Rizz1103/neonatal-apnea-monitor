---
name: Precision Edge Telemetry Console
colors:
  surface: '#111417'
  surface-dim: '#111417'
  surface-bright: '#37393d'
  surface-container-lowest: '#0b0f11'
  surface-container-low: '#191c1f'
  surface-container: '#1d2023'
  surface-container-high: '#272a2d'
  surface-container-highest: '#323538'
  on-surface: '#e1e2e6'
  on-surface-variant: '#d8c3ad'
  inverse-surface: '#e1e2e6'
  inverse-on-surface: '#2e3134'
  outline: '#a18d7a'
  outline-variant: '#534434'
  surface-tint: '#ffb961'
  primary: '#ffbe70'
  on-primary: '#472a00'
  primary-container: '#f39c12'
  on-primary-container: '#603a00'
  inverse-primary: '#865300'
  secondary: '#ffb4a9'
  on-secondary: '#690001'
  secondary-container: '#8e130c'
  on-secondary-container: '#ff9a8b'
  tertiary: '#b4d1c8'
  on-tertiary: '#1b352f'
  tertiary-container: '#99b5ad'
  on-tertiary-container: '#2d4741'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffddb9'
  primary-fixed-dim: '#ffb961'
  on-primary-fixed: '#2b1700'
  on-primary-fixed-variant: '#663e00'
  secondary-fixed: '#ffdad5'
  secondary-fixed-dim: '#ffb4a9'
  on-secondary-fixed: '#410000'
  on-secondary-fixed-variant: '#8e130c'
  tertiary-fixed: '#cbe9e0'
  tertiary-fixed-dim: '#b0cdc4'
  on-tertiary-fixed: '#04201a'
  on-tertiary-fixed-variant: '#324c45'
  background: '#111417'
  on-background: '#e1e2e6'
  surface-variant: '#323538'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 24px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0em
  body-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-telemetry-lg:
    fontFamily: JetBrains Mono
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: -0.02em
  label-telemetry-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: -0.01em
  label-telemetry-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 14px
    letterSpacing: 0.02em
  label-telemetry-xs:
    fontFamily: JetBrains Mono
    fontSize: 9px
    fontWeight: '500'
    lineHeight: 12px
    letterSpacing: 0.08em
spacing:
  gutter: 0.5rem
  gutter-mobile: 0.25rem
  margin: 1rem
  margin-mobile: 0.5rem
  space-xs: 0.125rem
  space-sm: 0.25rem
  space-md: 0.5rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

This design system defines a mission-critical biomedical edge-AI instrumentation console. The brand personality embodies clinical authority, deterministic engineering rigor, and uncompromised real-time precision. The interface serves bioinformaticians, clinical researchers, and neuro-technologists operating localized low-latency hardware platforms (e.g., INT8 micro-inference engines, bedside physiological decoders, and ambulatory edge units).

The visual aesthetic unites high-end laboratory instrumentation (analog oscilloscopes, quartz spectrometry racks, and surgical telemetry suites) with the density and precision of modern developer tools. It categorically rejects neon cyberpunk motifs, decorative gradients, and clinical commodity hospital blues in favor of an austere, mechanical control environment. Every visual element reflects utility: latency measurements, feature tensors, and physiological telemetry are rendered with uncompromising spatial economy and millimeter-grid precision.

The emotional target is total situational control, stability, and zero-panic clarity during anomalous physiological states.

## Colors

The system operates strictly in dark mode, reflecting the physical reality of low-light operating theaters, electrophysiology suites, and dedicated edge compute stations.

### Foundational Neutrals
- **Canvas Base (`#111315`):** Ground foundation representing deep warm obsidian slate. Reserved for underlying platform backdrops, raw waveform canvas zones, and hardware telemetry frames.
- **Surface Level 1 (`#181B1E`):** Charcoal baseline for primary instrument panels, rail controllers, and console modules.
- **Surface Level 2 (`#202428`):** Elevated data panels, telemetry headers, and docked inspect windows.
- **Surface Level 3 / Active Surface (`#282D32`):** Interactive card backgrounds, input containers, and selected metric rows.
- **Precision Stroke / Graticule (`#2B323A`):** The universal boundary line for dividing layout bays, forming 1px millimeter-grid divisions, and encasing component frames.

### Typographic Contrast
- **Ivory Primary (`#EDECE8`):** Dominant text, acute value readouts, critical indices, and primary values.
- **Muted Alabaster (`#C4C2BC`):** Secondary metrics, unit annotations, active hardware labels, and table column titles.
- **Graphite Low-Emphasis (`#8E8D88`):** Dimension axes, timestamp stamps, TFLite vector dimensions, deactivated hardware ports, and disabled controls.

### Semantic Telemetry Signals
- **Precursor / Rising Risk Accent (`#F39C12` / `#E58E26`):** Primary signal color. Evokes warm amber incandescent warnings. Applied strictly to precursor detections, high variance trends, rising anomaly vectors, and pending threshold states.
- **Critical Event / Candidate Shock (`#C0392B` / `#D9534F`):** Secondary signal color. A restrained terracotta crimson designed to stand out against obsidian slate without causing peripheral visual blinding or flare. Applied to critical anomaly thresholds, dropped inferencing frames, and system hardware faults.
- **Physiological Baseline / Passive Sensor (`#7C9890` / `#5A7870`):** Tertiary signal color. A desaturated, muted celadon phosphor. Designates nominal eustasis, active telemetry sync, resting pulse, and successful model quantizations.

## Typography

Typography enforces a bifurcated hierarchy: structural human-readable navigation is driven by **Inter**, while quantitative operational data, inferencing telemetry, hardware states, and sensor signals rely exclusively on **JetBrains Mono**.

### Structural Sans (Inter)
Inter is utilized strictly for module architecture, metadata group naming, patient record context, and diagnostic labels. Weights are constrained to 400 (Regular), 500 (Medium), and 600 (Semi-Bold) to preserve mechanical authority without decorative bulk. Negative letter-spacing is applied to larger headlines to guarantee high density on compact, high-DPI field screens.

### Telemetry Mono (JetBrains Mono)
JetBrains Mono handles raw physiological readouts (e.g., `124 bpm`, `0.982 AUC`), sampling rate benchmarks (`250 Hz`), tensor dimensionality (`[1, 128, 20]`), inference latency flags (`4.2ms`), memory limits (`184KB / 256KB INT8`), and ISO-8601 millisecond-precision timestamps. JetBrains Mono provides unambiguous glyph discernment (slashed zeros, clear differentiating stems) essential for high-stress telemetry monitoring.

All monospace micro-labels (`label-telemetry-xs`) are set in uppercase with deliberate tracking (`0.08em`) to mimic physical laser-etched control plates.

## Layout & Spacing

The layout adopts a high-density, structural grid modeled after laboratory instrumentation racks and multi-channel oscilloscopes. Information density takes precedence over conventional expansive whitespace. 

### Grid Philosophy
- **Desktop / Console (>= 1280px):** 12 or 16-column structural grid anchored by persistent left-hand hardware bus indicators, a flexible multi-channel signal center bay (e.g., live 250Hz EEG/ECG trace streams), and a right-hand edge-inference diagnostics panel. Outer margin is tightly locked at `1rem`, with columns segmented by `0.5rem` (`gutter`) structural seams.
- **Tablet / Portable Field Unit (768px - 1279px):** 8-column layout. Waveform lanes scale fluidly, while hardware metrics drop into collapsible side drawers.
- **Mobile Handheld (<= 767px):** 4-column layout with fixed `0.5rem` screen edge margins. Telemetry displays reflow from parallel multi-channel strips into a prioritized single-channel feed stacked over micro-cards.

### Internal Density Rhythm
Components scale on an ultra-compact 4px/8px modular baseline (`space-xs: 2px`, `space-sm: 4px`, `space-md: 8px`, `space-lg: 16px`, `space-xl: 24px`). Panel padding defaults strictly to `space-md` (8px) or `space-lg` (16px) to maximize the active viewport for signal visualizers and tabular tensors.

## Elevation & Depth

Visual hierarchy is communicated through **structural tonal layering** and **low-contrast precision outlines**, completely eschewing standard drop shadows, decorative glows, or diffused lighting. 

### Tonal Stratification
- **Recessed / Grid Well (`#111315`):** Waveform canvases, signal plots, and raw terminal feeds sit at the lowest level, inset visually within the frame.
- **Structural Rack Frame (`#181B1E`):** The primary view surface. Houses all persistent modules and control hubs.
- **Deck Panels & Sub-assemblies (`#202428`):** Raised interactive containers, data cards, and telemetry cards.
- **Active / Focused Overlays (`#282D32`):** Dropdowns, drawer flyouts, contextual inspection viewports, and modal parameter inputs.

### 1px Precision Engineering Seams
Every panel, metric module, and instrument boundary is bounded by a crisp `1px solid #2B323A` border. When hovering or selecting an active monitoring lane, the border transitions instantaneously to `#8E8D88` (neutral focus) or `#F39C12` (telemetry flagged state), without layout shifting or pseudo-3D elevation changes.

### Millimeter-Grid Graticule
Backgrounds behind time-series plots and bio-signal streams feature an etched technical graticule: subtle grid intersections spaced at 8px and 32px increments rendered via CSS background rules using `#181B1E` over `#111315`.

## Shapes

The design system enforces a **Sharp (`0`)** shape language (0px border radius across all primary controls, data modules, badges, and canvas borders). 

This zero-radius architecture directly references surgical monitors, precision milling, optical equipment, and rackmounted industrial computers. Sharp corners preserve the rectilinear continuity of the 1px grid seams across multi-panel dashboards, allowing complex matrixes of cards and charts to nest flush without awkward organic negative space at intersections.

Internal interactive targets (such as inner toggle switches and indicator pips) use precise geometric squares or calibrated circular micro-LED dots (e.g., 6px × 6px circle for power/sync indicators).

## Components

### Buttons & Trigger Switches
- **Instrument Action Buttons:** Sharp-cornered, high-density elements (`height: 28px` or `32px`). 
  - *Default / Secondary:* Background `#202428`, border `1px solid #2B323A`, text `#EDECE8` in `label-telemetry-sm`. Hover brings background to `#282D32` and border to `#8E8D88`.
  - *Primary Execution:* Background `#F39C12`, border `1px solid #F39C12`, text `#111315` (bold mono or semi-bold sans). Hover transitions to warm ochre `#E58E26`.
  - *Danger / Abort Trigger:* Background `#C0392B`, border `1px solid #C0392B`, text `#EDECE8`.
- **Rotary / Toggle Switches:** Stepped multi-state toggles enclosed in a `#181B1E` tray with a `1px solid #2B323A` frame; the active state is marked by an illuminated `#282D32` fill and an amber or celadon 2px base indicator line.

### Telemetry Badges & Hardware Status Chips
- Rectilinear tags (`height: 18px` or `20px`), padded `0.25rem 0.5rem`, using `label-telemetry-xs`.
- **Baseline / Nominal:** Border `1px solid #5A7870`, background `rgba(90, 120, 112, 0.12)`, text `#7C9890`. Prefixed with a 4px static `#7C9890` square indicator.
- **Precursor / Warning:** Border `1px solid #E58E26`, background `rgba(229, 142, 38, 0.12)`, text `#F39C12`.
- **Critical Fault:** Border `1px solid #C0392B`, background `rgba(192, 57, 43, 0.15)`, text `#D9534F`. Accompanied by a flashing 1Hz CSS step indicator.
- **INT8 Hardware Specs:** Border `1px solid #2B323A`, background `#111315`, text `#8E8D88`. Used to declare model architecture tags: `TFLite INT8`, `4.2ms`, `RAM 184KB`.

### Input Fields & Parameter Controls
- Background `#111315`, border `1px solid #2B323A`, height `28px`, text `#EDECE8` in `label-telemetry-md`.
- Focus shifts border directly to `1px solid #F39C12` with zero outline ring/glow.
- Integrated right-aligned unit badges (`Hz`, `mV`, `ms`, `sigma`) styled in `#8E8D88`.

### Checkboxes & Segmented Selectors
- **Checkboxes:** 14px × 14px sharp squares. Default state: background `#111315`, border `1px solid #2B323A`. Checked state: background `#202428`, border `1px solid #EDECE8`, containing an ivory 6px solid central square block.
- **Segmented Radio Racks:** Contiguous horizontal blocks sharing 1px common inner borders. Selected segment shifts background to `#282D32` with a 2px top border highlight in `#F39C12`.

### Telemetry Cards & Waveform Bays
- Constructed with `#181B1E` surface and `1px solid #2B323A` perimeter.
- **Card Header:** 24px height strip with background `#141618`, bottom border `1px solid #2B323A`, featuring a left-aligned mono title in `label-telemetry-xs` (`#8E8D88`) and right-aligned sampling telemetry (`250Hz | ch_01`).
- **Inner Canvas:** Deep background `#111315` with an SVG or Canvas millimeter-grid matrix.

### Data Grid / Tensor Matrix Tables
- Fixed column widths, compact row height (24px).
- Alternating subtle row shading (even: `#181B1E`, odd: `#141618`).
- Header cells: `label-telemetry-xs`, tracking `0.08em`, text `#8E8D88`, bottom border `1px solid #2B323A`.
- Numeric data cells: `label-telemetry-md`, strictly right-aligned for rapid visual decimal scanning.