import { VimeoPlayerOptions } from 'components/_video/interfaces';
import { getSDK } from '../../utils/loader';

const SDK_URL = 'https://player.vimeo.com/api/player.js';
const SDK_GLOBAL = 'Vimeo';
const SDK_GLOBAL_READY = null;
const SDK_REQUIREJS = true;

const vimeoPlayer = {
    players: {},
    /**
     * Render Vimeo Player
     * @param url
     * @param options
     * @param id
     */
    render: function(url: string, options: VimeoPlayerOptions, id: string) {
        getSDK(SDK_URL, SDK_GLOBAL, SDK_GLOBAL_READY, SDK_REQUIREJS).then(
            Player => {
                this.players[id] = new Player(id, {
                    url,
                    ...options.player_vars,
                });

                this.players[id].ready().then(() => {
                    const iframe = document
                        .getElementById(id)
                        .querySelector('iframe');
                    iframe.style.width = options.width;
                    iframe.style.height = options.height;
                });
            }
        );
    },
    /**
     * Play video for given player id
     * - additional check whether video is playing or paused
     * @param id
     */
    play: function(id) {
        if (this.players[id]) {
            this.players[id].getPaused().then(paused => {
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
    pause: function(id) {
        if (this.players[id]) {
            this.players[id].getPaused().then(paused => {
                if (!paused) {
                    this.players[id].pause();
                }
            });
        }
    },
    /**
     * Destroy video for given player id
     * @param id
     */
    destroy: function(id) {
        if (this.players[id]) {
            this.players[id].destroy();
        }
    },
};

export default vimeoPlayer;
