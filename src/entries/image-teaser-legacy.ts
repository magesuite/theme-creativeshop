import * as $ from 'jquery';
import { ImageTeaserLegacy } from 'components/image-teaser-legacy';

export function ccImageTeaserLegacy(config, element) {
    new ImageTeaserLegacy($(element), config);
}
