import requireAsync from 'utils/require-async';
import viewXml from 'etc/view';
import deepGet from 'utils/deep-get/deep-get';
import consentManagement from 'components/consent-management';
import Player from 'components/_video/players/player';
import {
    PlayerType,
    VideoLayerOptions,
    VideoLayerModalOptions,
} from 'components/_video/interfaces';

declare global {
    interface HTMLIFrameElement {
        requestFullScreen?(): Promise<any>;
        mozRequestFullScreen?(): Promise<any>;
        webkitRequestFullScreen?(): Promise<any>;
    }

    interface Navigator {
        msMaxTouchPoints: number;
    }
}

export default class VideoLayer {
    public _options: VideoLayerOptions;
    public _videoModal = {};
    public _videoPlayer: PlayerType;
    protected _layerTriggers: NodeListOf<HTMLAnchorElement>;

    /**
     * Creates VideoLayer component
     */
    public constructor() {
        this._options = deepGet(
            viewXml,
            'vars.MageSuite_ContentConstructorFrontend.video_layer'
        );
        this._layerTriggers = document.querySelectorAll(
            '.cs-image-teaser a[href*="youtube.com"], .cs-image-teaser a[href*="youtu.be"]'
        );

        if (this._layerTriggers?.length > 0) {
            this.initialize();
        }
    }

    public initialize(): void {
        this.createModals();
    }

    /**
     * Setup modals
     */
    public createModals(): void {
        const modalOptions: VideoLayerModalOptions = {
            type: this._options.modal_type,
            modalClass: 'cs-video-layer__modal',
            parentModalClass: '',
            responsive: true,
            innerScroll: false,
            buttons: false,
        };

        this._layerTriggers.forEach((element, index) => {
            const videoPlayerId = `vl-player-${index}`;
            const videoModalId = `vl-modal-${index}`;

            this.prepareModalWrapper(videoPlayerId, videoModalId);

            requireAsync(['jquery', 'Magento_Ui/js/modal/modal']).then(
                ([$, modal]) => {
                    this._videoModal[videoModalId] = modal(
                        {
                            /**
                             * When modal is closed
                             */
                            closed: (): void => {
                                this._videoPlayer.pause(videoPlayerId);
                            },
                            /**
                             * When modal is opened
                             */
                            opened: (): void => {
                                this.forceMobileFullscreen(videoPlayerId);
                            },
                            ...modalOptions,
                        },
                        $(`#${videoModalId}`)
                    );
                }
            );

            element.addEventListener('click', event => {
                event.preventDefault();
                this.attachEvent(element, videoPlayerId, videoModalId);
            });
        });
    }

    /**
     * Inject markup for Magento Modal
     * @param videoPlayerId
     * @param videoModalId
     */
    protected prepareModalWrapper(videoPlayerId, videoModalId): void {
        const videoWrapperElement: HTMLDivElement = document.createElement(
            'div'
        );
        videoWrapperElement.id = videoModalId;
        videoWrapperElement.className = 'cs-video-layer__wrapper';

        const videoLayerElement: HTMLDivElement = document.createElement('div');
        videoLayerElement.id = videoPlayerId;
        videoLayerElement.className = 'cs-video-layer';

        videoWrapperElement.prepend(videoLayerElement);
        document.body.append(videoWrapperElement);
    }

    /**
     * Attach event for video layer trigger
     * Depending on consent will
     * - open modal and render player inside
     * - open video in new window
     * @param element
     * @param videoPlayerId
     * @param videoModalId
     */
    protected attachEvent(element, videoPlayerId, videoModalId): void {
        if (consentManagement.checkConsent('youtube')) {
            const hasPlayer: boolean =
                this.getIframePlayer(videoPlayerId) !== null;

            if (!hasPlayer) {
                this.renderPlayer(element.href, videoPlayerId);
            }

            this._videoModal[videoModalId].openModal();
        } else {
            window.open(element.href, '_blank');
        }
    }

    /**
     * Render YouTube Player
     * @param url
     * @param videoPlayerId
     */
    protected renderPlayer(url, videoPlayerId): void {
        this._videoPlayer = Player.youtube;
        this._videoPlayer.render(url, this._options.youtube, videoPlayerId);
    }

    /**
     * Depends on touch devices + config
     * @return Boolean
     */
    protected isMobileFullscreenEnabled(): boolean {
        return (
            this._options.mobile_fullscreen &&
            ('ontouchstart' in window || navigator.msMaxTouchPoints > 0)
        );
    }

    /**
     *
     * @param videoPlayerId
     */
    protected forceMobileFullscreen(videoPlayerId): void {
        const iframe: HTMLIFrameElement = this.getIframePlayer(videoPlayerId);

        const requestFS: any =
            iframe.requestFullScreen ||
            iframe.mozRequestFullScreen ||
            iframe.webkitRequestFullScreen;

        if (this.isMobileFullscreenEnabled() && typeof requestFS !== null) {
            requestFS.bind(iframe)();
        }
    }

    protected getIframePlayer(videoPlayerId): HTMLIFrameElement {
        return document.querySelector(`iframe#${videoPlayerId}`);
    }
}
