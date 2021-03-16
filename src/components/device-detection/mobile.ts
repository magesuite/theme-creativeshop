import * as isMobile from 'isMobile';

// Sometimes there is a need to apply different styling for mobile/tablet devices and body class is necessary
if (isMobile.any) {
    document.body.classList.add('is-mobile');
}

if (isMobile.tablet) {
    document.body.classList.add('is-tablet');
} else if (isMobile.phone) {
    document.body.classList.add('is-phone');
}
