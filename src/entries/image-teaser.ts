import { ISlider, ImageTeaser } from 'components/image-teaser';

export function ccImageTeaser(config: ISlider, element: HTMLElement) {
    new ImageTeaser(element, config);
}
