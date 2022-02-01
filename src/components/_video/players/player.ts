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
        render: (url: string, options: YouTubePlayerOptions, id: string) =>
            youtubePlayer.render(url, options, id),
        play: (id: string) => youtubePlayer.play(id),
        pause: (id: string) => youtubePlayer.pause(id),
        destroy: (id: string) => youtubePlayer.destroy(id),
    },
    vimeo: {
        render: (url: string, options: VimeoPlayerOptions, id: string) =>
            vimeoPlayer.render(url, options, id),
        play: (id: string) => vimeoPlayer.play(id),
        pause: (id: string) => vimeoPlayer.pause(id),
        destroy: (id: string) => vimeoPlayer.destroy(id),
    },
    facebook: {
        render: (url: string, options: FacebookPlayerOptions, id: string) =>
            facebookPlayer.render(url, options, id),
        play: (id: string) => facebookPlayer.play(id),
        pause: (id: string) => facebookPlayer.pause(id),
        destroy: (id: string) => facebookPlayer.destroy(id),
    },
    file: {
        render: (url: string, options: FilePlayerOptions, id: string) =>
            filePlayer.render(url, options, id),
        play: (id: string) => filePlayer.play(id),
        pause: (id: string) => filePlayer.pause(id),
        destroy: (id: string) => filePlayer.destroy(id),
    },
};

export default Player;
