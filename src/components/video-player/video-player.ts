import * as $ from 'jquery';

/**
 * component's video handlers interface.
 * WARNING: Modal is not supported by this component. Most likely you have it alredy.
 *          This interface defines methods needed by ImageTeaser component to make videos work.
 */
interface IVideoModalHandlers {
    /**
     * Handler of modal render.
     * Used to prepare modal if it's done via JS
     */
    renderModal?: (ImageTeaserLegacy: IVideoPlayer) => any;

    /**
     * Handler of modal behavior: opening.
     */
    openModal?: (ImageTeaserLegacy: IVideoPlayer) => any;

    /**
     * Handler of modal behavior: closing.
     */
    closeModal?: (ImageTeaserLegacy: IVideoPlayer) => any;
}

/**
 * component options interface.
 */
interface IVideoPlayer {
    /**
     * Scope of component.
     * It tells where to look for links pointing to the youtube videos
     * Use to pass selector(s)
     * @type {string}
     * @default '.cs-image-teaser-legacy, .cs-grid-layout__brick--teaser, .cs-grid-layout_in-column__brick--teaser, .cs-image-teaser, .cs-hero, cs-products-grid--with-hero'
     */
    scope?: string;

    /**
     * Tells if modal will be used
     * @type {boolean}
     * @default false
     */
    useModal?: boolean;

    /**
     * tells if video should be played automaticaly right after opening
     * @type {boolean}
     * @default true
     */
    videoAutoplay?: boolean;

    /**
     * Html ID of Video Player
     * @type {string}
     * @default 'yt-player'
     */
    videoPlayerId?: string;

    /**
     * Width of the video player (in px, as string)
     * @type {string}
     * @default '1200'
     */
    videoPlayerWidth?: string;

    /**
     * Height of the video player (in px, as string)
     * @type {string}
     * @default '675'
     */
    videoPlayerHeight?: string;

    /**
     * Tells if video should be opened in fullscreen mode for mobile devices AND all other touch devices
     * @type {boolean}
     * @default true
     */
    openVideoInFullscreenMobile?: string;

    /**
     * Set of methods to handle modal behavior.
     * @type {Object}
     */
    modalHandlers?: IVideoModalHandlers;
}

export default class VideoPlayer {
    public _options: IVideoPlayer;
    public _ytModal: any;
    public _ytPlayer: any;
    protected _$videosTriggers: JQuery;

    /**
     * Creates new VideoPlayer component with optional settings.
     * @param {IVideoPlayer} options Optional settings object.
     */
    public constructor(options?: IVideoPlayer) {
        const defaultOptions: any = {
            scope:
                '.cs-image-teaser-legacy, .cs-grid-layout__brick--teaser, .cs-grid-layout_in-column__brick--teaser, .cs-image-teaser, .cs-hero, cs-products-grid--with-hero',
            useModal: true,
            videoAutoplay: true,
            videoPlayerId: 'yt-player',
            videoPlayerWidth: '1200',
            videoPlayerHeight: '675',
            openVideoInFullscreenMobile: true,
            modalHandlers: {
                renderModal: (VideoPlayer: VideoPlayer) => false,
                openModal: (VideoPlayer: VideoPlayer) => false,
                closeModal: (VideoPlayer: VideoPlayer) => false,
            },
        };

        this._options = $.extend(defaultOptions, options);
        this._$videosTriggers = $(this._options.scope).find(
            'a[href*="youtube.com"]'
        );

        if (this._$videosTriggers.length) {
            if (!this._isYTapiLoaded()) {
                this._loadYTapi();
            }
            this.renderVideoPlayer();

            if (this._options.useModal) {
                this.renderModal();
            }
        }
    }

    /**
     * Setups modal component and initialize it
     * (shall be delivered from the outside component)
     */
    public renderModal(): any {
        if (
            this._options.modalHandlers.renderModal &&
            typeof this._options.modalHandlers.renderModal === 'function'
        ) {
            this._options.modalHandlers.renderModal(this);
        }
    }

    /**
     * Event handler for opening modal
     * (shall be delivered from the outside component)
     */
    public openModal(): any {
        if (
            this._options.modalHandlers.openModal &&
            typeof this._options.modalHandlers.openModal === 'function'
        ) {
            this._options.modalHandlers.openModal(this);
        }
    }

    /**
     * Event handler for closing modal
     * (shall be delivered from the outside component)
     */
    public closeModal(): any {
        if (
            this._options.modalHandlers.closeModal &&
            typeof this._options.modalHandlers.closeModal === 'function'
        ) {
            this._options.modalHandlers.closeModal(this);
        }
    }

    /**
     * Renders Iframe with YT video player as soon as Youtube's Iframe API is loaded
     */
    public renderVideoPlayer(): any {
        const _obj: any = this;
        const onYTplayerReady: any = this._setVideoEvents.bind(this);

        function onYouTubeIframeAPIReady(): void {
            _obj._ytPlayer = new YT.Player(_obj._options.videoPlayerId, {
                width: _obj._options.videoPlayerWidth,
                height: _obj._options.videoPlayerHeight,
                playerVars: {
                    autoplay: _obj._options.videoAutoplay,
                    controls: 1,
                    rel: 0,
                },
                events: {
                    onReady: onYTplayerReady,
                },
            });
        }

        window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady.bind(this);
    }

    /**
     * Tells if video shall be opened in fullscreen mode based on browser information
     * It returns true for all TOUCH devices, not only Smartphones and Tablets
     * @return Boolean
     */
    public shallOpenVideoInFullscreen(): boolean {
        return (
            this._options.openVideoInFullscreenMobile &&
            ('ontouchstart' in window || navigator.msMaxTouchPoints > 0)
        );
    }

    /**
     * Setups click events for videos (if url matches youtube link)
     */
    protected _setVideoEvents(): void {
        const _obj: any = this;

        this._$videosTriggers.on('click', function(e: Event): void {
            e.preventDefault();
            const videoId: string = _obj._extractYTvideoId(
                $(this).attr('href')
            );

            _obj._runYTvideo(videoId);
        });
    }

    /**
     * Strips url to extract ID of the video
     */
    protected _extractYTvideoId(YTvideoUrl: string): string {
        const url: any = YTvideoUrl.split(
            /(vi\/|v%3D|v=|\/v\/|youtu\.be\/|\/embed\/)/
        );
        return undefined !== url[2] ? url[2].split(/[^0-9a-z_\-]/i)[0] : url[0];
    }

    /**
     * Checks if API script has been already added to the DOM
     */
    protected _isYTapiLoaded(): boolean {
        return (
            $('head').find('script[src*="https://www.youtube.com/iframe_api"]')
                .length > 0
        );
    }

    /**
     * Loads youtube's Iframe API and then initializes player object
     * onYouTubeIframeAPIReady() has to be accessible globaly
     */
    protected _loadYTapi(): void {
        const tag: any = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag: any = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    /**
     * Loads video with given ID into player and opens modal
     */
    protected _runYTvideo(videoId: string): void {
        if (this._options.videoAutoplay) {
            this._ytPlayer.loadVideoById(videoId);
        } else {
            this._ytPlayer.cueVideoById(videoId);
        }

        if (this._options.useModal) {
            this.openModal();
        }
    }
}
