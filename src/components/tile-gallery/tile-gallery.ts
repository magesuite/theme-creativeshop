import * as $ from 'jquery';

interface ITileGallery {
    /**
     * Defines class of the wrapper for both: gallery and main image.
     * It has to be common wrapper for both of them because of parent() method usage
     * @default {cs-product-tile}
     * @type {String}
     */
    galleryAndMainImageWrapperClass?: string;

    /**
     * Defines class of main image. This image will be manipulated inside component
     * @default {cs-product-tile__image}
     * @type {String}
     */
    mainImageClass?: string;

    /**
     * Defines class of a gallery object (thumbnails)
     * @default {cs-tile-gallery}
     * @type {String}
     */
    galleryClass?: string;

    /**
     * Defines class of a initialized gallery object (thumbnails)
     * @default {active}
     * @type {String}
     */
    activeGalleryClass?: string;

    /**
     * Defines class of a single gallery item object (thumbnail)
     * @default {cs-tile-gallery__item}
     * @type {String}
     */
    galleryItemClass?: string;

    /**
     * Defines modifier for active gallery item object (thumbnail)
     * @default {cs-tile-gallery__item--active}
     * @type {String}
     */
    activeGalleryItemClass?: string;

    /**
     * Defines event type for switching active gallery item object (thumbnail)
     * Supported options: click / mouseenter
     * @default {mouseenter}
     * @type {String}
     */
    itemSwitchEvent?: string;

    /**
     * Defines initial active gallery item object...
     * ...(thumbnail with class `{cs-tile-gallery__item--active}`) by index (0, 1, etc.)
     * @default 0
     * @type {Number}
     */
    initialActiveItem?: number;

    /**
     * Defines if gallery should reset main image to first one when leaving tile
     * @default {false}
     * @type {Boolean}
     */
    resetMainImageOnTileLeave?: boolean;

    /**
     * Defines delay of removing all old main-images (in ms)
     * @default 550
     * @type {Number}
     */
    imagesCleanupDelay?: number;
}

/**
 * TileGallery alters tile main image with selected gallery image (thumbanil).
 * Gallery by default resides in badges container.
 * HTML structure, tags, classes, etc. can be altered by updating XML file (product_tile.xml)
 * but keep in mind that those changes has to be reflected in script as well.
 */
export default class TileGallery {
    private _$gallery: JQuery;
    private _$galleryItems: JQuery;

    private _options?: ITileGallery;

    /**
     * Creates and initiates new TileGallery component with given settings.
     * @param  {$gallery} JQuery: whole gallery object
     * @param  {ITileGallery} options: optional component settings.
     */
    public constructor($gallery: JQuery, options?: ITileGallery) {
        this._$gallery = $gallery;

        if (!this._$gallery.length) {
            return;
        }

        this._options = $.extend(
            true,
            {},
            {
                galleryAndMainImageWrapperClass: 'cs-product-tile',
                mainImageClass: 'cs-product-tile__image',
                galleryClass: 'cs-tile-gallery',
                activeGalleryClass: 'active',
                galleryItemClass: 'cs-tile-gallery__item',
                activeGalleryItemClass: 'cs-tile-gallery__item--active',
                itemSwitchEvent: 'mouseenter',
                initialActiveItem: 0,
                resetMainImageOnTileLeave: false,
                imagesCleanupDelay: 550,
            },
            options
        );

        this._$galleryItems = this._$gallery.find(
            `.${this._options.galleryItemClass}`
        );

        this._setActiveThumbnail(this._options.initialActiveItem);
        this._setGalleryActiveClass();
        this._loadThumbnails();
        this._setGalleryEvents();
    }

    /**
     * Adds active class to initialized gallery object on gallery init
     */
    protected _setGalleryActiveClass(): void {
        this._$gallery.addClass(`${this._options.activeGalleryClass}`);
    }

    /**
     * Loads all thumbnails as their paths are placed in data-attribute
     * So that we're not loading them if it's not necessary
     */
    protected _loadThumbnails(): void {
        this._$galleryItems.find('img, source').each(function(): void {
            const $this = $(this);
            $this.attr('srcset', $this.data('srcset'));
            if ($this[0].tagName === 'IMG') {
                $this.attr('src', $this.data('src'));
            }
        });
    }

    /**
     * Loads main image of given thumbnail along with srcset
     * It doesn't modify DOM in any way, just returns promise when image is loaded
     * @param  {string} imgSrc: path to main image to be loaded
     * @param  {string} imgSrcSet: srcset of main image to be loaded.
     * @return {promise} Promise that image has been loaded and is ready to be displayed.
     */
    protected _loadChosenImage(
        imgSrc: string,
        imgSrcset: string
    ): Promise<HTMLElement> {
        return new Promise(
            (resolve: any, reject: any): any => {
                const img = new Image();
                img.onload = (): any => resolve(img);
                img.onerror = (): any => reject(img);
                img.src = imgSrc;
                img.className = `${this._options.mainImageClass} ${
                    this._options.mainImageClass
                }--animatable`;
                img.setAttribute('srcset', imgSrcset);
            }
        );
    }

    /**
     * Switches gallery image with and marks active thumbnail with CSS class.
     * This method provides additional classes that can be used to animate switch.
     */
    protected _switchImage(imgSrc: string, imgSrcset: string): any {
        if (!imgSrc) {
            return;
        }

        const $currentImage: JQuery = this._$gallery
            .closest(`.${this._options.galleryAndMainImageWrapperClass}`)
            .find(`.${this._options.mainImageClass}`)
            .last();

        if (
            $currentImage.attr('data-src') === imgSrc ||
            $currentImage.attr('src') === imgSrc
        ) {
            return;
        }

        this._loadChosenImage(imgSrc, imgSrcset).then(
            (newImage: HTMLElement): void => {
                $currentImage.parent().append(newImage);
                requestAnimationFrame(() => {
                    $(newImage).addClass(
                        `${this._options.mainImageClass}--animate`
                    );

                    setTimeout((): void => {
                        $currentImage.remove();
                    }, this._options.imagesCleanupDelay);
                });
            }
        );
    }

    protected _setActiveThumbnail(index: number): void {
        const $thumbs: JQuery = this._$gallery.find(
            `.${this._options.galleryItemClass}`
        );

        $thumbs
            .removeClass(this._options.activeGalleryItemClass)
            .eq(index)
            .addClass(this._options.activeGalleryItemClass);
    }

    /**
     * Setup all gallery events for interaction with gallery items (thumbnails)
     */
    protected _setGalleryEvents(): void {
        this._$galleryItems.on(
            this._options.itemSwitchEvent,
            (event: JQuery.MouseEnterEvent | JQuery.ClickEvent): void => {
                event.preventDefault();

                const $item = $(event.target).closest(this._$galleryItems);
                const $itemImg = $item.find('img');
                const imageSrc: string =
                    $itemImg.data('data-src') || $itemImg.data('src');
                const imageSrcset: string =
                    $itemImg.attr('data-srcset') || $itemImg.attr('srcset');

                this._setActiveThumbnail(this._$galleryItems.index($item));
                this._switchImage(imageSrc, imageSrcset);
            }
        );
    }
}
