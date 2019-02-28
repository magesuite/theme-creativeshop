window.addEventListener(
    'touchstart',
    function onFirstTouch(): void {
        document.body.classList.add('touch-device');
        window.removeEventListener('touchstart', onFirstTouch, false);
    },
    false
);
