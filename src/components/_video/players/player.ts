import facebookPlayer from './type/facebook';
import vimeoPlayer from './type/vimeo';
import youtubePlayer from './type/youtube';
import filePlayer from './type/file';
import {
    PlayerAbstract,
    YouTubePlayerOptions,
    VimeoPlayerOptions,
    FacebookPlayerOptions,
    FilePlayerOptions,
} from '../interfaces';

const Player: PlayerAbstract = {
    youtube: {
        render: (
            url: string,
            options: YouTubePlayerOptions,
            id: string,
            onStateChange?: () => void
        ) => youtubePlayer.render(url, options, id, onStateChange),
        play: (id: string) => youtubePlayer.play(id),
        pause: (id: string, userPaused?: boolean) => youtubePlayer.pause(id, userPaused),
        destroy: (id: string) => youtubePlayer.destroy(id),
        isPlaying: async (id: string) => youtubePlayer.isPlaying(id),
        userPaused: (id: string) => youtubePlayer.userPaused(id),
    },
    vimeo: {
        render: (
            url: string,
            options: VimeoPlayerOptions,
            id: string,
            onStateChange?: () => void
        ) => vimeoPlayer.render(url, options, id, onStateChange),
        play: (id: string) => vimeoPlayer.play(id),
        pause: (id: string, userPaused?: boolean) => vimeoPlayer.pause(id, userPaused),
        destroy: (id: string) => vimeoPlayer.destroy(id),
        isPlaying: async (id: string) => vimeoPlayer.isPlaying(id),
        userPaused: (id: string) => vimeoPlayer.userPaused(id),
    },
    facebook: {
        render: (
            url: string,
            options: FacebookPlayerOptions,
            id: string,
            onStateChange?: () => void
        ) => facebookPlayer.render(url, options, id, onStateChange),
        play: (id: string) => facebookPlayer.play(id),
        pause: (id: string, userPaused?: boolean) => facebookPlayer.pause(id, userPaused),
        destroy: (id: string) => facebookPlayer.destroy(id),
        isPlaying: (id: string) => facebookPlayer.isPlaying(id),
        userPaused: (id: string) => facebookPlayer.userPaused(id),
    },
    file: {
        render: (url: string, options: FilePlayerOptions, id: string, onStateChange?: () => void) =>
            filePlayer.render(url, options, id, onStateChange),
        play: (id: string) => filePlayer.play(id),
        pause: (id: string, userPaused?: boolean) => filePlayer.pause(id, userPaused),
        destroy: (id: string) => filePlayer.destroy(id),
        isPlaying: (id: string) => filePlayer.isPlaying(id),
        userPaused: (id: string) => filePlayer.userPaused(id),
    },
};

export default Player;
