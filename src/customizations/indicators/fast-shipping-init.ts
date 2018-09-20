import { FastShippingCached } from './fast-shipping';
import * as $ from 'jquery';

$('.cs-indicators__fast-shipping').each(function(): void {
    new FastShippingCached($(this));
});
