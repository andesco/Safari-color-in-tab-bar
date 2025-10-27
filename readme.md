#  Safari Demo: Color in Tab Bar

Apple has quietly abandoned support for using `<meta name="theme-color">` to theme or color Safari’s browser UI, in favor of using the standard `body` element.

View how your web browser supports color in its UI:

### [Safari Demo: Color in Tab Bar](https://safari-color-in-tab-bar.pages.dev)

## Safari: `<body>` vs. `<meta>`

### Safari 15+: `<meta>`
Safari 15 through 18.6 supported the <nobr><code>theme-color</code></nobr> meta tag, allowing developers to declare the color of browser UI elements.
  ```html
  <head>
	<meta name="theme-color" content="#0044FF">
  </head>
  ```

### Safari 26+: `<body>`

Safari 26 now derives browser UI colors automatically using the <nobr><code>background-color</code></nobr> of the standard `<body>` element.
   ```html
   <body style="background-color: #0044FF;">
   ```
   ```css
   body { background-color: #0040FF; }
   ```
> While it still parses the <nobr><code>theme-color</code></nobr> meta tag, [Safari does not actually use the color][caniuse].

Safari then uses the luma (perceived brightness) of the `<body>` <nobr><code>background-color</code></nobr> to determine if browser UI text should be dark or light:

[**Luma: Apple & Perceived Brightness**][luma]


### Safari Settings:

Users can enable or disable color in the tab bar:

<!-- :icon-chevron-right: &rsaquo; -->
<!-- :icon-checkbox: ✓ -->
**macOS**: Safari &rsaquo; Setting &rsaquo; Tabs &rsaquo; Appearance: ✓ Show color in tab bar

**iOS**: Settings &rsaquo; Safari &rsaquo; Tabs: Allow Website Tinting ✓

&nbsp;

### Web Standards Documentation:

The `theme-color` meta tag remains part of web standards:

- [MDN Documentation: `<meta>` tags](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta)
- [MDN Documentation: `theme-color`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/name/theme-color)
- [WHATWG HTML Specification: `theme-color`](https://html.spec.whatwg.org/multipage/semantics.html#meta-theme-color)

[caniuse]: https://caniuse.com/meta-theme-color
[luma]: luma.md