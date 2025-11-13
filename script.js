// Bootstrap Colors preset for color pickers
const bootstrapColors = [
  '#031633', '#052c65', '#084298', '#0a58ca', '#0d6efd', '#3d8bfd',
  '#6ea8fe', '#9ec5fe', '#cfe2ff',
  '#140330', '#290661', '#3d0a91', '#520dc2', '#6610f2', '#8540f5',
  '#a370f7', '#c29ffa', '#e0cffc',
  '#160d27', '#2c1a4d', '#432874', '#59359a', '#6f42c1', '#8c68cd',
  '#a98eda', '#c5b3e6', '#e2d9f3',
  '#2b0a1a', '#561435', '#801f4f', '#ab296a', '#d63384', '#de5c9d',
  '#e685b5', '#efadce', '#f7d6e6',
  '#2c0b0e', '#58151c', '#842029', '#b02a37', '#dc3545', '#e35d6a',
  '#ea868f', '#f1aeb5', '#f8d7da',
  '#331904', '#653208', '#984c0c', '#ca6510', '#fd7e14', '#fd9843',
  '#feb272', '#fecba1', '#ffe5d0',
  '#332701', '#664d03', '#997404', '#cc9a06', '#ffc107', '#ffcd39',
  '#ffda6a', '#ffe69c', '#fff3cd',
  '#051b11', '#0a3622', '#0f5132', '#146c43', '#198754', '#479f76',
  '#75b798', '#a3cfbb', '#d1e7dd',
  '#06281e', '#0d503c', '#13795b', '#1aa179', '#20c997', '#4dd4ac',
  '#79dfc1', '#a6e9d5', '#d2f4ea',
  '#032830', '#055160', '#087990', '#0aa2c0', '#0dcaf0', '#3dd5f3',
  '#6edff6', '#9eeaf9', '#cff4fc',
  '#212529', '#343a40', '#495057', '#6c757d', '#adb5bd', '#ced4da',
  '#dee2e6', '#e9ecef', '#f8f9fa',
];

const selectThemeWithLuma = (bgColor) => {
  // Get luma value from luma.js
  const Y = getLuma(bgColor);

  // Threshold: roughly midpoint (127.5)
  // Y ≤ 127.5 = dark background, use dark theme with light text
  // Y > 127.5 = light background, use light theme with dark text
  return Y <= 127.5;
};

// Check if 6-digit hex can be shortened to 3-digit
// Can only shorten if each character appears twice: aabbcc → abc
const canShortenHex = (hex) => {
    // Remove # if present and ensure lowercase
    const clean = hex.replace(/^#/, '').toLowerCase();
    if (clean.length !== 6) return false;

    // Check if pattern is aabbcc (each char doubles)
    return clean[0] === clean[1] && clean[2] === clean[3] && clean[4] === clean[5];
};

// Shorten 6-digit hex to 3-digit: 0088ff → 08f
const shortenHex = (hex) => {
    const clean = hex.replace(/^#/, '').toLowerCase();
    if (clean.length === 6 && canShortenHex(clean)) {
        return clean[0] + clean[2] + clean[4];
    }
    return clean; // Return as-is if can't shorten
};

// Expand 3-digit hex to 6-digit: 08f → 0088ff
const expandHex = (hex) => {
    const clean = hex.replace(/^#/, '').toLowerCase();
    if (clean.length === 3) {
        return clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2];
    }
    return clean; // Already 6 digits or invalid
};


const hexToRgb = (hex) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

// Detect if a string is RGB/RGBA format
const isRgbFormat = (str) => /^rgba?\s*\(/i.test(str);

// Detect if a string is HEX format
const isHexFormat = (str) => /^#?[0-9a-fA-F]{3,8}$/.test(str);

// Normalize RGB to no alpha (remove alpha channel)
const normalizeRgb = (rgb) => {
    // Match rgb(r, g, b) or rgba(r, g, b, a) with various formats
    const match = rgb.match(/rgba?\s*\(\s*(\d+)\s*,?\s*(\d+)\s*,?\s*(\d+)\s*(?:,?\s*[\d.]+\s*)?\)/i);
    if (match) {
        const [, r, g, b] = match;
        return `rgb(${r}, ${g}, ${b})`;
    }
    return rgb;
};

// Normalize hex to 6-digit format (no alpha)
const normalizeHex = (hex) => {
    // Remove # if present
    hex = hex.replace(/^#/, '');

    // If 3-digit hex, expand to 6-digit
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }

    // If 8-digit hex (with alpha), strip alpha channel
    if (hex.length === 8) {
        hex = hex.substring(0, 6);
    }

    // If 4-digit hex (with alpha), expand to 6-digit and strip alpha
    if (hex.length === 4) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }

    // Ensure we only have 6 characters
    hex = hex.substring(0, 6);

    // Return with # prefix in lowercase
    return '#' + hex.toLowerCase();
};

// Normalize color value based on format
const normalizeColor = (value) => {
    const str = String(value).trim();

    if (isRgbFormat(str)) {
        return normalizeRgb(str);
    } else if (isHexFormat(str)) {
        return normalizeHex(str);
    }

    // If unknown format, try to normalize as hex
    return normalizeHex(str);
};

const rgbToHex = (r, g, b) => "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);

// Helper function to convert HEX to HSL
const hexToHsl = (hex) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return null;

    let r = rgb.r / 255;
    let g = rgb.g / 255;
    let b = rgb.b / 255;

    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }

    return {
        h: h * 360,
        s: s * 100,
        l: l * 100
    };
};

// Helper function to convert HSL to HEX
const hslToHex = (h, s, l) => {
    h /= 360;
    s /= 100;
    l /= 100;
    let c = (1 - Math.abs(2 * l - 1)) * s;
    let x = c * (1 - Math.abs((h * 6) % 2 - 1));
    let m = l - c / 2;
    let r = 0,
        g = 0,
        b = 0;

    if (0 <= h && h < 1 / 6) {
        r = c;
        g = x;
        b = 0;
    } else if (1 / 6 <= h && h < 2 / 6) {
        r = x;
        g = c;
        b = 0;
    } else if (2 / 6 <= h && h < 3 / 6) {
        r = 0;
        g = c;
        b = x;
    } else if (3 / 6 <= h && h < 4 / 6) {
        r = 0;
        g = x;
        b = c;
    } else if (4 / 6 <= h && h < 5 / 6) {
        r = x;
        g = 0;
        b = c;
    } else if (5 / 6 <= h && h < 1) {
        r = c;
        g = 0;
        b = x;
    }
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return rgbToHex(r, g, b);
};

// Function to get complementary color
const getComplementaryColor = (hex) => {
    const hsl = hexToHsl(hex);
    if (!hsl) return null;

    let complementaryHue = (hsl.h + 180) % 360;
    return hslToHex(complementaryHue, hsl.s, hsl.l);
};

// Function to get complement colors (returns array of 3 colors including the original)
const getTriadicColors = (hex) => {
    const hsl = hexToHsl(hex);
    if (!hsl) return null;

    const color1 = hex;
    const color2 = hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l);
    const color3 = hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l);

    return [color1, color2, color3];
};









document.addEventListener('DOMContentLoaded', function() {
    console.log("DOMContentLoaded fired");
    console.log("ColorPicker available:", typeof ColorPicker);

    const highlightJsLightTheme = document.querySelector('link[href*="github.min.css"]');
    const highlightJsDarkTheme = document.querySelector('link[href*="github-dark-dimmed.min.css"]');

    // Replace characters with SVG icons
    const svgChevron = '<svg style="position:relative;top:0.15em;" width="1em" height="1em" viewBox="0 0 16 16"><path fill="currentColor" d="M5.0 3.0 L10.2 8.0 L5.0 13.0 L6.4 14.4 L12.8 8.0 L6.4 1.6 Z"/></svg>';


    const replaceCharactersWithSvg = (element) => {
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        const nodesToReplace = [];
        let node;

        while (node = walker.nextNode()) {
            if (node.nodeValue.includes('›')) {
                nodesToReplace.push(node);
            }
        }

        nodesToReplace.forEach(node => {
            const span = document.createElement('span');
            let html = node.nodeValue;
            html = html.replace(/›/g, svgChevron);

            span.innerHTML = html;
            node.parentNode.replaceChild(span, node);
        });
    };

    replaceCharactersWithSvg(document.body);

    // Initialize highlight.js


    // Helper function to escape HTML
    const escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };

    // Body Background Color Picker
    console.log("Attempting to create body color picker");
    console.log("Element #color-picker-body exists:", !!document.getElementById("color-picker-body"));

    if (typeof ColorPicker === 'undefined') {
        console.error("ColorPicker is not available! The color-picker library did not load.");
        return;
    }

    let bodyColorPicker;
    let metaColorPicker;
    let fixedColorPicker;

    // Checkbox references
    let bodyCheckbox;
    let metaCheckbox;
    let fixedCheckbox;

    // Store user-entered values to prevent library from changing them
    let bodyLastValue = '';
    let metaLastValue = '';
    let fixedLastValue = '';
    let isUpdatingBody = false;
    let isUpdatingMeta = false;
    let isUpdatingFixed = false;

    // DOM element references needed by update functions
    const codeGenExample = document.getElementById("code-gen-example");
    const metaThemeColor = document.querySelector("meta[name=theme-color]");
    const fixedTopElement = document.getElementById("fixed-top");
    const fixedBottomElement = document.getElementById("fixed-bottom");

    // Define update functions that will be used by handlers
    const updateURLParams = () => {
        const bodyPickerValue = document.getElementById("color-picker-body").value;
        let bodyColorHex = (bodyPickerValue && bodyPickerValue !== 'inherit') ? expandHex(bodyPickerValue.substring(1)) : '';
        const bodyChecked = bodyCheckbox ? bodyCheckbox.checked : true;

        const metaPickerValue = document.getElementById("color-picker-meta").value;
        let metaColorHex = (metaPickerValue && metaPickerValue !== 'inherit') ? expandHex(metaPickerValue.substring(1)) : '';
        const metaChecked = metaCheckbox ? metaCheckbox.checked : false;

        const fixedPickerValue = document.getElementById("color-picker-fixed").value;
        let fixedColorHex = (fixedPickerValue && fixedPickerValue !== 'inherit') ? expandHex(fixedPickerValue.substring(1)) : '';
        const fixedChecked = fixedCheckbox ? fixedCheckbox.checked : false;

        // New format: omit "1," prefix when checked (implicit), add "0," when unchecked
        const bodyParam = bodyChecked ? bodyColorHex : `0,${bodyColorHex}`;
        const fixedParam = fixedChecked ? fixedColorHex : `0,${fixedColorHex}`;
        const metaParam = metaChecked ? metaColorHex : `0,${metaColorHex}`;

        const queryString = `?b=${bodyParam}&f=${fixedParam}&m=${metaParam}`;
        const newUrl = window.location.origin + window.location.pathname + queryString;
        history.replaceState(null, '', newUrl);
    };

    const updateGeneratedCode = () => {
        // Get current values and checkbox states
        const bodyPickerValue = document.getElementById("color-picker-body").value;
        const bodyChecked = bodyCheckbox && bodyCheckbox.checked;
        const bodyHex = bodyPickerValue && bodyPickerValue !== 'inherit' ? normalizeColor(bodyPickerValue) : null;

        const metaPickerValue = document.getElementById("color-picker-meta").value;
        const metaChecked = metaCheckbox && metaCheckbox.checked;
        const metaHex = metaPickerValue && metaPickerValue !== 'inherit' ? normalizeColor(metaPickerValue) : null;

        const fixedPickerValue = document.getElementById("color-picker-fixed").value;
        const fixedChecked = fixedCheckbox && fixedCheckbox.checked;
        const fixedHex = fixedPickerValue && fixedPickerValue !== 'inherit' ? normalizeColor(fixedPickerValue) : null;

        // Build the consolidated HTML code example
        let headContent = '';
        if (metaHex && metaChecked) {
            headContent = `    <meta name="theme-color" content="${metaHex}">`;
        }

        let bodyStyle = '';
        if (bodyHex && bodyChecked) {
            bodyStyle = `background-color: ${bodyHex};`;
        }

        let divStyle = 'position: fixed; top: 0;';
        if (fixedHex && fixedChecked) {
            divStyle += ` background-color: ${fixedHex};`;
        }

        const codeExample = `<head>
${headContent ? headContent + '\n' : ''}</head>
<body style="${bodyStyle}">
    <div style="${divStyle}">
    </div>
</body>`;

        // Update the code block
        if (codeGenExample) {
            codeGenExample.textContent = codeExample;
            delete codeGenExample.dataset.highlighted;
            hljs.highlightElement(codeGenExample);
        }
    };

    const updateBodyColors = (hexColor, applyStyle = true) => {
        // Get the current input value and checkbox state
        const inputValue = document.getElementById("color-picker-body").value;
        const isChecked = bodyCheckbox && bodyCheckbox.checked;
        const hex = inputValue && inputValue !== 'inherit' ? normalizeColor(inputValue) : null;

        // Apply styles to page if checkbox is checked
        if (isChecked && hex) {
            document.body.style.backgroundColor = hex;

            const useDarkThemeWithLightText = selectThemeWithLuma(hex);
            document.body.classList.toggle('dark-theme', useDarkThemeWithLightText);
            document.body.classList.toggle('light-theme', !useDarkThemeWithLightText);

            if (highlightJsLightTheme && highlightJsDarkTheme) {
                if (useDarkThemeWithLightText) {
                    highlightJsLightTheme.disabled = true;
                    highlightJsDarkTheme.disabled = false;
                } else {
                    highlightJsLightTheme.disabled = false;
                    highlightJsDarkTheme.disabled = true;
                }
            }
        } else {
            // Don't apply color to page
            document.body.style.backgroundColor = '';

            // Apply theme based on white background
            const useDarkThemeWithLightText = selectThemeWithLuma('#FFFFFF');
            document.body.classList.toggle('dark-theme', useDarkThemeWithLightText);
            document.body.classList.toggle('light-theme', !useDarkThemeWithLightText);

            if (highlightJsLightTheme && highlightJsDarkTheme) {
                if (useDarkThemeWithLightText) {
                    highlightJsLightTheme.disabled = true;
                    highlightJsDarkTheme.disabled = false;
                } else {
                    highlightJsLightTheme.disabled = false;
                    highlightJsDarkTheme.disabled = true;
                }
            }
        }
        updateURLParams();
        updateGeneratedCode();
    };

    const updateMetaColors = (hexColor, applyStyle = true) => {
        // Get the current input value and checkbox state
        const inputValue = document.getElementById("color-picker-meta").value;
        const isChecked = metaCheckbox && metaCheckbox.checked;
        const hex = inputValue && inputValue !== 'inherit' ? normalizeColor(inputValue) : null;

        // Only apply meta theme color if applyStyle is true and checkbox is checked
        const shouldApplyColor = applyStyle && metaCheckbox && metaCheckbox.checked && hexColor && hexColor.trim() !== '';

        if (shouldApplyColor) {
            const colorToApply = normalizeColor(hexColor);
            metaThemeColor.content = colorToApply;
        } else {
            metaThemeColor.content = '';
        }

        updateURLParams();
        updateGeneratedCode();
    };

    const updateFixedColors = (hexColor, applyStyle = true) => {
        // Get the current input value and checkbox state
        const inputValue = document.getElementById("color-picker-fixed").value;
        const isChecked = fixedCheckbox && fixedCheckbox.checked;
        const hex = inputValue && inputValue !== 'inherit' ? normalizeColor(inputValue) : null;

        // Only apply fixed colors if applyStyle is true and checkbox is checked
        const shouldApplyColor = applyStyle && fixedCheckbox && fixedCheckbox.checked && hexColor && hexColor.trim() !== '';

        if (shouldApplyColor) {
            const colorToApply = normalizeColor(hexColor);
            if (fixedTopElement) {
                fixedTopElement.style.backgroundColor = colorToApply;
            }
            if (fixedBottomElement) {
                fixedBottomElement.style.backgroundColor = colorToApply;
            }
        } else {
            if (fixedTopElement) {
                fixedTopElement.style.backgroundColor = '';
            }
            if (fixedBottomElement) {
                fixedBottomElement.style.backgroundColor = '';
            }
        }

        updateURLParams();
        updateGeneratedCode();
    };

    // Define fixed and meta change handlers at module scope so they can be reused
    const handleFixedChange = function(e) {
        console.log('handleFixedChange called, value:', e.target.value, 'fixedColorPicker:', !!fixedColorPicker);
        isUpdatingFixed = true;
        const value = e.target.value;
        // Allow empty values - just clear and don't set to "inherit"
        if (!value || value.trim() === '') {
            fixedLastValue = '';
            e.target.value = '';
            // Only update if checkbox is checked
            if (fixedCheckbox && fixedCheckbox.checked) {
                updateFixedColors('');
            }
        } else {
            const normalized = normalizeColor(value);
            console.log('Normalized color:', normalized);
            fixedLastValue = normalized;

            // Always update the color picker widget to show the new color first
            if (fixedColorPicker) {
                console.log('Attempting to update fixedColorPicker');
                try {
                    fixedColorPicker.color = new ColorPicker.Color(normalized);
                    fixedColorPicker.update();
                    console.log('Successfully updated fixedColorPicker');
                } catch (error) {
                    console.error("Failed to update fixed color picker:", error);
                }
            } else {
                console.error('fixedColorPicker is undefined!');
            }

            // Update URL params
            updateURLParams();

            // Only update actual colors if checkbox is checked
            if (fixedCheckbox && fixedCheckbox.checked) {
                updateFixedColors(normalized);
            }
        }
        setTimeout(() => { isUpdatingFixed = false; }, 0);
    };

    const handleMetaChange = function(e) {
        isUpdatingMeta = true;
        const value = e.target.value;
        // Allow empty values - just clear and don't set to "inherit"
        if (!value || value.trim() === '') {
            metaLastValue = '';
            e.target.value = '';
            // Only update if checkbox is checked
            if (metaCheckbox && metaCheckbox.checked) {
                updateMetaColors('');
            }
        } else {
            const normalized = normalizeColor(value);
            metaLastValue = normalized;

            // Always update the color picker widget to show the new color first
            if (metaColorPicker) {
                try {
                    metaColorPicker.color = new ColorPicker.Color(normalized);
                    metaColorPicker.update();
                } catch (error) {
                    console.error("Failed to update meta color picker:", error);
                }
            }

            // Update URL params
            updateURLParams();

            // Only update actual colors if checkbox is checked
            if (metaCheckbox && metaCheckbox.checked) {
                updateMetaColors(normalized);
            }
        }
        setTimeout(() => { isUpdatingMeta = false; }, 0);
    };

    // Capture initial URL parameter values BEFORE initializing pickers
    const urlParams = new URLSearchParams(window.location.search);
    const capturedBodyParam = urlParams.get('b');
    const capturedFixedParam = urlParams.get('f');
    const capturedMetaParam = urlParams.get('m');

    // Helper function to extract color from param
    // New format: "08F" or "0088FF" (checked, implicit) or "0,08F" or "0,0088FF" (unchecked, explicit)
    // Old format: "1,0088FF" (checked) or "0,0088FF" (unchecked)
    const extractColorFromParam = (param) => {
        if (!param || param.trim() === '' || param.toLowerCase() === 'false' || param.toLowerCase() === 'none') {
            return '';
        }
        // Check if format includes comma (explicit checkbox state)
        const parts = param.split(',');
        if (parts.length === 2) {
            const colorValue = parts[1].trim();
            if (colorValue.match(/^[0-9a-fA-F]{3,6}$/)) {
                // Expand 3-digit to 6-digit if needed
                const expanded = expandHex(colorValue);
                return `#${expanded}`;
            }
            return colorValue;
        }
        // No comma = implicit checked state, entire value is the color
        if (param.match(/^[0-9a-fA-F]{3,6}$/)) {
            // Expand 3-digit to 6-digit if needed
            const expanded = expandHex(param);
            return `#${expanded}`;
        }
        return param;
    };

    // Store initial values: URL param if exists and valid, otherwise use hardcoded defaults
    const initialBodyColorValue = extractColorFromParam(capturedBodyParam) || '#0088FF';
    const initialFixedColorValue = extractColorFromParam(capturedFixedParam) || '#FFCC33';
    const initialMetaColorValue = extractColorFromParam(capturedMetaParam) || '#363636';

    const initializeColorPickers = () => {
        // Get checkbox elements
        bodyCheckbox = document.getElementById("checkbox-body");
        metaCheckbox = document.getElementById("checkbox-meta");
        fixedCheckbox = document.getElementById("checkbox-fixed");

        const bodyPickerInput = document.getElementById("color-picker-body");
        // Normalize initial value (respects format - HEX or RGB)
        bodyPickerInput.value = normalizeColor(bodyPickerInput.value);
        bodyLastValue = bodyPickerInput.value;

        // Set initial data-format based on value
        if (isRgbFormat(bodyPickerInput.value)) {
            bodyPickerInput.setAttribute('data-format', 'rgb');
        } else {
            bodyPickerInput.setAttribute('data-format', 'hex');
        }

        bodyColorPicker = new ColorPicker(bodyPickerInput, {
            colorPresets: bootstrapColors,
            colorKeywords: `#0088FF:default,${initialBodyColorValue}:initial`
        });

        const handleBodyChange = function(e) {
            // Store the normalized value immediately
            isUpdatingBody = true;
            const value = e.target.value;

            // Allow empty values - just clear and don't set to "inherit"
            if (!value || value.trim() === '') {
                bodyLastValue = '';
                e.target.value = '';
                // Only update if checkbox is checked
                if (bodyCheckbox && bodyCheckbox.checked) {
                    updateBodyColors('');
                }

                // Update fixed and meta pickers' complement colors to use default color
                const defaultBodyColor = new ColorPicker.Color('#0088FF');
                const newFixedTriadic = defaultBodyColor.clone().spin(180);
                const newFixedTriadicHex = newFixedTriadic.toString().toUpperCase();

                if (fixedColorPicker) {
                    const fixedPickerInput = document.getElementById("color-picker-fixed");
                    const currentFixedValue = fixedPickerInput.value;
                    fixedColorPicker.dispose();
                    fixedColorPicker = new ColorPicker(fixedPickerInput, {
                        colorPresets: bootstrapColors,
                        colorKeywords: `#FFCC33:default,${initialFixedColorValue}:initial,${newFixedTriadicHex}:complement`
                    });
                    fixedPickerInput.value = currentFixedValue;
                    if (currentFixedValue) {
                        fixedColorPicker.color = new ColorPicker.Color(currentFixedValue);
                        fixedColorPicker.update();
                    }
                    fixedPickerInput.addEventListener("colorpicker.change", handleFixedChange);
                    fixedPickerInput.addEventListener("change", handleFixedChange);
                }

                if (metaColorPicker) {
                    const metaPickerInput = document.getElementById("color-picker-meta");
                    const currentMetaValue = metaPickerInput.value;
                    metaColorPicker.dispose();

                    const newTriadic = defaultBodyColor.clone().spin(180);
                    const newTriadicHex = newTriadic.toString();

                    const metaKeywords = `#363636:default,${initialMetaColorValue}:initial,${newTriadicHex}:complement`;

                    metaColorPicker = new ColorPicker(metaPickerInput, {
                        colorPresets: bootstrapColors,
                        colorKeywords: metaKeywords
                    });
                    metaPickerInput.value = currentMetaValue;
                    if (currentMetaValue) {
                        metaColorPicker.color = new ColorPicker.Color(currentMetaValue);
                        metaColorPicker.update();
                    }
                    metaPickerInput.addEventListener("colorpicker.change", handleMetaChange);
                    metaPickerInput.addEventListener("change", handleMetaChange);
                }

                setTimeout(() => { isUpdatingBody = false; }, 0);
                return;
            }

            const normalized = normalizeColor(value);
            bodyLastValue = normalized;

            // Update the color picker widget to show the new color first
            if (bodyColorPicker) {
                try {
                    bodyColorPicker.color = new ColorPicker.Color(normalized);
                    bodyColorPicker.update();
                } catch (error) {
                    console.error("Failed to update body color picker:", error);
                }
            }

            // Only update if checkbox is checked
            if (bodyCheckbox && bodyCheckbox.checked) {
                updateBodyColors(normalized);
            }

            // Update fixed and meta pickers' complement colors in colorKeywords
            const currentBodyColor = bodyColorPicker.color;
            const newFixedTriadic = currentBodyColor.clone().spin(180);
            const newFixedTriadicHex = newFixedTriadic.toString();

            if (fixedColorPicker) {
                // Dispose and recreate the fixed picker with new colorKeywords
                // Fixed uses -120° complement
                const fixedPickerInput = document.getElementById("color-picker-fixed");
                const currentFixedValue = fixedPickerInput.value;
                fixedColorPicker.dispose();
                fixedColorPicker = new ColorPicker(fixedPickerInput, {
                    colorPresets: bootstrapColors,
                    colorKeywords: `#FFCC33:default,${initialFixedColorValue}:initial,${newFixedTriadicHex}:complement`
                });
                // Restore the value
                fixedPickerInput.value = currentFixedValue;
                fixedColorPicker.color = new ColorPicker.Color(currentFixedValue);
                fixedColorPicker.update();

                // Re-attach event handlers
                fixedPickerInput.addEventListener("colorpicker.change", handleFixedChange);
                fixedPickerInput.addEventListener("change", handleFixedChange);
            }

            if (metaColorPicker) {
                // Dispose and recreate the meta picker with new colorKeywords
                // Meta uses 120° complement instead of 180° complementary
                const metaPickerInput = document.getElementById("color-picker-meta");
                const currentMetaValue = metaPickerInput.value;
                metaColorPicker.dispose();

                const newTriadic = currentBodyColor.clone().spin(180);
                const newTriadicHex = newTriadic.toString();

                const metaKeywords = initialMetaColorValue
                    ? `:default,${initialMetaColorValue}:initial,${newTriadicHex}:complement`
                    : `:default,:initial,${newTriadicHex}:complement`;

                metaColorPicker = new ColorPicker(metaPickerInput, {
                    colorPresets: bootstrapColors,
                    colorKeywords: metaKeywords
                });
                // Restore the value
                metaPickerInput.value = currentMetaValue;
                if (currentMetaValue) {
                    metaColorPicker.color = new ColorPicker.Color(currentMetaValue);
                    metaColorPicker.update();
                }

                // Re-attach event handlers
                metaPickerInput.addEventListener("colorpicker.change", handleMetaChange);
                metaPickerInput.addEventListener("change", handleMetaChange);
            }

            setTimeout(() => { isUpdatingBody = false; }, 0);
        };

        // Only listen to colorpicker.change (when using the visual picker)
        bodyPickerInput.addEventListener("colorpicker.change", handleBodyChange);


        // Use blur event to handle manual text input
        // This fires when user clicks away or tabs out
        bodyPickerInput.addEventListener("blur", function(e) {
            const currentValue = e.target.value;

            // If the value is "inherit", clear it - we don't want that
            if (currentValue && currentValue.toLowerCase() === 'inherit') {
                e.target.value = '';
                return;
            }

            // Check for valid hex color only
            if (currentValue && currentValue.match(/^#?[0-9a-fA-F]{3,8}$/)) {
                // Trigger the change handler which will normalize and update everything
                handleBodyChange(e);
            }
        });

        const metaPickerInput = document.getElementById("color-picker-meta");
        metaPickerInput.value = normalizeColor(metaPickerInput.value);
        metaLastValue = metaPickerInput.value;

        // Set initial data-format based on value
        if (isRgbFormat(metaPickerInput.value)) {
            metaPickerInput.setAttribute('data-format', 'rgb');
        } else {
            metaPickerInput.setAttribute('data-format', 'hex');
        }

        // META colorKeywords: default=#363636, initial=URL param or #363636, complement=120° from body
        const metaKeywords = `#363636:default,${initialMetaColorValue}:initial,#0088FF:complement`;

        metaColorPicker = new ColorPicker(metaPickerInput, {
            colorPresets: bootstrapColors,
            colorKeywords: metaKeywords
        });

        // Only listen to colorpicker.change (when using the visual picker)
        metaPickerInput.addEventListener("colorpicker.change", handleMetaChange);

        // Use blur event to handle manual text input
        // This fires when user clicks away or tabs out
        metaPickerInput.addEventListener("blur", function(e) {
            const currentValue = e.target.value;

            // If the value is "inherit", clear it - we don't want that
            if (currentValue && currentValue.toLowerCase() === 'inherit') {
                e.target.value = '';
                return;
            }

            // Check for valid hex color only
            if (currentValue && currentValue.match(/^#?[0-9a-fA-F]{3,8}$/)) {
                // Trigger the change handler which will normalize and update everything
                handleMetaChange(e);
            }
        });

        const fixedPickerInput = document.getElementById("color-picker-fixed");
        fixedPickerInput.value = normalizeColor(fixedPickerInput.value);
        fixedLastValue = fixedPickerInput.value;

        // Set initial data-format based on value
        if (isRgbFormat(fixedPickerInput.value)) {
            fixedPickerInput.setAttribute('data-format', 'rgb');
        } else {
            fixedPickerInput.setAttribute('data-format', 'hex');
        }

        // Note: Initial complement will be calculated after body color is synced from URL
        // For now, use a placeholder that will be updated
        fixedColorPicker = new ColorPicker(fixedPickerInput, {
            colorPresets: bootstrapColors,
            colorKeywords: `#FFCC33:default,${initialFixedColorValue}:initial,#0088FF:complement`
        });

        // Only listen to colorpicker.change (when using the visual picker)
        fixedPickerInput.addEventListener("colorpicker.change", handleFixedChange);

        // Use blur event to handle manual text input
        // This fires when user clicks away or tabs out
        fixedPickerInput.addEventListener("blur", function(e) {
            const currentValue = e.target.value;

            // If the value is "inherit", clear it - we don't want that
            if (currentValue && currentValue.toLowerCase() === 'inherit') {
                e.target.value = '';
                return;
            }

            // Check for valid hex color only
            if (currentValue && currentValue.match(/^#?[0-9a-fA-F]{3,8}$/)) {
                // Trigger the change handler which will normalize and update everything
                handleFixedChange(e);
            }
        });

        // Add checkbox event listeners
        bodyCheckbox.addEventListener("change", function() {
            const currentValue = document.getElementById("color-picker-body").value;
            // Always pass the current value - the function will handle checkbox state
            updateBodyColors(currentValue);
        });

        metaCheckbox.addEventListener("change", function() {
            const currentValue = document.getElementById("color-picker-meta").value;
            // Always pass the current value - the function will handle checkbox state
            updateMetaColors(currentValue);
            // Reload page to force Safari to re-sample colors when unchecked
            if (!this.checked) {
                window.location.reload();
            }
        });

        fixedCheckbox.addEventListener("change", function() {
            const currentValue = document.getElementById("color-picker-fixed").value;
            // Always pass the current value - the function will handle checkbox state
            updateFixedColors(currentValue);
            // Reload page to force Safari to re-sample colors when unchecked
            if (!this.checked) {
                window.location.reload();
            }
        });
    };

    // Define setInitialColorsFromURL before calling it
    const setInitialColorsFromURL = () => {
        const urlParams = new URLSearchParams(window.location.search);
        let bodyColorParam = urlParams.get('b');
        let metaColorParam = urlParams.get('m');
        let fixedColorParam = urlParams.get('f');

        // Parse checkbox state and color
        // New format: "08F" or "0088FF" (checked, implicit) or "0,08F" or "0,0088FF" (unchecked, explicit)
        // Old format: "1,0088FF" (checked) or "0,0088FF" (unchecked)
        const parseParam = (paramStr) => {
            if (!paramStr || paramStr.trim() === '') return { checked: false, color: 'inherit' };

            const parts = paramStr.split(',');
            if (parts.length === 2) {
                // Explicit checkbox state with comma
                const checked = parts[0] === '1';
                const colorValue = parts[1].trim();
                if (!colorValue || colorValue === '') return { checked, color: 'inherit' };
                if (colorValue.match(/^[0-9a-fA-F]{3,6}$/)) {
                    // Expand 3-digit to 6-digit if needed
                    const expanded = expandHex(colorValue);
                    return { checked, color: `#${expanded}` };
                }
                return { checked, color: colorValue.toLowerCase() };
            }

            // No comma = implicit checked state (new format)
            if (paramStr.toLowerCase() === 'false' || paramStr.toLowerCase() === 'none') return { checked: false, color: 'inherit' };
            if (paramStr.match(/^[0-9a-fA-F]{3,6}$/)) {
                // Expand 3-digit to 6-digit if needed
                const expanded = expandHex(paramStr);
                return { checked: true, color: `#${expanded}` };
            } else if (paramStr.match(/^\d{1,3},\s*\d{1,3},\s*\d{1,3}$/)) {
                return { checked: true, color: `rgb(${paramStr})` };
            }
            return { checked: true, color: paramStr.toLowerCase() };
        };

        const bodyParam = parseParam(bodyColorParam);
        const metaParam = parseParam(metaColorParam);
        const fixedParam = parseParam(fixedColorParam);

        // Check if parameters are explicitly in the URL (not just null/missing)
        const bodyParamExists = urlParams.has('b');
        const metaParamExists = urlParams.has('m');
        const fixedParamExists = urlParams.has('f');

        // Count how many parameters are set to actual color values (not inherit, not false)
        const paramsSet = [bodyParam.color, metaParam.color, fixedParam.color].filter(c => c !== 'inherit').length;

        // Count how many parameters are explicitly present in URL (even if =false)
        const paramsInURL = [bodyParamExists, metaParamExists, fixedParamExists].filter(p => p === true).length;

        // Triadic color logic: if only one color is set AND other params are NOT in the URL
        // (i.e., ?b=04F or ?b=0044FF should trigger complement, but ?b=04F&m=0,&f=0, should NOT)
        // Fixed uses -120° (counterclockwise), Meta uses +120° (clockwise) from Body
        if (paramsSet === 1 && paramsInURL === 1) {
            if (bodyParam.color && bodyParam.color !== 'inherit') {
                // Body is set: Fixed = Body-120°, Meta = Body+120°
                const bodyColor = new ColorPicker.Color(bodyParam.color);
                fixedParam.color = bodyColor.clone().spin(180).toString();
                fixedParam.checked = true;
                metaParam.color = bodyColor.clone().spin(180).toString();
                metaParam.checked = true;
            } else if (fixedParam.color && fixedParam.color !== 'inherit') {
                // Fixed is set: Body = Fixed+120°, Meta = Fixed+240° (or Fixed-120°)
                const fixedColor = new ColorPicker.Color(fixedParam.color);
                bodyParam.color = fixedColor.clone().spin(180).toString();
                bodyParam.checked = true;
                metaParam.color = fixedColor.clone().spin(180).toString();
                metaParam.checked = true;
            } else if (metaParam.color && metaParam.color !== 'inherit') {
                // Meta is set: Body = Meta-120°, Fixed = Meta-240° (or Meta+120°)
                const metaColor = new ColorPicker.Color(metaParam.color);
                bodyParam.color = metaColor.clone().spin(180).toString();
                bodyParam.checked = true;
                fixedParam.color = metaColor.clone().spin(180).toString();
                fixedParam.checked = true;
            }
        }

        if (bodyParamExists) {
            // URL param exists
            try {
                document.getElementById("color-picker-body").value = bodyParam.color !== 'inherit' ? bodyParam.color : "inherit";
                if (bodyCheckbox) bodyCheckbox.checked = bodyParam.checked;
            } catch (e) {
                console.error("Failed to set body color from URL:", e);
            }
        } else {
            // No param in URL - set default body color
            try {
                document.getElementById("color-picker-body").value = "#0088FF";
                if (bodyCheckbox) bodyCheckbox.checked = true;
            } catch (e) {
                console.error("Failed to set default body color:", e);
            }
        }

        if (metaParamExists) {
            // URL param exists
            try {
                document.getElementById("color-picker-meta").value = metaParam.color !== 'inherit' ? metaParam.color : "inherit";
                if (metaCheckbox) metaCheckbox.checked = metaParam.checked;
            } catch (e) {
                console.error("Failed to set meta color from URL:", e);
            }
        } else {
            // No meta param in URL - use default color and uncheck checkbox
            try {
                document.getElementById("color-picker-meta").value = "#363636";
                if (metaCheckbox) metaCheckbox.checked = false;
            } catch (e) {
                console.error("Failed to set default meta color:", e);
            }
        }

        if (fixedParamExists) {
            // URL param exists
            try {
                document.getElementById("color-picker-fixed").value = fixedParam.color !== 'inherit' ? fixedParam.color : "inherit";
                if (fixedCheckbox) fixedCheckbox.checked = fixedParam.checked;
            } catch (e) {
                console.error("Failed to set fixed color from URL:", e);
            }
        } else {
            // No fixed param in URL - set default value and check by default
            try {
                document.getElementById("color-picker-fixed").value = "#FFCC33";
                if (fixedCheckbox) fixedCheckbox.checked = true;
            } catch (e) {
                console.error("Failed to set default fixed color:", e);
            }
        }
    };

    // Call initializeColorPickers after DOMContentLoaded
    initializeColorPickers();

    // Set initial colors from URL AFTER initializing pickers
    // then update the pickers to reflect the new values
    setInitialColorsFromURL();

    // Force update all pickers after URL values are applied
    // Use the Color class to parse the input value and set picker color
    if (bodyColorPicker) {
        const bodyInputValue = document.getElementById("color-picker-body").value;
        if (bodyInputValue && bodyInputValue !== '') {
            bodyColorPicker.color = new ColorPicker.Color(bodyInputValue);
            bodyColorPicker.update();

            // Update fixed and meta pickers' complement colors after body color is set from URL
            const currentBodyColor = bodyColorPicker.color;
            const newFixedTriadic = currentBodyColor.clone().spin(180);
            const newFixedTriadicHex = newFixedTriadic.toString();

            if (fixedColorPicker) {
                // Dispose and recreate the fixed picker with new colorKeywords
                // Fixed uses -120° complement
                const fixedPickerInput = document.getElementById("color-picker-fixed");
                const currentFixedValue = fixedPickerInput.value;
                fixedColorPicker.dispose();
                fixedColorPicker = new ColorPicker(fixedPickerInput, {
                    colorPresets: bootstrapColors,
                    colorKeywords: `#FFCC33:default,${initialFixedColorValue}:initial,${newFixedTriadicHex}:complement`
                });
                // Restore the value and re-attach event handlers
                fixedPickerInput.value = currentFixedValue;
                fixedColorPicker.color = new ColorPicker.Color(currentFixedValue);
                fixedColorPicker.update();

                // handleFixedChange is already defined earlier
                fixedPickerInput.addEventListener("colorpicker.change", handleFixedChange);
            }

            if (metaColorPicker) {
                // Dispose and recreate the meta picker with new colorKeywords
                // Meta uses 120° complement instead of 180° complementary
                const metaPickerInput = document.getElementById("color-picker-meta");
                const currentMetaValue = metaPickerInput.value;
                metaColorPicker.dispose();

                const newTriadic = currentBodyColor.clone().spin(180);
                const newTriadicHex = newTriadic.toString();

                const metaKeywords = initialMetaColorValue
                    ? `:default,${initialMetaColorValue}:initial,${newTriadicHex}:complement`
                    : `:default,:initial,${newTriadicHex}:complement`;

                metaColorPicker = new ColorPicker(metaPickerInput, {
                    colorPresets: bootstrapColors,
                    colorKeywords: metaKeywords
                });
                // Restore the value and re-attach event handlers
                metaPickerInput.value = currentMetaValue;
                if (currentMetaValue) {
                    metaColorPicker.color = new ColorPicker.Color(currentMetaValue);
                    metaColorPicker.update();
                }

                // handleMetaChange is already defined earlier
                metaPickerInput.addEventListener("colorpicker.change", handleMetaChange);
            }
        }
    }
    if (metaColorPicker) {
        const metaInputValue = document.getElementById("color-picker-meta").value;
        if (metaInputValue && metaInputValue !== '') {
            metaColorPicker.color = new ColorPicker.Color(metaInputValue);
            metaColorPicker.update();
        }
    }
    if (fixedColorPicker) {
        const fixedInputValue = document.getElementById("color-picker-fixed").value;
        if (fixedInputValue && fixedInputValue !== '') {
            fixedColorPicker.color = new ColorPicker.Color(fixedInputValue);
            fixedColorPicker.update();
        }
    }

    // Apply initial colors and generate code on page load
    // Call update functions which will:
    // 1. Always generate code with current input values
    // 2. Only apply styles if checkbox is checked

    const bodyValue = document.getElementById("color-picker-body").value;
    updateBodyColors(bodyValue);

    const metaValue = document.getElementById("color-picker-meta").value;
    updateMetaColors(metaValue);

    const fixedValue = document.getElementById("color-picker-fixed").value;
    updateFixedColors(fixedValue);

    // Initialize highlight.js after initial colors are set
    hljs.highlightAll();

    // Apply highlight.js to generated code block if it has content
    if (codeGenExample && codeGenExample.textContent.trim() !== '') {
        delete codeGenExample.dataset.highlighted;
        hljs.highlightElement(codeGenExample);
    }

    // Fallback function for copying to clipboard in non-secure contexts
    // MUST be defined BEFORE Share and Copy buttons that use it
    const copyToClipboardFallback = (text) => {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            const successful = document.execCommand('copy');
            if (successful) {
                console.log('URL copied to clipboard (fallback):', text);
            } else {
                console.error('Fallback copy failed');
            }
        } catch (error) {
            console.error('Fallback copy error:', error);
        }

        document.body.removeChild(textArea);
    };

    // Share Button Logic
    const shareButton = document.getElementById("shareButton");
    if (shareButton) {
        shareButton.addEventListener("click", () => {
            // Get hex values and checkbox states
            const bodyPickerValue = document.getElementById("color-picker-body").value;
            let bodyColorHex = (bodyPickerValue && bodyPickerValue !== 'inherit') ? expandHex(bodyPickerValue.substring(1)) : '';
            const bodyChecked = bodyCheckbox ? bodyCheckbox.checked : true;

            const metaPickerValue = document.getElementById("color-picker-meta").value;
            let metaColorHex = (metaPickerValue && metaPickerValue !== 'inherit') ? expandHex(metaPickerValue.substring(1)) : '';
            const metaChecked = metaCheckbox ? metaCheckbox.checked : false;

            const fixedPickerValue = document.getElementById("color-picker-fixed").value;
            let fixedColorHex = (fixedPickerValue && fixedPickerValue !== 'inherit') ? expandHex(fixedPickerValue.substring(1)) : '';
            const fixedChecked = fixedCheckbox ? fixedCheckbox.checked : false;

            // New format: omit "1," prefix when checked (implicit), add "0," when unchecked
            const bodyParam = bodyChecked ? bodyColorHex : `0,${bodyColorHex}`;
            const fixedParam = fixedChecked ? fixedColorHex : `0,${fixedColorHex}`;
            const metaParam = metaChecked ? metaColorHex : `0,${metaColorHex}`;

            const queryString = `?b=${bodyParam}&f=${fixedParam}&m=${metaParam}`;
            const shareUrl = window.location.origin + window.location.pathname + queryString;

            console.log('Share button clicked');
            console.log('navigator.share available:', !!navigator.share);
            console.log('Share URL:', shareUrl);

            // Check if Web Share API is available (requires secure context: https or localhost)
            if (navigator.share && window.isSecureContext) {
                const shareData = { url: shareUrl };

                navigator.share(shareData)
                    .then(() => {
                        console.log('Share successful');
                    })
                    .catch((error) => {
                        console.log('Share error:', error.name, error.message);
                        // If share fails and it's not because user cancelled, use fallback
                        if (error.name !== 'AbortError') {
                            copyToClipboardFallback(shareUrl);
                        }
                    });
            } else {
                // No Web Share API or not secure context, use clipboard fallback
                console.log('Web Share API not available, using clipboard fallback');
                copyToClipboardFallback(shareUrl);
            }
        });
    }

    // Copy Button Logic
    const copyButton = document.getElementById("copyButton");
    if (copyButton) {
        copyButton.addEventListener("click", async () => {
            console.log('bodyColorPicker value:', document.getElementById("color-picker-body").value);
            console.log('metaColorPicker value:', document.getElementById("color-picker-meta").value);
            console.log('fixedColorPicker value:', document.getElementById("color-picker-fixed").value);

            // Get hex values and checkbox states
            const bodyPickerValue = document.getElementById("color-picker-body").value;
            let bodyColorHex = (bodyPickerValue && bodyPickerValue !== 'inherit') ? expandHex(bodyPickerValue.substring(1)) : '';
            const bodyChecked = bodyCheckbox ? bodyCheckbox.checked : true;

            const metaPickerValue = document.getElementById("color-picker-meta").value;
            let metaColorHex = (metaPickerValue && metaPickerValue !== 'inherit') ? expandHex(metaPickerValue.substring(1)) : '';
            const metaChecked = metaCheckbox ? metaCheckbox.checked : false;

            const fixedPickerValue = document.getElementById("color-picker-fixed").value;
            let fixedColorHex = (fixedPickerValue && fixedPickerValue !== 'inherit') ? expandHex(fixedPickerValue.substring(1)) : '';
            const fixedChecked = fixedCheckbox ? fixedCheckbox.checked : false;

            console.log('Copy Button Clicked:');
            console.log('bodyColorHex:', bodyColorHex, 'bodyChecked:', bodyChecked);
            console.log('metaColorHex:', metaColorHex, 'metaChecked:', metaChecked);
            console.log('fixedColorHex:', fixedColorHex, 'fixedChecked:', fixedChecked);

            // New format: omit "1," prefix when checked (implicit), add "0," when unchecked
            const bodyParam = bodyChecked ? bodyColorHex : `0,${bodyColorHex}`;
            const fixedParam = fixedChecked ? fixedColorHex : `0,${fixedColorHex}`;
            const metaParam = metaChecked ? metaColorHex : `0,${metaColorHex}`;

            const queryString = `?b=${bodyParam}&f=${fixedParam}&m=${metaParam}`;
            const copyUrl = window.location.origin + window.location.pathname + queryString;
            console.log('Copy URL:', copyUrl);

            // Try modern Clipboard API first, fallback to legacy method
            if (navigator.clipboard && navigator.clipboard.writeText) {
                try {
                    await navigator.clipboard.writeText(copyUrl);
                    console.log('URL copied to clipboard:', copyUrl);
                } catch (error) {
                    console.error('Clipboard API failed:', error);
                    // Fallback to legacy method
                    copyToClipboardFallback(copyUrl);
                }
            } else {
                // Fallback for non-secure contexts (http://)
                copyToClipboardFallback(copyUrl);
            }
        });
    }

    // Safari Version Check
    const notSafariNotice = document.getElementById("not-safari-notice");
    if (notSafariNotice) {
        const isApple = navigator.vendor && navigator.vendor.indexOf("Apple") > -1 &&
                        navigator.userAgent && navigator.userAgent.indexOf("Chrome") === -1 &&
                        navigator.userAgent.indexOf("CriOS") === -1 &&
                        navigator.userAgent.indexOf("FxiOS") === -1;

        let safariVersion = 0;
        const versionMatch = navigator.userAgent.match(/Version\/(\d+)/);
        if (versionMatch && versionMatch[1]) {
            safariVersion = parseInt(versionMatch[1]);
        }

        if (isApple && safariVersion >= 15) {
            notSafariNotice.style.display = "none";
        }
    }
});
