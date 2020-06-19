import * as $ from 'jquery';
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

export default class ie11Modal {
    protected _$element?: JQuery;
    protected $modalWrapper: JQuery;
    protected _options?: ie11ModalOptions = {
        modalClassname: 'cs-ie11-modal',
        texts: {
            headline: 'This internet browser is outdated',
            main: [
                'This store benefits from security and efficiency (or performance) of modern browsers.',
                'You are currently using Internet Explorer that is 7 years old and is outdated.',
                'Please consider installing and using newer browser to have bettter experience and access to all functions of this store.',
            ],
            recommendation: 'These are the browsers we recommend:',
        },
        modalTemplate: '',
        modalOptions: {
            type: 'popup',
            responsive: true,
            clickableOverlay: false,
            modalClass: 'cs-ie11-modal',
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
        this._$element = $element || $(`.${this._options.modalClassname}`);
        this._options = $.extend({}, this._options, options);
        this.$modalWrapper;

        const ua = navigator.userAgent;
        if (ua.indexOf('MSIE ') === -1 && ua.indexOf('Trident/') === -1) {
            return;
        } else {
            if (sessionStorage.getItem('magesuite-ie11-modal')) {
                return;
            }
        }

        this._createModal();
    }

    protected _getModalTemplate() {
        if (this._options.modalTemplate) {
            return this._options.modalTemplate;
        }

        let content = '';
        this._options.texts.main.forEach(el => {
            content += $.mage.__(el) + ' ';
        });

        return `
            <div class="${this._options.modalClassname}__inner">
                <div class="${this._options.modalClassname}__header">
                    <img class="${
                        this._options.modalClassname
                    }__header-icon" data-bind="attr: {src: require.toUrl('./images/browser/ie-grayscale.svg')}">
                    <span class="${this._options.modalClassname}__header-title">
                        ${$.mage.__(this._options.texts.headline)}
                    </span>
                </div>
                <div class="${this._options.modalClassname}__body">
                    <p class="${
                        this._options.modalClassname
                    }__paragraph">${content}</p>
                    <p class="${this._options.modalClassname}__paragraph ${
            this._options.modalClassname
        }__paragraph--title">
                        ${$.mage.__(this._options.texts.recommendation)}
                    </p>
                    <ul class="${this._options.modalClassname}__list">
                        <li class="${this._options.modalClassname}__list-item ${
            this._options.modalClassname
        }__list-item--chrome">
                            <img class="${
                                this._options.modalClassname
                            }__item-logo" data-bind="attr: {src: require.toUrl('./images/browser/chrome.svg')}">
                            <span class="${
                                this._options.modalClassname
                            }__item-name">Google Chrome</span>
                            <a href="https://www.google.com/chrome/" target="_blank" class="${
                                this._options.modalClassname
                            }__item-link">${$.mage.__('Download')}</a>
                        </li>
                        <li class="${this._options.modalClassname}__list-item ${
            this._options.modalClassname
        }__list-item--firefox">
                            <img class="${
                                this._options.modalClassname
                            }__item-logo" data-bind="attr: {src: require.toUrl('./images/browser/firefox.svg')}">
                            <span class="${
                                this._options.modalClassname
                            }__item-name">Firefox</span>
                            <a href="https://www.firefox.com/" target="_blank" class="${
                                this._options.modalClassname
                            }__item-link">${$.mage.__('Download')}</a>
                        </li>
                        <li class="${this._options.modalClassname}__list-item ${
            this._options.modalClassname
        }__list-item--opera">
                            <img class="${
                                this._options.modalClassname
                            }__item-logo" data-bind="attr: {src: require.toUrl('./images/browser/opera.svg')}">
                            <span class="${
                                this._options.modalClassname
                            }__item-name">Opera</span>
                            <a href="https://www.opera.com/" target="_blank" class="${
                                this._options.modalClassname
                            }__item-link">${$.mage.__('Download')}</a>
                        </li>
                        <li class="${this._options.modalClassname}__list-item ${
            this._options.modalClassname
        }__list-item--edge">
                            <img class="${
                                this._options.modalClassname
                            }__item-logo" data-bind="attr: {src: require.toUrl('./images/browser/edge.svg')}">
                            <span class="${
                                this._options.modalClassname
                            }__item-name">Edge</span>
                            <a href="https://www.microsoft.com/en-us/windows/microsoft-edge/" target="_blank" class="${
                                this._options.modalClassname
                            }__item-link">${$.mage.__('Download')}</a>
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

                this.$modalWrapper.modal('openModal');
                this.$modalWrapper.on('modalclosed', () => {
                    this._setStorageFlag();
                });
            }
        );
    }

    protected _setStorageFlag() {
        return sessionStorage.setItem('magesuite-ie11-modal', 'true');
    }

    protected _closeModal() {
        this.$modalWrapper.modal('closeModal');
    }
}
