import 'MageSuite_ProductSlideGallery/web/css/product-slide-gallery.scss';

import SlideGallery, {
    IGalleryImageParams,
} from 'MageSuite_ProductSlideGallery/web/js/product-slide-gallery';

const galleryElement: HTMLDivElement =
    document.querySelector('.cs-slide-gallery');

if (galleryElement) {
    const imageParams: IGalleryImageParams = JSON.parse(
        galleryElement.dataset.imageParams
    );
    new SlideGallery(galleryElement, {
        imageParams,
    });
}
