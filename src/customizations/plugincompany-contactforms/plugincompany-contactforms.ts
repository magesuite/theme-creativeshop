import * as $ from 'jquery';
import 'mage/translate';

const $pccf: JQuery = $('.pccf');
const $pccfItem: JQuery = $('.pccf .form-group');

function inputStatus(inputType: string): void {
    if (inputType !== 'radio') {
        const $element: JQuery = $pccfItem.find('input[type="checkbox"]');
    } else {
        const $element: JQuery = $pccfItem.find('input[type="radio"]');
    }

    $element.each(function(): void {
        if ($(this).prop('checked') === true) {
            $(this)
                .parent()
                .addClass('checked');
        }
    });
}

function createNewsletterCheckboxLabel(): void {
    const $element: JQuery = $pccfItem.find(
        '.newsletter-checkbox input[type="checkbox"]'
    );

    $element.each(function(): void {
        const inputId: string = $(this).attr('id');
        const helpParagraph: JQuery = $(this).next('p');
        const helpText: string = $(this)
            .next('p')
            .text();
        let defaultLabelText: string = `${$.mage.__(
            'Subscribe to our newsletter'
        )}`;

        if (helpText !== '') {
            defaultLabelText = helpText;
        }
        $(this).after(`<label for="${inputId}">${defaultLabelText}</label>`);
        helpParagraph.addClass('not-visible');
    });
}

function inputToggler(inputType: string): void {
    if (inputType !== 'radio') {
        const $element: JQuery = $pccfItem.find('input[type="checkbox"]');
    } else {
        const $element: JQuery = $pccfItem.find('input[type="radio"]');
    }

    $element.on('change', function(): void {
        if (inputType === 'radio') {
            const inputName: string = $(this).attr('name');
        }
        if ($(this).prop('checked') === true) {
            if (inputType === 'radio') {
                $(`input[name="${inputName}"]`)
                    .parent('label')
                    .removeClass('checked');
            }
            $(this)
                .parent()
                .addClass('checked');
        } else {
            if (inputType !== 'radio') {
                $(this)
                    .parent()
                    .removeClass('checked');
            }
        }
    });
}

function toggleCheckboxes(): void {
    inputToggler('checkbox');
}

function toggleRadios(): void {
    inputToggler('radio');
}

function checkOnInit(): void {
    inputStatus('checkbox');
    inputStatus('radio');
}

function initPccf(): void {
    checkOnInit();
    toggleCheckboxes();
    toggleRadios();
    createNewsletterCheckboxLabel();
}

if ($pccf.length) {
    initPccf();
}
