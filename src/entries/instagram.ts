import * as $ from 'jquery';
import { default as Instagram } from 'components/instagram/instagram';

export function ccInstagram(config, element) {
    new Instagram($(element), config);
}
