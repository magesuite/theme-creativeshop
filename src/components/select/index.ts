import * as $ from 'jquery';
import Select from 'components/select/select';

$('.cs-select').each((index: number, element: HTMLElement) => {
    new Select($(element));
});

export { Select };
