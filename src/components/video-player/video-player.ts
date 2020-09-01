import * as $ from 'jquery';
import requireAsync from 'utils/require-async';
import viewXml from 'etc/view';
import deepGet from 'utils/deep-get/deep-get';

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
     * Defines type of the Magento modal
     * @type {string}
     * @default 'popup'
     */
    modalType?: string;

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
        this._options = $.extend(
            options,
            deepGet(
                viewXml,
                'vars.MageSuite_ContentConstructorFrontend.video_player'
            )
        );

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
        const modalOptions: any = {
            type: this._options.modalType,
            modalClass: 'cs-modal cs-video-player__modal',
            responsive: true,
            innerScroll: false,
            buttons: [],
            closed: (): void => {
                this._ytPlayer.stopVideo();
            },
            opened: (): void => {
                const iframe: any = document.querySelector(
                    `#${this._options.videoPlayerId}`
                );
                const requestFS: any =
                    iframe.requestFullScreen ||
                    iframe.mozRequestFullScreen ||
                    iframe.webkitRequestFullScreen;

                if (
                    this.shallOpenVideoInFullscreen() &&
                    typeof requestFS !== 'undefined'
                ) {
                    requestFS.bind(iframe)();
                }
            },
        };

        requireAsync(['jquery', 'Magento_Ui/js/modal/modal']).then(
            ([$, modal]) => {
                this._ytModal = modal(modalOptions, $('#yt-modal'));
            }
        );
    }

    /**
     * Event handler for opening modal
     * (shall be delivered from the outside component)
     */
    public openModal(): any {
        this._ytModal.openModal();
    }

    /**
     * Event handler for closing modal
     * (shall be delivered from the outside component)
     */
    public closeModal(): any {
        this._ytModal.closeModal();
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
