function selectThemeWithLuma(bgColor) {
  // Get luma value from luma.js
  const Y = getLuma(bgColor);

  // Threshold: roughly midpoint (127.5)
  // Y ≤ 127.5 = dark background, use dark theme with light text
  // Y > 127.5 = light background, use light theme with dark text
  return Y <= 127.5;
}

function hexToRgb(hex) {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

// Helper function to convert HEX to HSL
function hexToHsl(hex) {
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
}

// Helper function to convert HSL to HEX
function hslToHex(h, s, l) {
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
}

// Function to get complementary color
function getComplementaryColor(hex) {
    const hsl = hexToHsl(hex);
    if (!hsl) return null;

    let complementaryHue = (hsl.h + 180) % 360;
    return hslToHex(complementaryHue, hsl.s, hsl.l);
}

// Function to get triadic colors (returns array of 3 colors including the original)
function getTriadicColors(hex) {
    const hsl = hexToHsl(hex);
    if (!hsl) return null;

    const color1 = hex;
    const color2 = hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l);
    const color3 = hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l);

    return [color1, color2, color3];
}









document.addEventListener('DOMContentLoaded', function() {
    console.log("DOMContentLoaded fired");
    console.log("window.iro available:", typeof window.iro);

    const highlightJsLightTheme = document.querySelector('link[href*="github.min.css"]');
    const highlightJsDarkTheme = document.querySelector('link[href*="github-dark-dimmed.min.css"]');

    // Replace characters with SVG icons
    const svgChevron = '<svg style="position:relative;top:0.15em;" width="1em" height="1em" viewBox="0 0 16 16"><path fill="currentColor" d="M5.0 3.0 L10.2 8.0 L5.0 13.0 L6.4 14.4 L12.8 8.0 L6.4 1.6 Z"/></svg>';


    function replaceCharactersWithSvg(element) {
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
    }

    replaceCharactersWithSvg(document.body);

    // Initialize highlight.js


    // Helper function to escape HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Body Background Color Picker
    console.log("Attempting to create body color picker");
    console.log("Element #color-picker-body exists:", !!document.getElementById("color-picker-body"));

    if (!window.iro) {
        console.error("window.iro is not available! The iro.js library did not load.");
        return;
    }

    let bodyColorPicker;
    let metaColorPicker;
    let menuColorPicker;
    let bodyColorInput = document.getElementById("color-input-body"); // Assign value immediately
    let metaColorInput = document.getElementById("color-input-meta"); // Assign value immediately
    let menuColorInput = document.getElementById("color-input-menu"); // Assign value immediately

    // Flags to prevent circular updates when clearing inputs
    let isBodyClearing = false;
    let isMetaClearing = false;
    let isMenuClearing = false;

    function initializeColorPickers() {
        bodyColorPicker = new window.iro.ColorPicker("#color-picker-body", {
            width: 187,
            color: "#0088FF"
        });
        // Input value is set in HTML to #0088FF

        bodyColorPicker.on("color:change", updateBodyColors);
        bodyColorInput.addEventListener('change', function() {
            if (this.value.trim() === '') {
                // Set flag to prevent circular update
                isBodyClearing = true;

                // Clear the color - reset to default state
                document.body.style.backgroundColor = '';
                const cardBackground = document.querySelector('.cards-flex-wrapper .card-background');
                if (cardBackground) {
                    cardBackground.style.backgroundColor = '';
                    cardBackground.classList.add('not-set');
                }
                // Set color picker to gray (this will trigger updateBodyColors)
                try {
                    bodyColorPicker.color.set('#808080');
                } catch (e) {
                    console.error("Failed to set body color picker to gray:", e);
                }
                // Update generated code
                const codeGenBody = document.getElementById("code-gen-body");
                if (codeGenBody) {
                    codeGenBody.textContent = `<body style=""></body>`;
                    delete codeGenBody.dataset.highlighted;
                    hljs.highlightElement(codeGenBody);
                }
                // Apply theme based on white background
                const useDarkThemeWithLightText = selectThemeWithLuma('#FFFFFF');
                document.body.classList.toggle('dark-theme', useDarkThemeWithLightText);
                document.body.classList.toggle('light-theme', !useDarkThemeWithLightText);

                // Reset flag after a brief delay to allow color:change event to complete
                setTimeout(() => {
                    isBodyClearing = false;
                }, 0);
            } else {
                try {
                    bodyColorPicker.color.set(this.value);
                } catch (e) {
                    console.error("Invalid color value:", e);
                }
            }
        });

        metaColorPicker = new window.iro.ColorPicker("#color-picker-meta", {
            width: 187,
            color: "#808080"
        });
        // Don't set input value initially - wait for user interaction or URL param

        metaColorPicker.on("color:change", updateMetaColors);
        metaColorInput.addEventListener('change', function() {
            if (this.value.trim() === '') {
                // Set flag to prevent circular update
                isMetaClearing = true;

                // Clear the color - reset to default state
                const metaThemeColor = document.querySelector("meta[name=theme-color]");
                if (metaThemeColor) {
                    metaThemeColor.content = '';
                }
                const cardTheme = document.querySelector('.cards-flex-wrapper .card-theme');
                if (cardTheme) {
                    cardTheme.style.backgroundColor = '';
                    cardTheme.classList.add('not-set');
                }
                // Set color picker to gray (this will trigger updateMetaColors)
                try {
                    metaColorPicker.color.set('#808080');
                } catch (e) {
                    console.error("Failed to set meta color picker to gray:", e);
                }
                // Update generated code
                const codeGenMeta = document.getElementById("code-gen-meta");
                if (codeGenMeta) {
                    codeGenMeta.textContent = `<head>\n  <meta name="theme-color" content="">\n</head>`;
                    delete codeGenMeta.dataset.highlighted;
                    hljs.highlightElement(codeGenMeta);
                }

                // Reset flag after a brief delay to allow color:change event to complete
                setTimeout(() => {
                    isMetaClearing = false;
                }, 0);
            } else {
                try {
                    metaColorPicker.color.set(this.value);
                } catch (e) {
                    console.error("Invalid color value:", e);
                }
            }
        });

        menuColorPicker = new window.iro.ColorPicker("#color-picker-menu", {
            width: 187,
            color: "#FF8800"
        });
        // Default color set to #FF8800

        menuColorPicker.on("color:change", updateMenuColors);
        menuColorInput.addEventListener('change', function() {
            if (this.value.trim() === '') {
                // Set flag to prevent circular update
                isMenuClearing = true;

                // Clear the color - reset to default state
                const menuTopElement = document.getElementById("menu-top");
                if (menuTopElement) {
                    menuTopElement.style.backgroundColor = '';
                }
                const menuBottomElement = document.getElementById("menu-bottom");
                if (menuBottomElement) {
                    menuBottomElement.style.backgroundColor = '';
                }
                const cardMenu = document.querySelector('.cards-flex-wrapper .card-menu');
                if (cardMenu) {
                    cardMenu.style.backgroundColor = '';
                    cardMenu.classList.add('not-set');
                }
                // Set color picker to gray (this will trigger updateMenuColors)
                try {
                    menuColorPicker.color.set('#808080');
                } catch (e) {
                    console.error("Failed to set menu color picker to gray:", e);
                }
                // Update generated code
                const codeGenMenu = document.getElementById("code-gen-menu");
                if (codeGenMenu) {
                    codeGenMenu.textContent = `<div id="menu-top" style=""></div>`;
                    delete codeGenMenu.dataset.highlighted;
                    hljs.highlightElement(codeGenMenu);
                }

                // Reset flag after a brief delay to allow color:change event to complete
                setTimeout(() => {
                    isMenuClearing = false;
                }, 0);
            } else {
                try {
                    menuColorPicker.color.set(this.value);
                } catch (e) {
                    console.error("Invalid color value:", e);
                }
            }
        });
    }

    // Call initializeColorPickers after DOMContentLoaded
    initializeColorPickers();

    const codeGenBody = document.getElementById("code-gen-body");
    const h1Element = document.getElementById("site-title");
    const h3Elements = document.querySelectorAll("h3");
    const notSafariNoticeSpan = document.getElementById("not-safari-notice");
    const footerElement = document.querySelector("footer");

    function updateURLParams() {
        const bodyColorHex = (bodyColorPicker && bodyColorPicker.color) ? bodyColorPicker.color.hex.substring(1) : '';
        const metaColorHex = (metaColorPicker && metaColorPicker.color) ? metaColorPicker.color.hex.substring(1) : '';
        const menuColorHex = (menuColorPicker && menuColorPicker.color) ? menuColorPicker.color.hex.substring(1) : '';

        const newUrl = new URL(window.location.origin + window.location.pathname);
        if (bodyColorHex) {
            newUrl.searchParams.set('body', bodyColorHex);
        }
        if (metaColorHex) {
            newUrl.searchParams.set('meta', metaColorHex);
        }
        if (menuColorHex) {
            newUrl.searchParams.set('menu', menuColorHex);
        }
        history.replaceState(null, '', newUrl.toString());
    }

            function updateBodyColors(color) {
                // Skip updating input if we're in the process of clearing it
                if (isBodyClearing) {
                    return;
                }

                const rgb = `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`;
                const hex = color.hexString.toUpperCase();

                document.body.style.backgroundColor = hex;
                bodyColorInput.value = hex; // Update input field
                if (codeGenBody) {
                    codeGenBody.textContent = `<body style="background-color: ${hex};"></body>`;
                    delete codeGenBody.dataset.highlighted;
                    hljs.highlightElement(codeGenBody);
                }

                // Set card-background background color
                const cardBackground = document.querySelector('.cards-flex-wrapper .card-background');
                if (cardBackground) {
                    cardBackground.style.backgroundColor = hex;
                    cardBackground.classList.remove('not-set'); // Remove transparency pattern
                    const useDarkThemeWithLightText = selectThemeWithLuma(hex);
                    const textColor = useDarkThemeWithLightText ? '#FFFFFF' : '#000000';
                    const h4 = cardBackground.querySelector('h4');
                    if (h4) {
                        h4.style.color = textColor;
                    }
                }

                const useDarkThemeWithLightText = selectThemeWithLuma(hex);

            // Apply theme classes to body
            document.body.classList.toggle('dark-theme', useDarkThemeWithLightText);
            document.body.classList.toggle('light-theme', !useDarkThemeWithLightText);

            // Re-invert Highlight.js theme logic
            if (highlightJsLightTheme && highlightJsDarkTheme) {
                if (useDarkThemeWithLightText) {
                    highlightJsLightTheme.disabled = true; // Dark body background -> dark code theme
                    highlightJsDarkTheme.disabled = false;
                } else {
                    highlightJsLightTheme.disabled = false; // Light body background -> light code theme
                    highlightJsDarkTheme.disabled = true;
                }
            }
            // updateURLParams();
            }

    const metaThemeColor = document.querySelector("meta[name=theme-color]");
    const codeGenMeta = document.getElementById("code-gen-meta");

    const allCardContainers = document.querySelectorAll(".card-container");

                    function updateMetaColors(color) {
                        // Skip updating input if we're in the process of clearing it
                        if (isMetaClearing) {
                            return;
                        }

                        const hex = color.hexString.toUpperCase();

                        const rgb = `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`;



                        metaThemeColor.content = hex;

                        metaColorInput.value = hex; // Update input field

                                                if (codeGenMeta) {

                                                    codeGenMeta.textContent = `<head>\n  <meta name="theme-color" content="${hex}">\n</head>`;

                                                    delete codeGenMeta.dataset.highlighted;

                                                    hljs.highlightElement(codeGenMeta);

                                                }



                                                                const useDarkThemeWithLightText = selectThemeWithLuma(hex);

                                                                const textColor = useDarkThemeWithLightText ? '#FFFFFF' : '#000000';



                                                        // Update card-theme background
                                                        const cardTheme = document.querySelector('.cards-flex-wrapper .card-theme');
                                                        if (cardTheme) {
                                                            cardTheme.style.backgroundColor = hex;
                                                            cardTheme.classList.remove('not-set'); // Remove transparency pattern
                                                            const h4 = cardTheme.querySelector('h4');
                                                            if (h4) {
                                                                h4.style.color = textColor;
                                                            }
                                                        }

                                // updateURLParams();

                    }

    const menuTopElement = document.getElementById("menu-top");
    const menuBottomElement = document.getElementById("menu-bottom");
    const codeGenMenu = document.getElementById("code-gen-menu");

    function updateMenuColors(color) {
        // Skip updating input if we're in the process of clearing it
        if (isMenuClearing) {
            return;
        }

        const hex = color.hexString.toUpperCase();

        if (menuTopElement) {
            menuTopElement.style.backgroundColor = hex;
        }

        if (menuBottomElement) {
            menuBottomElement.style.backgroundColor = hex;
        }

        menuColorInput.value = hex; // Update input field

        if (codeGenMenu) {
            codeGenMenu.textContent = `<div id="menu-top" style="background-color: ${hex};"></div>`;
            delete codeGenMenu.dataset.highlighted;
            hljs.highlightElement(codeGenMenu);
        }

        // Set card-menu background color
        const cardMenu = document.querySelector('.cards-flex-wrapper .card-menu');
        if (cardMenu) {
            cardMenu.style.backgroundColor = hex;
            cardMenu.classList.remove('not-set'); // Remove transparency pattern
            const useDarkThemeWithLightText = selectThemeWithLuma(hex);
            const textColor = useDarkThemeWithLightText ? '#FFFFFF' : '#000000';
            const h4 = cardMenu.querySelector('h4');
            if (h4) {
                h4.style.color = textColor;
            }
        }

        // updateURLParams();
    }

    function setInitialColorsFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        let bodyColorParam = urlParams.get('body');
        let metaColorParam = urlParams.get('meta');
        let menuColorParam = urlParams.get('menu');

        const formatColor = (colorStr) => {
            if (!colorStr || colorStr.trim() === '' || colorStr.toLowerCase() === 'false') return null;
            if (colorStr.match(/^[0-9a-fA-F]{3,6}$/)) {
                return `#${colorStr.toUpperCase()}`;
            } else if (colorStr.match(/^\d{1,3},\s*\d{1,3},\s*\d{1,3}$/)) {
                return `rgb(${colorStr})`;
            }
            return colorStr.toUpperCase();
        };

        let initialBodyColor = formatColor(bodyColorParam);
        let initialMetaColor = formatColor(metaColorParam);
        let initialMenuColor = formatColor(menuColorParam);

        // Check if parameters are explicitly in the URL (not just null/missing)
        const bodyParamExists = urlParams.has('body');
        const metaParamExists = urlParams.has('meta');
        const menuParamExists = urlParams.has('menu');

        // Count how many parameters are set to actual color values (not null, not false)
        const paramsSet = [initialBodyColor, initialMetaColor, initialMenuColor].filter(c => c !== null).length;

        // Count how many parameters are explicitly present in URL (even if =false)
        const paramsInURL = [bodyParamExists, metaParamExists, menuParamExists].filter(p => p === true).length;

        // Triadic color logic: if only one color is set AND other params are NOT in the URL
        // (i.e., ?body=0044FF should trigger triadic, but ?body=0044FF&meta=false&menu=false should NOT)
        if (paramsSet === 1 && paramsInURL === 1) {
            let baseColor;
            if (initialBodyColor) {
                baseColor = initialBodyColor;
                const triadicColors = getTriadicColors(baseColor);
                initialMetaColor = triadicColors[1];
                initialMenuColor = triadicColors[2];
            } else if (initialMetaColor) {
                baseColor = initialMetaColor;
                const triadicColors = getTriadicColors(baseColor);
                initialBodyColor = triadicColors[1];
                initialMenuColor = triadicColors[2];
            } else if (initialMenuColor) {
                baseColor = initialMenuColor;
                const triadicColors = getTriadicColors(baseColor);
                initialBodyColor = triadicColors[1];
                initialMetaColor = triadicColors[2];
            }
        }

        if (initialBodyColor) {
            try {
                bodyColorPicker.color.set(initialBodyColor);
                bodyColorInput.value = initialBodyColor;
            } catch (e) {
                console.error("Failed to set body color from URL:", e);
            }
        } else if (bodyColorParam && bodyColorParam.toLowerCase() === 'false') {
            // Explicitly set to false - clear the input and set picker to gray
            bodyColorInput.value = '';
            try {
                bodyColorPicker.color.set("#808080");
            } catch (e) {
                console.error("Failed to set body color picker to gray:", e);
            }
        } else {
            // Set default body color to match input default
            try {
                bodyColorPicker.color.set("#0088FF");
                bodyColorInput.value = "#0088FF";
            } catch (e) {
                console.error("Failed to set default body color:", e);
            }
        }

        if (initialMetaColor) {
            try {
                metaColorPicker.color.set(initialMetaColor);
                metaColorInput.value = initialMetaColor;
            } catch (e) {
                console.error("Failed to set meta color from URL:", e);
            }
        } else if (metaColorParam && metaColorParam.toLowerCase() === 'false') {
            // Explicitly set to false - clear the input and set picker to gray
            metaColorInput.value = '';
            try {
                metaColorPicker.color.set("#808080");
            } catch (e) {
                console.error("Failed to set meta color picker to gray:", e);
            }
        } else {
            // No meta param in URL - set picker to gray but don't set input
            try {
                metaColorPicker.color.set("#808080");
            } catch (e) {
                console.error("Failed to set meta color picker to gray:", e);
            }
        }
        // Don't set default meta color - leave it unset until user interacts

        if (initialMenuColor) {
            try {
                menuColorPicker.color.set(initialMenuColor);
                menuColorInput.value = initialMenuColor;
            } catch (e) {
                console.error("Failed to set menu color from URL:", e);
            }
        } else if (menuColorParam && menuColorParam.toLowerCase() === 'false') {
            // Explicitly set to false - clear the input and set picker to gray
            menuColorInput.value = '';
            try {
                menuColorPicker.color.set("#808080");
            } catch (e) {
                console.error("Failed to set menu color picker to gray:", e);
            }
        } else if (!menuParamExists) {
            // No menu param in URL - set default
            try {
                menuColorPicker.color.set("#FF8800");
                menuColorInput.value = "#FF8800";
            } catch (e) {
                console.error("Failed to set default menu color:", e);
            }
        }
    }

    setInitialColorsFromURL();
    // Ensure inputs are updated after URL params are processed and color pickers are initialized
    const urlParams = new URLSearchParams(window.location.search);

    // Apply body color: URL param supersedes default
    const bodyParam = urlParams.get('body');
    if (urlParams.has('body')) {
        // URL param exists - it supersedes default
        if (bodyParam && bodyParam.trim() !== '' && bodyParam.toLowerCase() !== 'false') {
            // Has a color value
            updateBodyColors(bodyColorPicker.color);
        } else {
            // =false or empty - leave blank/unset, but apply theme as if white
            document.body.style.backgroundColor = '';
            bodyColorInput.value = '';
            if (codeGenBody) {
                codeGenBody.textContent = `<body style=""></body>`;
                delete codeGenBody.dataset.highlighted;
                hljs.highlightElement(codeGenBody);
            }
            const cardBackground = document.querySelector('.cards-flex-wrapper .card-background');
            if (cardBackground) {
                cardBackground.style.backgroundColor = '';
                cardBackground.classList.add('not-set');
            }

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
    } else {
        // No param in URL - use default #0044FF
        updateBodyColors(bodyColorPicker.color);
    }

    // Apply meta color: URL param supersedes default (which is unset)
    const metaParam = urlParams.get('meta');
    if (urlParams.has('meta')) {
        // URL param exists - it supersedes default
        if (metaParam && metaParam.trim() !== '' && metaParam.toLowerCase() !== 'false') {
            // Has a color value
            updateMetaColors(metaColorPicker.color);
        } else {
            // =false or empty - leave blank/unset
            metaThemeColor.content = '';
            metaColorInput.value = '';
            if (codeGenMeta) {
                codeGenMeta.textContent = `<head>\n  <meta name="theme-color" content="">\n</head>`;
                delete codeGenMeta.dataset.highlighted;
                hljs.highlightElement(codeGenMeta);
            }
            const cardTheme = document.querySelector('.cards-flex-wrapper .card-theme');
            if (cardTheme) {
                cardTheme.style.backgroundColor = '';
                cardTheme.classList.add('not-set');
            }
        }
    } else {
        // No param in URL - default is unset
        metaThemeColor.content = '';
        metaColorInput.value = '';
        if (codeGenMeta) {
            codeGenMeta.textContent = `<head>\n  <meta name="theme-color" content="">\n</head>`;
            delete codeGenMeta.dataset.highlighted;
            hljs.highlightElement(codeGenMeta);
        }
        const cardTheme = document.querySelector('.cards-flex-wrapper .card-theme');
        if (cardTheme) {
            cardTheme.classList.add('not-set');
        }
    }

    // Apply menu color: URL param supersedes default
    const menuParam = urlParams.get('menu');
    if (urlParams.has('menu')) {
        // URL param exists - it supersedes default
        if (menuParam && menuParam.trim() !== '' && menuParam.toLowerCase() !== 'false') {
            // Has a color value
            updateMenuColors(menuColorPicker.color);
        } else {
            // =false or empty - leave blank/unset
            if (menuTopElement) menuTopElement.style.backgroundColor = '';
            if (menuBottomElement) menuBottomElement.style.backgroundColor = '';
            menuColorInput.value = '';
            if (codeGenMenu) {
                codeGenMenu.textContent = `<div id="menu-top" style=""></div>`;
                delete codeGenMenu.dataset.highlighted;
                hljs.highlightElement(codeGenMenu);
            }
            const cardMenu = document.querySelector('.cards-flex-wrapper .card-menu');
            if (cardMenu) {
                cardMenu.style.backgroundColor = '';
                cardMenu.classList.add('not-set');
            }
        }
    } else {
        // No param in URL - use default #E39824
        updateMenuColors(menuColorPicker.color);
    }

    // Initialize highlight.js after initial colors are set
    hljs.highlightAll();

    // Apply highlight.js to menu code block if it has content
    if (codeGenMenu && codeGenMenu.textContent.trim() !== '') {
        delete codeGenMenu.dataset.highlighted;
        hljs.highlightElement(codeGenMenu);
    }

    // Share Button Logic
    const shareButton = document.getElementById("shareButton");
    if (shareButton) {
        shareButton.addEventListener("click", () => {
            // Get hex values safely - only if input has a value
            let bodyColorHex = '';
            let metaColorHex = '';
            let menuColorHex = '';

            if (bodyColorInput && bodyColorInput.value.trim() !== '' && bodyColorPicker && bodyColorPicker.color && bodyColorPicker.color.hexString) {
                bodyColorHex = bodyColorPicker.color.hexString.substring(1).toUpperCase();
            }

            if (metaColorInput && metaColorInput.value.trim() !== '' && metaColorPicker && metaColorPicker.color && metaColorPicker.color.hexString) {
                metaColorHex = metaColorPicker.color.hexString.substring(1).toUpperCase();
            }

            // Only include menu color if it has been set (input has value)
            if (menuColorInput && menuColorInput.value.trim() !== '' && menuColorPicker && menuColorPicker.color && menuColorPicker.color.hexString) {
                menuColorHex = menuColorPicker.color.hexString.substring(1).toUpperCase();
            }

            const shareUrl = new URL(window.location.origin + window.location.pathname);
            // Set parameters in order: body, menu, meta
            shareUrl.searchParams.set('body', bodyColorHex || 'false');
            shareUrl.searchParams.set('menu', menuColorHex || 'false');
            shareUrl.searchParams.set('meta', metaColorHex || 'false');

            console.log('Share button clicked');
            console.log('navigator.share available:', !!navigator.share);
            console.log('Share URL:', shareUrl.toString());

            // Check if Web Share API is available (requires secure context: https or localhost)
            if (navigator.share && window.isSecureContext) {
                const shareData = { url: shareUrl.toString() };

                navigator.share(shareData)
                    .then(() => {
                        console.log('Share successful');
                    })
                    .catch((error) => {
                        console.log('Share error:', error.name, error.message);
                        // If share fails and it's not because user cancelled, use fallback
                        if (error.name !== 'AbortError') {
                            copyToClipboardFallback(shareUrl.toString());
                        }
                    });
            } else {
                // No Web Share API or not secure context, use clipboard fallback
                console.log('Web Share API not available, using clipboard fallback');
                copyToClipboardFallback(shareUrl.toString());
            }
        });
    }

    // Copy Button Logic
    const copyButton = document.getElementById("copyButton");
    if (copyButton) {
        copyButton.addEventListener("click", async () => {
            console.log('bodyColorPicker.color object:', bodyColorPicker.color);
            console.log('metaColorPicker.color object:', metaColorPicker.color);
            console.log('menuColorPicker.color object:', menuColorPicker.color);

            // Only include colors if input has a value
            const bodyColorHex = (bodyColorInput && bodyColorInput.value.trim() !== '' && bodyColorPicker.color.hexString) ? bodyColorPicker.color.hexString.substring(1).toUpperCase() : '';
            const metaColorHex = (metaColorInput && metaColorInput.value.trim() !== '' && metaColorPicker.color.hexString) ? metaColorPicker.color.hexString.substring(1).toUpperCase() : '';
            const menuColorHex = (menuColorInput && menuColorInput.value.trim() !== '' && menuColorPicker.color.hexString) ? menuColorPicker.color.hexString.substring(1).toUpperCase() : '';

            console.log('Copy Button Clicked:');
            console.log('bodyColorHex:', bodyColorHex);
            console.log('metaColorHex:', metaColorHex);
            console.log('menuColorHex:', menuColorHex);

            const copyUrl = new URL(window.location.origin + window.location.pathname);
            // Set parameters in order: body, menu, meta
            copyUrl.searchParams.set('body', bodyColorHex || 'false');
            copyUrl.searchParams.set('menu', menuColorHex || 'false');
            copyUrl.searchParams.set('meta', metaColorHex || 'false');
            console.log('Copy URL:', copyUrl.toString());

            // Try modern Clipboard API first, fallback to legacy method
            if (navigator.clipboard && navigator.clipboard.writeText) {
                try {
                    await navigator.clipboard.writeText(copyUrl.toString());
                    console.log('URL copied to clipboard:', copyUrl.toString());
                } catch (error) {
                    console.error('Clipboard API failed:', error);
                    // Fallback to legacy method
                    copyToClipboardFallback(copyUrl.toString());
                }
            } else {
                // Fallback for non-secure contexts (http://)
                copyToClipboardFallback(copyUrl.toString());
            }
        });
    }

    // Fallback function for copying to clipboard in non-secure contexts
    function copyToClipboardFallback(text) {
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
