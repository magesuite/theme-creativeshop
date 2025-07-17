/**
 * inlineSVG
 * Our changes:
 * - Adjusted to work out of the box after load.
 * - Removed AMD declaration to make it work with requireJS as async script.
 * - Added checking "data-src" attribute before "src" to enable lazy loading.
 * - Added waiting for DOM ready and observing HTML changes.
 * - Performance optimizations: tracking observed elements, early exit for invalid URLs
 */
(function(root, doc) {
    var settings = {
        svgSelector: '.inline-svg',
    };

    /**
     * Grab all the SVGs that match the selector
     * @public
     */
    var getAll = function(root) {
        return Array.prototype.slice.call(
            root.querySelectorAll(settings.svgSelector)
        );
    };

    var cache = {};
    var queued = {};
    var processed = new WeakSet(); // Track processed elements

    var parseAndReplace = function(svg, img) {
        var attributes = img.attributes;

        // Add in the attributes from the original <img> except `src` or
        // `alt`, we don't need either
        for (var i = attributes.length - 1; i >= 0; i--) {
            var attributeName = attributes[i].name;

            if (attributeName !== 'src' && attributeName !== 'alt') {
                svg.setAttribute(attributeName, attributes[i].value);
            }
        }

        // Add an additional class to the inlined SVG to imply it was
        // in fact inlined, might be useful to know
        svg.classList.add('inlined-svg');

        // Use the `alt` attribute if one exists
        if (attributes.alt?.value?.length) {
            svg.setAttribute('role', 'img');
            svg.setAttribute('aria-label', attributes.alt.value);
        } else {
            svg.setAttribute('aria-hidden', 'true');
        }

        // Replace the image with the SVG
        if (img.parentNode) {
            img.parentNode.replaceChild(svg, img);
        }
    };

    var resolveQueue = function(svg, src) {
        queued[src] = queued[src] || [];

        var img;
        while ((img = queued[src].shift())) {
            parseAndReplace(svg.cloneNode(true), img);
        }
    };

    var parser = new DOMParser();
    var fetch = function(url) {
        if (cache[url]) {
            return;
        }

        var request = new XMLHttpRequest();

        request.open('GET', url, true);

        request.onload = function() {
            if (request.status < 200 || request.status >= 400) {
                // Clean up queue on error
                delete queued[url];
                return;
            }

            var xml = parser.parseFromString(request.responseText, 'text/xml');
            var svg = xml.getElementsByTagName('svg')[0];

            if (!svg) {
                // Clean up queue if no SVG found
                delete queued[url];
                return;
            }

            // Remove some of the attributes that aren't needed
            svg.removeAttribute('xmlns:a');
            svg.removeAttribute('width');
            svg.removeAttribute('height');
            svg.removeAttribute('x');
            svg.removeAttribute('y');
            svg.removeAttribute('enable-background');
            svg.removeAttribute('xmlns:xlink');
            svg.removeAttribute('xml:space');
            svg.removeAttribute('version');

            cache[url] = svg;
            resolveQueue(svg, url);
        };

        request.onerror = function() {
            // Clean up queue on network error
            delete queued[url];
        };

        request.send();
    };

    /**
     * Inline all the SVGs in the array
     * @public
     */
    var inline = function(svg) {
        // Skip if already processed
        if (processed.has(svg)) {
            return;
        }

        // Mark as processed immediately to prevent duplicate processing
        processed.add(svg);

        // Store some attributes of the image
        var url = svg.getAttribute('data-src') || svg.src;

        // Skip elements without valid SVG URLs (fixes infinite loop with data-bind elements)
        if (!url || url.substr(-4) !== '.svg') {
            return;
        }

        svg.classList.remove('inline-svg');

        if (cache[url]) {
            parseAndReplace(cache[url].cloneNode(true), svg);
            return;
        }

        if (queued[url]) {
            queued[url].push(svg);
            return;
        }

        queued[url] = [svg];
        // Get the contents of the SVG
        fetch(url);
    };

    var init = function() {
        var observer = null;
        var mutationObserver = null;
        var svgs = getAll(doc);

        if ('IntersectionObserver' in root) {
            observer = new IntersectionObserver(
                function(entries) {
                    entries.forEach(function(entry) {
                        if (entry.intersectionRatio > 0) {
                            observer.unobserve(entry.target);
                            inline(entry.target);
                        }
                    });
                },
                {
                    rootMargin: '50%',
                }
            );
            svgs.forEach(function(svg) {
                if (!processed.has(svg)) {
                    observer.observe(svg);
                }
            });
        } else {
            svgs.forEach(function(svg) {
                inline(svg);
            });
        }

        if ('MutationObserver' in root) {
            var checkTimeout;
            mutationObserver = new MutationObserver(function(mutations) {
                clearTimeout(checkTimeout);
                checkTimeout = setTimeout(function() {
                    // Only query for new unprocessed SVG elements
                    var newSvgs = getAll(doc).filter(svg => !processed.has(svg));
                    
                    // Only proceed if there are actually new elements to observe
                    if (newSvgs.length === 0) {
                        return;
                    }
                    
                    newSvgs.forEach(svg => observer ? observer.observe(svg) : inline(svg));
                }, 20);
            });
            
            mutationObserver.observe(doc, {
                subtree: true,
                childList: true,
            });
        }
    };

    if (document.readyState != 'loading') {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }
})(window, document);
