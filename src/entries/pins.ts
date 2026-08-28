import { IPinsConfig, Pins } from 'components/pins';

export function ccPins(config: IPinsConfig, element: HTMLElement) {
    new Pins(element, config);
}
