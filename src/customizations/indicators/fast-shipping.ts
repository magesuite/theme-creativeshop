import FastShipping from '../../../node_modules/creative-patterns/packages/components/indicators/src/fast-shipping';
import $ from 'jquery';

$('.cs-indicators__fast-shipping').each((i: number, el: HTMLElement): void => {
    new FastShipping($(el));
});
