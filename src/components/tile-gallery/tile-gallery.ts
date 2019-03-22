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
    private _options?: ITileGallery;
    private _oldImagesRemovalTimeout: any;

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

        this._oldImagesRemovalTimeout = undefined;
        this._setGalleryActiveClass();
        this._loadThumbnails();
        this._setItemActiveClass(this._options.initialActiveItem);
        if (this._options.initialActiveItem > 0) {
            this._switchImageOnInit();
        }
        this._setGalleryEvents();
        this._setTilesGalleryEvents();
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
        this._$gallery
            .find(`.${this._options.galleryItemClass} img`)
            .each(function(): void {
                $(this).attr('src', $(this).data('src'));
                $(this).attr('srcset', $(this).data('srcset'));
            });
    }

    /**
     * Adds active class to selected gallery item object (thumbnail) on gallery init
     */
    protected _setItemActiveClass(initialActiveItem: number = 0): void {
        const $galleryItem: JQuery = this._$gallery.find(
            `.${this._options.galleryItemClass}`);

        if (!($galleryItem.hasClass(`${this._options.activeGalleryItemClass}`))) {
            $galleryItem
                .eq(initialActiveItem)
                .addClass(` ${this._options.activeGalleryItemClass}`);
        }
    }

    /**
     * Switches to the active gallery item (`{cs-tile-gallery__item--active}`) thumbnail
     * on component's initialization
     */
    protected _switchImageOnInit(): void {
        const $activeThumb: JQuery = this._$gallery.find(
            `.${this._options.activeGalleryItemClass} img`
        );

        if ($activeThumb.length) {
            const imageSrc: string = $activeThumb.data('src');
            const imageSrcset: string = $activeThumb.attr('data-srcset')
                ? $activeThumb.data('srcset')
                : '';
            this._switchImage($activeThumb, imageSrc, imageSrcset, false);
        }
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
    ): Promise<any> {
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
     * This method provides additional classes that can be used to animate switch
     * @param  {JQuery}  $galleryItem: whole thumbnail as jQuery object
     * @param  {string}  imgSrc: path to main image to be loaded
     * @param  {string}  imgSrcSet: srcset of main image to be loaded.
     * @param  {boolean} setThumbnailActiveClass tells if script should add class to the active thumbnail
     * @param  {boolean} resetThumbnailsSetup tells if script should reset thumbnails setup to the initial one
     * @return {any}: may return nothing to stop this method if given $galleryItem is not in DOM
     */
    protected _switchImage(
        $galleryItem: JQuery,
        imgSrc: string,
        imgSrcset: string,
        setThumbnailActiveClass: boolean = true,
        resetThumbnailsSetup: boolean = false
    ): any {
        if (!$galleryItem.length || !imgSrc.length) {
            return;
        }

        clearTimeout(this._oldImagesRemovalTimeout);

        const $mainImages: JQuery = $galleryItem
            .parents(`.${this._options.galleryAndMainImageWrapperClass}`)
            .first()
            .find(`.${this._options.mainImageClass}`);

        if ($mainImages.length && imgSrc.length) {
            this._loadChosenImage(imgSrc, imgSrcset).then(
                (newImage: any): void => {
                    $mainImages.parent().append(newImage);
                    window.requestAnimationFrame(
                        (): void => {
                            $(newImage).addClass(
                                `${this._options.mainImageClass}--animate`
                            );

                            this._oldImagesRemovalTimeout = setTimeout(
                                (): void => {
                                    $mainImages.not(':last-child').remove();
                                },
                                this._options.imagesCleanupDelay
                            );
                        }
                    );
                }
            );
        }

        if (setThumbnailActiveClass) {
            $galleryItem
                .siblings()
                .removeClass(`${this._options.activeGalleryItemClass}`);

            if (resetThumbnailsSetup) {
                this._$gallery
                    .find(`.${this._options.galleryItemClass}`)
                    .removeClass(`${this._options.activeGalleryItemClass}`);
            }

            const $thumb: JQuery = resetThumbnailsSetup
                ? this._$gallery.find(
                      `.${this._options.galleryItemClass}:eq(${this._options.initialActiveItem})`
                  )
                : $galleryItem;

            if ($thumb.length) {
                $thumb.addClass(`${this._options.activeGalleryItemClass}`);
            }
        }
    }

    /**
     * Setup all gallery events for...
     * ...interaction with gallery items (thumbnails)
     */
    protected _setGalleryEvents(): void {
        const _component: any = this;

        $(`.${this._options.galleryItemClass}`)
            .stop()
            .on(this._options.itemSwitchEvent, function(e: JQuery.Event): void {
                    e.preventDefault();

                    const $item: JQuery = $(this);
                    const imageSrc: string = $item.find('img').data('src');
                    const imageSrcset: string = $item
                        .find('img')
                        .attr('data-srcset')
                        ? $item.find('img').data('srcset')
                        : '';
                    const mainImageSrc: string = $item
                        .parents(
                            `.${
                                _component._options
                                    .galleryAndMainImageWrapperClass
                            }`
                        )
                        .first()
                        .find(`.${_component._options.mainImageClass}`)
                        .attr('src');

                    if (imageSrc !== mainImageSrc) {
                        _component._switchImage($item, imageSrc, imageSrcset);
                    }
            });
    }

    /**
     * Setups additional hover event so that tiles...
     * ... know when to initially switch image to the second from gallery and then switch back ...
     * ... to the first one after interaction with product ends
     */
    protected _setTilesGalleryEvents(): void {
        const _component: any = this;
        
        this._$gallery
            .parents(`.${this._options.galleryAndMainImageWrapperClass}`)
            .first()
            .on({
                mouseenter: function(): void {
                    _component._switchImageOnInit();
                },
                mouseleave: function(): void {
                    if (_component._options.resetMainImageOnTileLeave) {
                        const $firstItemInGallery: JQuery = _component._$gallery
                            .find(`.${_component._options.galleryItemClass}`)
                            .first();
                        const imageSrc: string = $firstItemInGallery
                            .find('img')
                            .data('src');
                        const imageSrcset: string = $firstItemInGallery
                            .find('img')
                            .attr('data-srcset')
                            ? $firstItemInGallery.find('img').data('srcset')
                            : '';

                        _component._switchImage(
                            $firstItemInGallery,
                            imageSrc,
                            imageSrcset,
                            true,
                            true
                        );
                    }
                },
            });
    }
}
