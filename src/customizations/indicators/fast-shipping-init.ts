import { FastShippingCached } from './fast-shipping';
import * as $ from 'jquery';

$('.cs-indicator--fast-shipping').each(function(): void {
    new FastShippingCached($(this));
});
