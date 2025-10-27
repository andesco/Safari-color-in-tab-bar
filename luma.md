# Luma: Apple & Perceived Brightness

Rec. 709 ([ITU Recommendation BT.709][ITU]) is the international standard for <abbr title="high-definition television">HDTV</abbr>. The luma calculation from this standard provides a way to convert RGB color values into a perceived brightness value that closely matches human visual perception.

Human eyes are more sensitive to green light than red and to red light than blue. Rec. 709 luma coefficients account for this by weighting each color channel differently. The weighted sum produces a single brightness value that represents how bright a color appears to the human eye.

&nbsp;   | variable | range | weight
---------|----------|-------|-------
Red      | `R`      | 0-255 | 21.26%
Green    | `G`      | 0-255 | 71.52%
Blue     | `B`      | 0-255 |  7.22%
**Luma** | **`Y`**  | 0-255 |

### Luma Formula

```
Y = ( 0.2126 × R ) + ( 0.7152 × G ) + ( 0.0722 × B )
````

### JavaScript Implementation

```javascript
function selectThemeWithLuma(bgColor) {
  // remove leading #
  let hex = bgColor.replace(/^#/, '');

  // parse RGB components from hex
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // calculate Rec. 709 Luma using standard coefficients
  const Y = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  // threshold at midpoint: 127.5
  // Y ≤ 127.5 = dark background, use light text
  // Y > 127.5 = light background, use dark text
  return Y <= 127.5;
}
```

## Key Characteristics

### No Gamma Correction
Unlike [relative luminance][WCAG] in <abbr title="World Wide Web Consortium">W3C</abbr> Accessibility Guidelines, the ITU implementation applies the coefficients directly to gamma-corrected RGB values for an approach that is simpler (no complex gamma correction) and faster (fewer operations per calculation).

| Feature | Rec. 709 Luma | WCAG Relative Luminance |
|---------|---------------|-------------------------|
| RGB Coefficients | 0.2126, 0.7152, 0.0722 | 0.2126, 0.7152, 0.0722 |
| Gamma Correction | No | Yes: complex formula |
| Output Range | 0-255 | 0-1 |
| Threshold | 127.5 | 0.179 |
| Use Case | Perceived Brightness | Accessibility Contrast Ratios |

### Output Range
- **minimum**: 0 → Luma value for black `#000000`
- **maximum**: 255 → Luma value for white `#FFFFFF`
- **midpoint**: 127.5

## Apple & Perceived Brightness

Apple uses the luma **midpoint** (127.5) to determine text color on backgrounds. Apple  divides the full luma range into two equal halves, providing a simple and consistent decision boundary.

When Safari uses a webpage <nobr><code>background-color</code></nobr> to color browser UI, it also calculates the <nobr><code>background-color</code></nobr> luma to set browser UI text color:

- **Luma ≤ 127.5**: \
background is considered **dark** → Safari uses **light text**
- **Luma > 127.5**: \
background is considered **light** → Safari uses **dark text**

This midpoint threshold ensures maximum legibility by selecting text colors that provide strong contrast against the background.

### Examples

| Background | Background | `R` | `G` | `B` | `Y` | Text Color
|-------|-----|---|---|---|----------|-------|
| Black | `#000000` | 0 | 0 | 0 | 0.00 | light |
| Blue | `#0000FF` | 0 | 0 | 255 | 18.41 | light |
| Red | `#FF0000` | 255 | 0 | 0 | 54.21 | light |
| Gray | `#808080` | 128 | 128 | 128 | 128.00 | dark |
| Green | `#00FF00` | 0 | 255 | 0 | 182.38 | dark |
| Yellow | `#FFFF00` | 255 | 255 | 0 | 236.59 | dark |
| White | `#FFFFFF` | 255 | 255 | 255 | 255.00 | dark |

## References

- [ITU-R Recommendation BT.709][ITU]
- [W3C Accessibility Guidelines: relative luminance][WCAG]
- [Wikipedia: Luma][wiki]
- [Apple Developer: System-Defined Color Spaces][Apple]


[ITU]: https://www.itu.int/rec/R-REC-BT.709/
[WCAG]: https://www.w3.org/WAI/GL/wiki/Relative_luminance
[wiki]: https://en.wikipedia.org/wiki/Luma_(video)
[Apple]: https://developer.apple.com/documentation/coregraphics/cgcolorspace/itur_709