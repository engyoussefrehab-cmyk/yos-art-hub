# Bezier Logo Constructor (Illustrator JSX)

`BezierLogoConstructor.jsx` rebuilds a logo as clean, editable Bezier paths and can show a technical construction view (grid, guides, thin outlines, square anchors, round handle ends, clearspace grid).

**Run:** `File > Scripts > Other Script...` and pick the file (or copy it to `Illustrator/Presets/<lang>/Scripts`). ExtendScript ES3 only.

## Workflow
1. Select a logo (raster or vector) or choose an image file.
2. Choose a method: auto-trace + rebuild, rebuild existing vectors, or only rebuild the construction view.
3. Set output width, curve tolerance, corner sensitivity, max anchors per shape.
4. Pick construction options (anchors/handles, grid, guides, clearspace) and optional AI / SVG / PDF export.

## Layers
| Layer | Content |
|---|---|
| Reference (original) | dimmed, locked copy of the source |
| Vector - Production | clean paths, anchors selected so Illustrator shows native handles |
| Construction View | locked sub-layers: Clearspace, Grid, Guides, Outline, Handle lines, Handle ends, Anchors |

Production paths are never decorated; delete or hide the Construction View layer for the clean logo.

## Clearspace grid
`x` = a percentage (default 25 %) of the logo height, width or shorter side. The script draws the logo bounds, the dashed clearspace boundary at distance `x`, a tinted zone, an `x`-module grid, and `x` squares at the four corners and four side midpoints (with outlined `x` labels).

## How the curves are rebuilt
Contours are sampled densely, then split at detected corners and horizontal/vertical extrema (axis-aligned handles). Straight runs become true line segments. The remaining spans are fitted with Schneider least-squares cubic Beziers, so joins are G1 and points are minimal. Compound-path winding (counters in O, P, R...) is preserved. If "Max anchors" is set, the tolerance is raised per shape until the limit is met (corners are never removed).
