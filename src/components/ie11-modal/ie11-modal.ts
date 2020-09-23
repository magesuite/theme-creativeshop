import * as $ from 'jquery';
import viewXml from 'etc/view';
import deepGet from 'utils/deep-get/deep-get';
import requireAsync from 'utils/require-async';
import 'mage/translate';

export interface ie11ModalOptions {
    /**
     * Component's classname
     * @default: 'cs-ie11-modal'
     */
    modalClassname?: string;
    /**
     * HTML markup for the modal
     */
    modalTemplate?: string;
    /**
     * Modal options
     */
    modalOptions?: object;
    /**
     * Modal text content - can be customized per project
     */
    texts?: object;
}

/**
 * ie11Modal component options interface.
 */
interface XmlSettings {
    enabled: boolean;
}

export default class ie11Modal {
    protected _isEnabled: XmlSettings;
    protected _$element?: JQuery;
    protected $modalWrapper: JQuery;
    protected _options?: ie11ModalOptions = {
        modalClassname: 'cs-ie11-modal',
        texts: {
            headline: $.mage.__('Your internet browser is outdated'),
            main: $.mage.__(
                'This store benefits from the security and performance of modern browsers. You are currently using Internet Explorer that is 7 years old and outdated. Please consider installing a newer browser to have a better experience and access to all functions of this store.'
            ),
            recommendation: $.mage.__('These are the browsers we recommend:'),
            download: $.mage.__('Download'),
        },
        modalTemplate: '',
        modalOptions: {
            type: 'popup',
            responsive: true,
            clickableOverlay: false,
            modalClass: 'cs-ie11-modal',
            autoOpen: true,
            buttons: [
                {
                    text: $.mage.__('I understand'),
                    class: 'cs-ie11-modal__button',
                    click: () => {
                        this._closeModal();
                    },
                },
            ],
        },
    };

    public constructor(
        $element?: JQuery<HTMLElement>,
        options?: ie11ModalOptions
    ) {
        this._isEnabled = deepGet(
            viewXml,
            'vars.Magento_Theme.ie11_modal.enabled'
        );

        if (!this._isEnabled || !this._isIe11()) {
            return;
        }

        this._$element = $element || $(`.${this._options.modalClassname}`);
        this._options = $.extend({}, this._options, options);
        this.$modalWrapper;

        this._createModal();
    }

    protected _getModalTemplate() {
        if (this._options.modalTemplate) {
            return this._options.modalTemplate;
        }

        return `
            <div class="${this._options.modalClassname}__inner">
                <div class="${this._options.modalClassname}__header">
                    <img class="${this._options.modalClassname}__header-icon" data-bind="attr: {src: require.toUrl('./images/browser/ie-grayscale.svg')}">
                    <span class="${this._options.modalClassname}__header-title">
                        ${this._options.texts.headline}
                    </span>
                </div>
                <div class="${this._options.modalClassname}__body">
                    <p class="${this._options.modalClassname}__paragraph">${this._options.texts.main}</p>
                    <p class="${this._options.modalClassname}__paragraph ${this._options.modalClassname}__paragraph--title">
                        ${this._options.texts.recommendation}
                    </p>
                    <ul class="${this._options.modalClassname}__list">
                        <li class="${this._options.modalClassname}__list-item ${this._options.modalClassname}__list-item--chrome">
                            <img class="${this._options.modalClassname}__item-logo" data-bind="attr: {src: require.toUrl('./images/browser/chrome.svg')}">
                            <span class="${this._options.modalClassname}__item-name">Google Chrome</span>
                            <a href="https://www.google.com/chrome/" target="_blank" class="${this._options.modalClassname}__item-link">${this._options.texts.download}</a>
                        </li>
                        <li class="${this._options.modalClassname}__list-item ${this._options.modalClassname}__list-item--firefox">
                            <img class="${this._options.modalClassname}__item-logo" data-bind="attr: {src: require.toUrl('./images/browser/firefox.svg')}">
                            <span class="${this._options.modalClassname}__item-name">Firefox</span>
                            <a href="https://www.firefox.com/" target="_blank" class="${this._options.modalClassname}__item-link">${this._options.texts.download}</a>
                        </li>
                        <li class="${this._options.modalClassname}__list-item ${this._options.modalClassname}__list-item--opera">
                            <img class="${this._options.modalClassname}__item-logo" data-bind="attr: {src: require.toUrl('./images/browser/opera.svg')}">
                            <span class="${this._options.modalClassname}__item-name">Opera</span>
                            <a href="https://www.opera.com/" target="_blank" class="${this._options.modalClassname}__item-link">${this._options.texts.download}</a>
                        </li>
                        <li class="${this._options.modalClassname}__list-item ${this._options.modalClassname}__list-item--edge">
                            <img class="${this._options.modalClassname}__item-logo" data-bind="attr: {src: require.toUrl('./images/browser/edge.svg')}">
                            <span class="${this._options.modalClassname}__item-name">Edge</span>
                            <a href="https://www.microsoft.com/en-us/windows/microsoft-edge/" target="_blank" class="${this._options.modalClassname}__item-link">${this._options.texts.download}</a>
                        </li>
                    </ul>
                </div>
            </div>
        `;
    }

    protected _createModal() {
        const modalTemplate = this._options.modalTemplate;
        $('body').prepend(this._getModalTemplate());

        this._showModal();
    }

    protected _showModal() {
        requireAsync(['jquery', 'Magento_Ui/js/modal/modal']).then(
            ([$, modal]) => {
                this.$modalWrapper = $(
                    `.${this._options.modalClassname}__inner`
                );
                const popup = modal(
                    this._options.modalOptions,
                    this.$modalWrapper
                );

                this.$modalWrapper.on('modalclosed', () => {
                    this._setStorageFlag();
                });
            }
        );
    }

    protected _isIe11() {
        const ua = navigator.userAgent;

        if (ua.indexOf('MSIE ') === -1 && ua.indexOf('Trident/') === -1) {
            return false;
        } else {
            if (sessionStorage.getItem('magesuite-ie11-modal')) {
                return false;
            }
        }

        return true;
    }

    protected _setStorageFlag() {
        return sessionStorage.setItem('magesuite-ie11-modal', 'true');
    }

    protected _closeModal() {
        this.$modalWrapper.modal('closeModal');
    }
}
