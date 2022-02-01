/**
 * YouTube Player Interface
 */
export interface YouTubePlayerOptions {
    loop: boolean;
    width: string;
    height: string;
    player_vars: YouTubePlayerParameters;
}

interface YouTubePlayerParameters {
    playsinline: boolean;
    autoplay: boolean;
    mute: boolean;
    controls: boolean;
    showinfo: boolean;
}

/**
 * Vimeo Player Interface
 */
export interface VimeoPlayerOptions {
    width: string;
    height: string;
    player_vars: VimeoPlayerParameters;
}

interface VimeoPlayerParameters {
    playsinline: boolean;
    autoplay: boolean;
    muted: boolean;
    controls: boolean;
    loop: boolean;
    responsive: boolean;
}

/**
 * Facebook Player Interface
 */
export interface FacebookPlayerOptions {
    app_id: string;
    app_version: string;
    width: string;
    player_vars: FacebookPlayerParameters;
}

interface FacebookPlayerParameters {
    autoplay: boolean;
    mute: boolean;
    controls: boolean;
    loop: boolean;
}

/**
 * File Player Interface
 */
export interface FilePlayerOptions {
    width: string;
    height: string;
    player_vars: FilePlayerParameters;
}

interface FilePlayerParameters {
    playsinline: boolean;
    autoplay: boolean;
    controls: boolean;
    muted: boolean;
    loop: boolean;
}

/**
 * Video Teaser Interface
 */
export default interface VideoTeaserOptions {
    youtube: YouTubePlayerOptions;
    vimeo: VimeoPlayerOptions;
    facebook: FacebookPlayerOptions;
    file: FilePlayerOptions;
}

export interface VideoTeaserDataOptions {
    url: string;
    type: string;
}

/**
 * Player Abstract Interface
 */
export interface PlayerAbstract {
    youtube: PlayerType;
    vimeo: PlayerType;
    facebook: PlayerType;
    file: PlayerType;
}

export interface PlayerType {
    render: (
        url: string,
        options:
            | YouTubePlayerOptions
            | VimeoPlayerOptions
            | FacebookPlayerOptions
            | FilePlayerOptions
            | VideoLayerYouTubeOptions,
        id: string
    ) => void;
    play: (id: string) => void;
    pause: (id: string) => void;
    destroy: (id: string) => void;
}

/**
 * Video Layer Interface
 */
export interface VideoLayerOptions {
    mobile_fullscreen: boolean;
    modal_type: string;
    youtube: VideoLayerYouTubeOptions;
}

interface VideoLayerYouTubeOptions {
    loop: boolean;
    width: string;
    height: string;
    player_vars: VideoLayerYouTubeParameters;
}

interface VideoLayerYouTubeParameters {
    playsinline: boolean;
    autoplay: boolean;
    controls: boolean;
    rel: boolean;
}

/**
 * Video Layer Modal Options
 */
export interface VideoLayerModalOptions {
    type: string;
    modalClass: string;
    parentModalClass: string;
    responsive: boolean;
    innerScroll: boolean;
    buttons: boolean;
}
