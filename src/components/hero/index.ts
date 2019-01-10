import * as $ from 'jquery';

import Hero from 'components/hero/hero';
import 'components/hero/hero.scss';

const componentClass: string = 'cs-hero';

$(`.${componentClass}`).each(function(): void {
    const $hero: JQuery<HTMLElement> = $(this);
    new Hero($hero, {
        spaceBetween: 2,
        callbacks: {
            onInit() {
                $hero.find(`.${componentClass}__slide--clone`).each(function(
                    i: number,
                    el: JQuery
                ): void {
                    const clonedSlideImg: JQuery = $(el).find('img');

                    const clonedSlideImgAlt: string = clonedSlideImg.attr(
                        'alt'
                    );

                    clonedSlideImg.attr(
                        'alt',
                        `${clonedSlideImgAlt}-duplicated-${i}`
                    );
                });
            },
        },
    });
});
