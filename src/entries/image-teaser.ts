import * as $ from 'jquery';
import { ImageTeaser } from 'components/image-teaser';

export function ccImageTeaser(config, element) {
    new ImageTeaser($(element), config);
}
