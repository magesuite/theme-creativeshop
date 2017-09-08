/* tslint:disable:no-unused-expression no-unused-new ordered-imports */
import GridLayout from '../../../node_modules/creative-patterns/packages/components/grid-layout/src/grid-layout';
import $ from 'jquery';

$('.cs-grid-layout').each(function(): void {
    new GridLayout($(this));
});

$('.cs-grid-layout_in-column').each(function(): void {
    new GridLayout($(this), {
        gridClass: 'cs-grid-layout_in-column__grid',
        brickClass: 'cs-grid-layout_in-column__brick',
    });
});
