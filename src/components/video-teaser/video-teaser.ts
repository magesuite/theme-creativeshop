import viewXml from 'etc/view';
import deepGet from 'utils/deep-get/deep-get';
import consentManagement from 'components/consent-management';
import Player from '../_video/players/player';
import VideoTeaserOptions, {
    PlayerType,
    VideoTeaserDataOptions,
    YouTubePlayerOptions,
    VimeoPlayerOptions,
    FacebookPlayerOptions,
    FilePlayerOptions,
} from '../_video/interfaces';

export default class VideoTeaser {
    public _options: VideoTeaserOptions;
    public _videoTeasers: NodeListOf<HTMLDivElement>;
    public _videoTeaserSelector: string;

    /**
     * Creates VideoTeaser component
     */
    public constructor(
        viewXmlConfigPath = 'vars.MageSuite_ContentConstructorFrontend.video_teaser'
    ) {
        this._options = deepGet(viewXml, viewXmlConfigPath);
        this._videoTeasers = document.querySelectorAll(
            this._options.videoSelector
        );

        if (this._videoTeasers?.length > 0) {
            this.initialize();
        }
    }

    public initialize(): void {
        this.addIntersectionObserver();
        this.attachConsentEvents();
    }

    /**
     * Register IntersectionObserver
     */
    protected addIntersectionObserver(): void {
        const io: IntersectionObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    this.handleVideoTeaser(
                        entry.target,
                        entry.isIntersecting,
                        Array.from(this._videoTeasers).indexOf(
                            entry.target as HTMLDivElement
                        )
                    );
                });
            },
            {
                threshold: 0.5,
            }
        );

        this._videoTeasers.forEach((el) => io.observe(el));
    }

    /**
     * Attach Consent related events
     */
    protected attachConsentEvents(): void {
        const callback = (): void => {
            this._videoTeasers.forEach((el) => {
                this.handleVideoTeaser(
                    el,
                    this.isInViewPort(el),
                    Array.from(this._videoTeasers).indexOf(el)
                );
            });
        };

        consentManagement.initializeEvent(callback);
        consentManagement.changeEvent(callback);
    }

    /**
     * Run actions depending if video teaser is visible
     *
     * @param videoTeaser
     * @param isVisible
     * @param index
     */
    protected handleVideoTeaser(videoTeaser, isVisible, index): void {
        const videoPlayerPlaceholder = videoTeaser.querySelector(
            '[data-video-teaser]'
        );
        const videoData: VideoTeaserDataOptions = JSON.parse(
            videoPlayerPlaceholder.dataset.videoTeaser
        );
        const videoTypeConfig:
            | YouTubePlayerOptions
            | VimeoPlayerOptions
            | FacebookPlayerOptions
            | FilePlayerOptions = this.getVideoConfiguration(
            videoTeaser,
            videoData
        );
        const consentStatus: boolean =
            videoData.type !== 'file'
                ? consentManagement.checkConsent(videoData.type)
                : true;
        const hasPlayer: boolean =
            videoPlayerPlaceholder.querySelector('iframe') !== null ||
            videoPlayerPlaceholder.querySelector('video') !== null;
        const videoPlayer: PlayerType = Player[videoData.type];
        const videoTeaserId: string = `video-teaser-${index}`;

        // Guard: prevent further logic if videoPlayer is not available
        if (!videoPlayer) {
            return;
        }

        if (consentStatus) {
            if (isVisible) {
                if (hasPlayer) {
                    if (videoTypeConfig.player_vars.autoplay) {
                        videoPlayer.play(videoTeaserId);
                    }
                } else {
                    const videoWrapper: HTMLDivElement =
                        document.createElement('div');
                    videoWrapper.id = videoTeaserId;
                    videoPlayerPlaceholder.prepend(videoWrapper);

                    videoPlayer.render(
                        videoData.url,
                        videoTypeConfig,
                        videoTeaserId
                    );
                }
            } else {
                if (hasPlayer) {
                    videoPlayer.pause(videoTeaserId);
                }
            }
        } else {
            if (isVisible && hasPlayer) {
                videoPlayer.destroy(videoTeaserId);

                if (
                    videoPlayerPlaceholder.firstElementChild.id ===
                    videoTeaserId
                ) {
                    videoPlayerPlaceholder.removeChild(
                        videoPlayerPlaceholder.firstElementChild
                    );
                }
            }
        }
    }

    /**
     * Check if element is visible in view port
     * @param element
     * @returns
     */
    public isInViewPort(element): boolean {
        const distance: DOMRect = element.getBoundingClientRect();

        return (
            distance.top <=
                (window.innerHeight || document.documentElement.clientHeight) &&
            distance.left <=
                (window.innerWidth || document.documentElement.clientWidth) &&
            distance.bottom >= 0 &&
            distance.right >= 0
        );
    }

    /**
     * Return video configuration
     *
     * @param videoTeaser
     * @param videoData
     * @returns
     */
    public getVideoConfiguration(
        videoTeaser,
        videoData
    ):
        | YouTubePlayerOptions
        | VimeoPlayerOptions
        | FacebookPlayerOptions
        | FilePlayerOptions {
        return this._options[videoData.type];
    }
}
