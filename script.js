function colorIsDarkAdvanced(bgColor) {
  let color = (bgColor.charAt(0) === '#') ? bgColor.substring(1, 7) : bgColor;
  let r = parseInt(color.substring(0, 2), 16); // hexToR
  let g = parseInt(color.substring(2, 4), 16); // hexToG
  let b = parseInt(color.substring(4, 6), 16); // hexToB;
  let uicolors = [r / 255, g / 255, b / 255];
  let c = uicolors.map((col) => {
    if (col <= 0.03928) {
      return col / 12.92;
    }
    return Math.pow((col + 0.055) / 1.055, 2.4);
  });
  let L = (0.2126 * c[0]) + (0.7152 * c[1]) + (0.0722 * c[2]);
  return L <= 0.179;
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
        
                const isDark = colorIsDarkAdvanced(hex);
        
            // Apply theme classes to body
            document.body.classList.toggle('dark-theme', isDark);
            document.body.classList.toggle('light-theme', !isDark);
        
            // Re-invert Highlight.js theme logic
            if (highlightJsLightTheme && highlightJsDarkTheme) {
                if (isDark) {
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

                                        

                                                        

                                        

                                                                const isDark = colorIsDarkAdvanced(hex);

                                        

                                                                const textColor = isDark ? '#FFFFFF' : '#000000';

                                        

                                                        

                                        

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
        shareButton.addEventListener("click", async () => {
            const bodyColorHex = (bodyColorPicker && bodyColorPicker.color) ? bodyColorPicker.color.hex.substring(1).toUpperCase() : '';
            const metaColorHex = (metaColorPicker && metaColorPicker.color) ? metaColorPicker.color.hex.substring(1).toUpperCase() : '';
            console.log('Share Button Clicked:');
            console.log('bodyColorHex:', bodyColorHex);
            console.log('metaColorHex:', metaColorHex);

            const shareUrl = new URL(window.location.origin + window.location.pathname);
            shareUrl.searchParams.set('body', bodyColorHex);
            shareUrl.searchParams.set('meta', metaColorHex);
            console.log('Share URL:', shareUrl.toString());

            if (navigator.share) {
                try {
                    await navigator.share({
                        title: document.title,
                        url: shareUrl.toString(),
                    });
                    console.log('URL shared successfully!');
                } catch (error) {
                    console.error('Error sharing URL:', error);
                }
            } else {
                // Fallback for browsers that do not support the Web Share API
                // This could be copying to clipboard or showing a custom share dialog
                // For now, we'll just log a message.
                console.log('Web Share API not supported. Fallback needed.');
                // Optionally, copy to clipboard as a fallback
                try {
                    await navigator.clipboard.writeText(shareUrl.toString());
                    // Provide visual feedback that the URL has been copied
                    const originalText = shareButton.textContent;
                    shareButton.textContent = 'Copied!';
                    setTimeout(() => {
                        shareButton.textContent = originalText;
                    }, 2000);
                    console.log('URL copied to clipboard as fallback:', shareUrl.toString());
                } catch (error) {
                    console.error('Error copying URL to clipboard as fallback:', error);
                }
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
