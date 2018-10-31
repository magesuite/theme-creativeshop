import VideoPlayer from 'components/video-player/video-player';
import * as $ from 'jquery';

new VideoPlayer({
    modalHandlers: {
        /**
         * Configures and renders Magento's modal to be used for display youtube videos
         * if possible and option is set it also tries to trigger fullscreen for touch devices
         */
        renderModal(videoPlayer: VideoPlayer): void {
            const modalOptions: any = {
                type: 'popup',
                modalClass: 'cs-modal cs-video-player__modal',
                responsive: true,
                innerScroll: false,
                buttons: [],
                closed: (): void => {
                    videoPlayer._ytPlayer.stopVideo();
                },
                opened: (): void => {
                    const iframe: any = document.querySelector(
                        `#${videoPlayer._options.videoPlayerId}`
                    );
                    const requestFS: any =
                        iframe.requestFullScreen ||
                        iframe.mozRequestFullScreen ||
                        iframe.webkitRequestFullScreen;

                    if (
                        videoPlayer.shallOpenVideoInFullscreen() &&
                        typeof requestFS !== 'undefined'
                    ) {
                        requestFS.bind(iframe)();
                    }
                },
            };

            requirejs(['Magento_Ui/js/modal/modal'], modal => {
                videoPlayer._ytModal = modal(modalOptions, $('#yt-modal'));
            });
        },
        /**
         * Opens Magento's modal
         */
        openModal(videoPlayer: VideoPlayer): void {
            videoPlayer._ytModal.openModal();
        },
        /**
         * Closes Magento's modal
         */
        closeModal(videoPlayer: VideoPlayer): void {
            videoPlayer._ytModal.openModal();
        },
    },
});
