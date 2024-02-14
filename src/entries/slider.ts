import ISlider from 'components/_slider/interface';
import Slider from 'components/_slider/slider';

export function mgsSlider(config: ISlider, element: HTMLElement) {
    return new Slider(element, config);
}
