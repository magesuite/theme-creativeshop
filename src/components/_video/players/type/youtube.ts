import { getSDK } from '../../utils/loader';
import { YouTubePlayerOptions } from 'components/_video/interfaces';

const SDK_URL = 'https://www.youtube.com/iframe_api';
const SDK_GLOBAL = 'YT';
const SDK_GLOBAL_READY = 'onYouTubeIframeAPIReady';
const MATCH_NOCOOKIE = /youtube-nocookie\.com/;
const NOCOOKIE_HOST = 'https://www.youtube-nocookie.com';
const MATCH_URL_YOUTUBE =
    /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|watch\/|shorts\/|watch\?v=|watch\?.+&v=))((\w|-){11})|youtube\.com\/playlist\?list=|youtube\.com\/user\//;

/**
 * Get YouTube video id
 * @param url
 * @returns
 */
const getVideoId = (url: string): string | null => (url ? url.match(MATCH_URL_YOUTUBE)[1] : null);

const youtubePlayer = {
    players: {},
    _userPaused: {},
    /**
     * Render YouTube Player
     * @param url
     * @param options
     * @param id
     */
    render: function (
        url: string,
        options: YouTubePlayerOptions,
        id: string,
        onStageChangeHandler?: () => void
    ) {
        const videoId = getVideoId(url);

        // Guard: prevent if there is no video id
        if (!videoId) {
            return;
        }

        getSDK(SDK_URL, SDK_GLOBAL, SDK_GLOBAL_READY).then((YT) => {
            this.players[id] = new YT.Player(id, {
                width: options.width,
                height: options.height,
                videoId: videoId,
                playerVars: {
                    origin: window.location.origin,
                    ...options.player_vars,
                },
                events: {
                    // Trigger manual play for mobile devices (iOS, Android)
                    onReady: (event) => {
                        if (options.player_vars.autoplay) {
                            event.target.playVideo();
                        }
                    },
                    // Trigger manual loop
                    onStateChange: (event) => {
                        const { ENDED, PAUSED, PLAYING } = window[SDK_GLOBAL].PlayerState;
                        if (options.loop && !options.player_vars.controls) {
                            if (event.data === ENDED) {
                                event.target?.playVideo();
                            }
                        }
                        if (
                            typeof onStageChangeHandler === 'function' &&
                            (event.data === ENDED ||
                                event.data === PAUSED ||
                                event.data === PLAYING)
                        ) {
                            onStageChangeHandler();
                        }
                    },
                },
                host: MATCH_NOCOOKIE.test(url) ? NOCOOKIE_HOST : undefined,
            });
        });
    },
    /**
     * Play video for given player id
     * - additional check whether video is playing or paused
     * @param id
     */
    play: function (id) {
        const { PAUSED } = window[SDK_GLOBAL].PlayerState;

        if (this.players[id] && this.players[id].playerInfo.playerState === PAUSED) {
            this.players[id].playVideo();
        }
    },
    /**
     * Pause video for given player id
     * - additional check whether video is playing or paused
     * @param id
     */
    pause: function (id, userPaused: boolean) {
        const { PLAYING } = window[SDK_GLOBAL].PlayerState;

        if (this.players[id] && this.players[id].playerInfo.playerState === PLAYING) {
            this.players[id].pauseVideo();
            if (userPaused) {
                this._userPaused[id] = true;
            }
        }
    },
    /**
     * Destroy video for given player id
     * @param id
     */
    destroy: function (id) {
        if (this.players[id]) {
            this.players[id].destroy();
        }
    },

    isPlaying: async function (id) {
        const { PLAYING } = window[SDK_GLOBAL].PlayerState;

        return this.players[id] ? this.players[id].playerInfo.playerState === PLAYING : false;
    },

    userPaused: function (id: string) {
        return this._userPaused[id] || false;
    },
};

export default youtubePlayer;
