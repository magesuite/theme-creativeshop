/**
 * inlineSVG
 * Our changes:
 * - Adjusted to work out of the box after load.
 * - Removed AMD declaration to make it work with requireJS as async script.
 * - Added checking "data-src" attribute before "src" to enable lazy loading.
 * - Added waiting for DOM ready and observing HTML changes.
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
        svg.className += ' ' + 'inlined-svg';

        // Add in some accessibility quick wins
        svg.setAttribute('role', 'img');

        // Use the `alt` attribute if one exists
        if (attributes.alt) {
            svg.setAttribute('aria-label', attributes.alt.value);
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
                return;
            }

            var xml = parser.parseFromString(request.responseText, 'text/xml');
            var svg = xml.getElementsByTagName('svg')[0];

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

        request.send();
    };

    /**
     * Inline all the SVGs in the array
     * @public
     */
    var inline = function(svg) {
        // Store some attributes of the image
        var url = svg.getAttribute('data-src') || svg.src;

        if (url.substr(-4) !== '.svg') {
            return;
        }

        svg.className = svg.className.replace('inline-svg', '');

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

    var observer = null;
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
            observer.observe(svg);
        });
    } else {
        svgs.forEach(function(svg) {
            inline(svg);
        });
    }

    if ('MutationObserver' in root) {
        new MutationObserver(function(mutationsList) {
            for (var i = 0; i < mutationsList.length; i++) {
                var mutation = mutationsList[i];
                if (mutation.type === 'childList') {
                    getAll(mutation.target).forEach(function(svg) {
                        observer ? observer.observe(svg) : inline(svg);
                    });
                }
            }
        }).observe(doc, {
            subtree: true,
            childList: true,
        });
    }
})(window, document);
