import $ from 'jquery';
const namespace: string = 'cs-';

// Initialize collapsible text
const init: any = function(): void {
    $('.js-collapsible-text').each(function() {
        const $element = $(this);
        const maxHeight: number = parseInt($(this).data('height'), 10) || 100;
        const $content: JQuery = $(this).find($(this).data('content'));
        const $trigger: JQuery = $(this).find($(this).data('trigger'));
        const showMoreText: string = $trigger.data('show-more-text');
        const showLessText: string = $trigger.data('show-less-text');
        let contentHeight: string;
        let isContentHidden: boolean = false;

        if ($content.length && $content.height() > maxHeight) {
            if ($trigger.length) {
                $trigger.show();
            }

            $content
                .css({
                    overflow: 'hidden',
                    height: maxHeight,
                })
                .addClass(`${namespace}collapsible-text__content--hidden`);

            isContentHidden = true;

            $trigger.on('click', function(event: Event): void {
                event.preventDefault();
                const $button = $(this).find('span').length
                    ? $(this).find('span')
                    : $(this);
                if (isContentHidden) {
                    $button.text(showLessText);
                    $content
                        .css('height', 'auto')
                        .removeClass(
                            `${namespace}collapsible-text__content--hidden`
                        );
                    isContentHidden = false;
                    contentHeight = $element.height();

                } else {
                    $button.text(showMoreText);
                    $content
                        .css('height', maxHeight)
                        .addClass(
                            `${namespace}collapsible-text__content--hidden`
                        );
                    isContentHidden = true;
                    if(contentHeight > $(window).height()) {
                        $('html, body').animate({
                            scrollTop: $element.offset().top - 100
                        }, 400);
                    }
                }
            });

            $content.on('click', function(event: Event): void {
                if (isContentHidden) {
                    $trigger.text(showLessText);
                    $content
                        .css('height', 'auto')
                        .removeClass(
                            `${namespace}collapsible-text__content--hidden`
                        );
                    isContentHidden = false;
                }
            });
        } else {
            $trigger.hide();
        }
    });
};

export { init };
