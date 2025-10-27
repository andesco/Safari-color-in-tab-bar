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
    let bodyColorInput = document.getElementById("color-input-body"); // Assign value immediately
    let metaColorInput = document.getElementById("color-input-meta"); // Assign value immediately

    function initializeColorPickers() {
        bodyColorPicker = new window.iro.ColorPicker("#color-picker-body", {
            width: 280,
            color: "#0044ff"
        });
        bodyColorInput.value = bodyColorPicker.color.hexString; // Initialize input value

        bodyColorPicker.on("color:change", updateBodyColors);
        bodyColorInput.addEventListener('change', function() {
            bodyColorPicker.color.set(this.value);
        });

        metaColorPicker = new window.iro.ColorPicker("#color-picker-meta", {
            width: 280,
            color: "#FFBB00"
        });
        metaColorInput.value = metaColorPicker.color.hexString; // Initialize input value

        metaColorPicker.on("color:change", updateMetaColors);
        metaColorInput.addEventListener('change', function() {
            metaColorPicker.color.set(this.value);
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

        const newUrl = new URL(window.location.origin + window.location.pathname);
        if (bodyColorHex) {
            newUrl.searchParams.set('body', bodyColorHex);
        }
        if (metaColorHex) {
            newUrl.searchParams.set('meta', metaColorHex);
        }
        history.replaceState(null, '', newUrl.toString());
    }

            function updateBodyColors(color) {
                const rgb = `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`;
                const hex = color.hexString.toUpperCase();
        
                document.body.style.backgroundColor = hex;
                bodyColorInput.value = hex; // Update input field
                if (codeGenBody) {
                    codeGenBody.textContent = `<body style="background-color: ${hex};"></body>`;
                    delete codeGenBody.dataset.highlighted;
                    hljs.highlightElement(codeGenBody);
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
    const codeGenLine1 = document.getElementById("code-gen-line1");

    const allCardContainers = document.querySelectorAll(".card-container");

                    function updateMetaColors(color) {

                        const hex = color.hexString.toUpperCase();

                        const rgb = `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`;

                

                        metaThemeColor.content = hex;

                        metaColorInput.value = hex; // Update input field

                                                if (codeGenLine1) {

                                                    codeGenLine1.textContent = `<meta name="theme-color" content="${hex}">`;

                                                    delete codeGenLine1.dataset.highlighted;

                                                    hljs.highlightElement(codeGenLine1);

                                                }

                                        

                                                                const allCardBackgrounds = document.querySelectorAll(".card-background, .card-theme");

                                        

                                                        

                                        

                                                                const useDarkThemeWithLightText = selectThemeWithLuma(hex);



                                                                const textColor = useDarkThemeWithLightText ? '#FFFFFF' : '#000000';

                                        

                                                        

                                        

                                                                allCardBackgrounds.forEach(container => {

                                        

                                                                    container.style.backgroundColor = hex;

                                        

                                                                    const h2 = container.querySelector('h2');

                                        

                                                                    if (h2) {

                                        

                                                                        // h2.style.color = textColor; // Removed

                                        

                                                                    }

                                        

                                                                    const h4 = container.querySelector('h4'); // Select h4

                                        

                                                                    if (h4) {

                                        

                                                                        h4.style.color = textColor; // Apply textColor to h4

                                        

                                                                    }

                                        

                                                                });

                                // updateURLParams();

                    }

    function setInitialColorsFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        let bodyColorParam = urlParams.get('body');
        let metaColorParam = urlParams.get('meta');

        const formatColor = (colorStr) => {
            if (!colorStr) return null;
            if (colorStr.match(/^[0-9a-fA-F]{3,6}$/)) {
                return `#${colorStr.toUpperCase()}`;
            } else if (colorStr.match(/^\d{1,3},\s*\d{1,3},\s*\d{1,3}$/)) {
                return `rgb(${colorStr})`;
            }
            return colorStr.toUpperCase();
        };

        let initialBodyColor = formatColor(bodyColorParam);
        let initialMetaColor = formatColor(metaColorParam);

        // Complementary color logic
        if (initialBodyColor && !initialMetaColor) {
            initialMetaColor = getComplementaryColor(initialBodyColor);
        } else if (initialMetaColor && !initialBodyColor) {
            initialBodyColor = getComplementaryColor(initialMetaColor);
        }

        if (initialBodyColor) {
            try {
                bodyColorPicker.color.set(initialBodyColor);
            } catch (e) {
                console.error("Failed to set body color from URL:", e);
            }
        }

        if (initialMetaColor) {
            try {
                metaColorPicker.color.set(initialMetaColor);
            } catch (e) {
                console.error("Failed to set meta color from URL:", e);
            }
        } else if (!metaColorParam) { // Only set default if no meta param in URL
            try {
                metaColorPicker.color.set("#FFBB00");
            } catch (e) {
                console.error("Failed to set default meta color:", e);
            }
        }
    }

    setInitialColorsFromURL();
    // Ensure inputs are updated after URL params are processed and color pickers are initialized
    updateBodyColors(bodyColorPicker.color);
    updateMetaColors(metaColorPicker.color);

    // Initialize highlight.js after initial colors are set
    hljs.highlightAll();

    // Share Button Logic
    const shareButton = document.getElementById("shareButton");
    if (shareButton) {
        shareButton.addEventListener("click", () => {
            // Get hex values safely
            let bodyColorHex = '';
            let metaColorHex = '';

            if (bodyColorPicker && bodyColorPicker.color && bodyColorPicker.color.hexString) {
                bodyColorHex = bodyColorPicker.color.hexString.substring(1).toUpperCase();
            }

            if (metaColorPicker && metaColorPicker.color && metaColorPicker.color.hexString) {
                metaColorHex = metaColorPicker.color.hexString.substring(1).toUpperCase();
            }

            const shareUrl = new URL(window.location.origin + window.location.pathname);
            if (bodyColorHex) {
                shareUrl.searchParams.set('body', bodyColorHex);
            }
            if (metaColorHex) {
                shareUrl.searchParams.set('meta', metaColorHex);
            }

            console.log('Share button clicked');
            console.log('navigator.share available:', !!navigator.share);
            console.log('Share URL:', shareUrl.toString());

            // Check if Web Share API is available
            if (navigator.share) {
                const shareData = { url: shareUrl.toString() };

                navigator.share(shareData)
                    .then(() => {
                        console.log('Share successful');
                    })
                    .catch((error) => {
                        console.log('Share error:', error.name, error.message);
                        // If share fails and it's not because user cancelled, redirect
                        if (error.name !== 'AbortError') {
                            window.location.href = shareUrl.toString();
                        }
                    });
            } else {
                // No Web Share API, redirect to URL
                console.log('Web Share API not available, redirecting');
                window.location.href = shareUrl.toString();
            }
        });
    }

    // Copy Button Logic
    const copyButton = document.getElementById("copyButton");
    if (copyButton) {
        copyButton.addEventListener("click", async () => {
            console.log('bodyColorPicker.color object:', bodyColorPicker.color);
            console.log('metaColorPicker.color object:', metaColorPicker.color);
            const bodyColorHex = bodyColorPicker.color.hexString ? bodyColorPicker.color.hexString.substring(1).toUpperCase() : ''; // Remove #
            const metaColorHex = metaColorPicker.color.hexString ? metaColorPicker.color.hexString.substring(1).toUpperCase() : ''; // Remove #
            console.log('Copy Button Clicked:');
            console.log('bodyColorHex:', bodyColorHex);
            console.log('metaColorHex:', metaColorHex);

            const copyUrl = new URL(window.location.origin + window.location.pathname);
            copyUrl.searchParams.set('body', bodyColorHex);
            copyUrl.searchParams.set('meta', metaColorHex);
            console.log('Copy URL:', copyUrl.toString());

            try {
                await navigator.clipboard.writeText(copyUrl.toString());

                console.log('URL copied to clipboard:', copyUrl.toString());
            } catch (error) {
                console.error('Error copying URL to clipboard:', error);
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
