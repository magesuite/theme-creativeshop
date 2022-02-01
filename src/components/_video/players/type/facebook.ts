import { FacebookPlayerOptions } from 'components/_video/interfaces';
import { getSDK } from '../../utils/loader';

const SDK_URL = 'https://connect.facebook.net/en_US/sdk.js';
const SDK_GLOBAL = 'FB';
const SDK_GLOBAL_READY = 'fbAsyncInit';
const VIDEO_CLASS = 'fb-video';

/**
 * Prepare video wrapper with Facebook Player data
 * @param url
 * @param options
 * @param id
 */
const prepareVideoData = (
    url: string,
    options: FacebookPlayerOptions,
    id: string
) => {
    const element = document.getElementById(id);
    element.className = VIDEO_CLASS;
    element.setAttribute('data-href', url);
    element.setAttribute('data-width', options.width);
    element.setAttribute(
        'data-autoplay',
        options.player_vars.autoplay.toString()
    );
    element.setAttribute(
        'data-controls',
        options.player_vars.controls.toString()
    );
};

const facebookPlayer = {
    players: {},
    isSDKLoaded: false,
    /**
     * Render Facebook Player
     * @param url
     * @param options
     * @param id
     */
    render: function(url: string, options: FacebookPlayerOptions, id: string) {
        // Guard: prevent loading FB SKD without app id or version, it will fail
        if (!options.app_id || !options.app_version) {
            // Facebook application data not found
            document.getElementById(id).remove();

            return;
        }

        prepareVideoData(url, options, id);
        getSDK(SDK_URL, SDK_GLOBAL, SDK_GLOBAL_READY).then(FB => {
            // Initialize main FB SDK once
            if (!this.isSDKLoaded) {
                FB.init({
                    appId: options.app_id,
                    xfbml: true,
                    version: options.app_version,
                });
                this.isSDKLoaded = true;
            }

            FB.Event.subscribe('xfbml.ready', msg => {
                if (msg.type === 'video' && msg.id === id) {
                    this.players[id] = msg.instance;

                    if (options.player_vars.loop) {
                        this.players[id].subscribe('finishedPlaying', () =>
                            this.players[id].play()
                        );
                    }

                    if (options.player_vars.mute) {
                        this.players[id].mute();
                    } else {
                        this.players[id].unmute();
                    }

                    // For some reason Facebook have added `visibility: hidden`
                    // to the iframe when autoplay fails, so here we set it back
                    document
                        .getElementById(id)
                        .querySelector('iframe').style.visibility = 'visible';
                }
            });

            FB.XFBML.parse();
        });
    },
    /**
     * Play video for given player id
     * @param id
     */
    play: function(id: string) {
        if (this.players[id]) {
            this.players[id].play();
        }
    },
    /**
     * Pause video for given player id
     * @param id
     */
    pause: function(id: string) {
        if (this.players[id]) {
            this.players[id].pause();
        }
    },
    /**
     * Destroy video for given player id
     * @param id
     */
    destroy: function(id: string) {
        if (this.players[id]) {
            delete this.players[id];
            document.getElementById(id).remove();
        }
    },
};

export default facebookPlayer;
