import { VimeoPlayerOptions } from 'components/_video/interfaces';
import { getSDK } from '../../utils/loader';

const SDK_URL = 'https://player.vimeo.com/api/player.js';
const SDK_GLOBAL = 'Vimeo';
const SDK_GLOBAL_READY = null;
const SDK_REQUIREJS = true;

const vimeoPlayer = {
    players: {},
    _userPaused: {},
    /**
     * Render Vimeo Player
     * @param url
     * @param options
     * @param id
     */
    render: function (
        url: string,
        options: VimeoPlayerOptions,
        id: string,
        onStageChangeHandler?: () => void
    ) {
        getSDK(SDK_URL, SDK_GLOBAL, SDK_GLOBAL_READY, SDK_REQUIREJS).then((Player) => {
            this.players[id] = new Player(id, {
                url,
                ...options.player_vars,
            });

            if (onStageChangeHandler) {
                ['pause', 'play'].forEach((event) => {
                    this.players[id].on(event, onStageChangeHandler);
                });
            }

            this.players[id].ready().then(() => {
                const iframe = document.getElementById(id).querySelector('iframe');
                iframe.style.width = options.width;
                iframe.style.height = options.height;
            });
        });
    },
    /**
     * Play video for given player id
     * - additional check whether video is playing or paused
     * @param id
     */
    play: function (id) {
        if (this.players[id]) {
            this.players[id].getPaused().then((paused) => {
                if (paused) {
                    setTimeout(() => {
                        this.players[id].play();
                    }, 0);
                }
            });
        }
    },
    /**
     * Pause video for given player id
     * - additional check whether video is playing or paused
     * @param id
     */
    pause: function (id, userPaused: boolean) {
        if (this.players[id]) {
            this.players[id].getPaused().then((paused) => {
                if (!paused) {
                    this.players[id].pause();
                    if (userPaused) {
                        this._userPaused[id] = true;
                    }
                }
            });
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
        if (this.players[id]) {
            const paused = await this.players[id].getPaused();
            return !paused;
        }

        return false;
    },

    userPaused: function (id: string) {
        return this._userPaused[id] || false;
    },
};

export default vimeoPlayer;
