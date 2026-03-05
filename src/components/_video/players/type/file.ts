import { FilePlayerOptions } from 'components/_video/interfaces';

const filePlayer = {
    players: {},
    _userPaused: {},
    /**
     * Render File Player
     * @param url
     * @param options
     * @param id
     */
    render: function (
        url: string,
        options: FilePlayerOptions,
        id: string,
        onStageChangeHandler?: () => void
    ) {
        const video = document.createElement('video');
        video.id = id;
        video.src = url;
        video.style.width = options.width;
        video.style.height = options.height;
        options.player_vars.muted ? (video.muted = true) : null;
        options.player_vars.autoplay ? (video.autoplay = true) : null;
        options.player_vars.playsinline ? (video.playsInline = true) : null;
        options.player_vars.controls ? (video.controls = true) : null;
        options.player_vars.loop ? (video.loop = true) : null;

        document.getElementById(id).replaceWith(video);
        this.players[id] = document.getElementById(id);
        if (typeof onStageChangeHandler === 'function') {
            ['ended', 'pause', 'play'].forEach((event) =>
                this.players[id].addEventListener(event, onStageChangeHandler)
            );
        }
    },
    /**
     * Play video for given player id
     * @param id
     */
    play: function (id) {
        if (this.players[id]) {
            this.players[id].play();
        }
    },
    /**
     * Pause video for given player id
     * @param id
     */
    pause: function (id, userPaused: boolean) {
        if (this.players[id]) {
            this.players[id].pause();
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
            delete this.players[id];
            document.getElementById(id).remove();
        }
    },

    isPlaying: async function (id) {
        if (this.players[id]) {
            return !this.players[id].paused;
        }

        return false;
    },

    userPaused: function (id: string) {
        return this._userPaused[id] || false;
    },
};

export default filePlayer;
