import { FastShippingCached } from './fast-shipping';
import $ from 'jquery';

$('.cs-indicators__fast-shipping').each(function(): void {
    new FastShippingCached($(this));
});
