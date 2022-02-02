import { FilePlayerOptions } from 'components/_video/interfaces';

const MAGENTO_MEDIA_URL = `${window.location.origin}/media/`;
const MATCH_URL_MAGENTO = /"(.*?)"/;

/**
 * Get full video url from Magento's media library
 * @param url
 * @returns
 */
const getMediaSource = (url: string): string | null =>
    url ? MAGENTO_MEDIA_URL + url.match(MATCH_URL_MAGENTO)[1] : null;

const filePlayer = {
    players: {},
    /**
     * Render File Player
     * @param url
     * @param options
     * @param id
     */
    render: function(url: string, options: FilePlayerOptions, id: string) {
        const mediaSource = getMediaSource(url);

        // Guard: prevent if there is no source
        if (!mediaSource) {
            return;
        }

        const video = document.createElement('video');
        video.id = id;
        video.src = mediaSource;
        video.style.width = options.width;
        video.style.height = options.height;
        options.player_vars.muted ? (video.muted = true) : null;
        options.player_vars.autoplay ? (video.autoplay = true) : null;
        options.player_vars.playsinline ? (video.playsInline = true) : null;
        options.player_vars.controls ? (video.controls = true) : null;
        options.player_vars.loop ? (video.loop = true) : null;

        document.getElementById(id).replaceWith(video);
        this.players[id] = document.getElementById(id);
    },
    /**
     * Play video for given player id
     * @param id
     */
    play: function(id) {
        if (this.players[id]) {
            this.players[id].play();
        }
    },
    /**
     * Pause video for given player id
     * @param id
     */
    pause: function(id) {
        if (this.players[id]) {
            this.players[id].pause();
        }
    },
    /**
     * Destroy video for given player id
     * @param id
     */
    destroy: function(id) {
        if (this.players[id]) {
            delete this.players[id];
            document.getElementById(id).remove();
        }
    },
};

export default filePlayer;
