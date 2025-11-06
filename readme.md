<img src="images/safari-macOS-26.png" alt="Safari macOS Tab Bar" style="max-width: 551px; display: block; margin: 0 auto;">

# Safari Color Tinting

Apple has quietly abandoned support for using `<meta name="theme-color">` to set the color of Safari browser UI, in favor of using the `background-color` of standard page element.

View how your web browser supports color in its UI:

### [Safari Color Tinting: Demo](http://safari-color-tinting.pages.dev "Safari Color Tinting: Demo")

## Safari 15+: `<meta>`
Safari versions 15 through 18.6 supported a <nobr><code>theme-color</code></nobr> meta tag, allowing developers to directly declare the color of browser UI elements.

```html
<head>
<meta name="theme-color" content="#0044FF">
</head>
```
> While Safari 26+ still parses the <nobr><code>theme-color</code></nobr> meta tag, [Safari no longer uses this color][caniuse].

## Safari 26+: `{position: fixed;}` or `<body>`

Safari 26 now derives browser UI colors automatically:

### `{position: fixed;}`

Safari 26 will first use the <nobr><code>background-color</code></nobr> of elements fixed to the top or bottom of the page.

Safari will only use an element that is:

* within 4 pixels from the top **or** 3 pixels from the bottom on iOS;
* at least 80% wide on iOS **or** 90% wide on macOS; and
* at least 3 pixels high.

```html
<div style="position: fixed; top: 4px; width: 90%; background-color: #FF7700;">
```

```css
div { position: fixed; bottom: 3px; width: 90%; background-color: #FF7700; }
```

### `<body>`

Safari 26 will then use the <nobr><code>background-color</code></nobr> of the `<body>` element if there are no suitable fixed elements.

```html
<body style="background-color: #0088FF;">
```

```css
body { background-color: #0088FF; }
```

## Safari: Luma

Safari uses the luma (perceived brightness) of the selected color to determine if browser UI text should be dark or light:

### [**Luma: Apple & Perceived Brightness**][luma]

## Safari Settings

Users can enable or disable browser UI color tinting in Safari:

<!-- :icon-chevron-right: &rsaquo; -->
<!-- :icon-checkbox: ✓ -->
**macOS**: Safari &rsaquo; Settings &rsaquo; Tabs &rsaquo; Appearance: <nobr>✓ Show color in tab bar</nobr>

**iOS**: Settings &rsaquo; Apps › Safari &rsaquo; Tabs: <nobr>Allow Website Tinting ✓</nobr>

&nbsp;

## Web Standards Documentation:

The `theme-color` meta tag remains part of web standards:

- [MDN Documentation: `<meta>` tags](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta)
- [MDN Documentation: `theme-color`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/name/theme-color)
- [WHATWG HTML Specification: `theme-color`](https://html.spec.whatwg.org/multipage/semantics.html#meta-theme-color)

[caniuse]: https://caniuse.com/meta-theme-color
[luma]: luma.md