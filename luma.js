function getLuma(bgColor) {
  let r, g, b;

  // Check if input is RGB format: rgb(r, g, b) or rgba(r, g, b, a)
  const rgbMatch = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);

  if (rgbMatch) {
    // Parse RGB format
    r = parseInt(rgbMatch[1], 10);
    g = parseInt(rgbMatch[2], 10);
    b = parseInt(rgbMatch[3], 10);
  } else {
    // Parse HEX format
    let hex = bgColor.replace(/^#/, '');

    // Handle shorthand hex (#ABC -> #AABBCC)
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }

    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  }

  // Apple-like "perceptual" brightness (no gamma correction)
  // Uses Rec.709 luma coefficients
  const Y = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  return Y;
}
