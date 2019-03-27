import * as $ from 'jquery';
import Select from 'components/select/select';
import 'components/select/select.scss';

$('.cs-select').each((index: number, element: HTMLSelectElement) => {
    const $select: JQuery<HTMLSelectElement> = $(element);

    new Select($select);

    $select.on('changed.bs.select', (): void => {
        $select.change().blur();
    });
});

export { Select };
