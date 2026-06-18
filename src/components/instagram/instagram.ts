import * as $ from 'jquery';
import 'mage/translate';
import consentManagement from 'components/consent-management';

declare global {
    interface JQueryStatic {
        mage: {
            __: (phrase: string) => string;
        };
    }
}

export interface InstagramOptions {
    teaserConsentWrapperClass: string;
    teaserConsentLinkClass: string;
    teaserSlidesWrapperClass: string;
    teaserConsentDisplayedClass: string;
    dataAttributes: {
        consentSrc: string;
        consentSrcset: string;
    };
    intersectionObserverOptions: IntersectionObserverInit;
    consentInfo?: {
        additionalClasses: string;
        text: string;
    };
}

export default class Instagram {
    protected _$element: JQuery<HTMLElement>;
    protected _options: InstagramOptions = {
        teaserConsentWrapperClass: 'cs-image-teaser__consent-wrapper',
        teaserConsentLinkClass: 'cs-image-teaser__consent-link',
        teaserSlidesWrapperClass: 'cs-image-teaser__slides-wrapper',
        teaserConsentDisplayedClass: 'cs-image-teaser--consent-required',
        dataAttributes: {
            consentSrc: 'data-consent-src',
            consentSrcset: 'data-consent-srcset',
        },
        intersectionObserverOptions: {
            threshold: 0.1,
        },
        consentInfo: {
            additionalClasses: 'cs-consent-management--instagram',
            text: $.mage.__(
                'To view this content please enable Instagram Content in <button class="cs-consent-management__button">Privacy Settings</button>'
            ),
        },
    };
    protected _observer?: IntersectionObserver;

    public constructor(element: JQuery, options?: Partial<InstagramOptions>) {
        this._$element = element;
        this._options = $.extend(true, this._options, options);

        consentManagement.initializeEvent(this.setObserver.bind(this));
        consentManagement.changeEvent(this.setObserver.bind(this));
    }

    public setObserver(): void {
        this._observer?.disconnect();

        const el: HTMLElement = this._$element[0];
        if (!el) return;

        if (this.isInViewPort(el)) {
            this.loadInstagram();
            return;
        }

        this._observer = new IntersectionObserver((entries) => {
            if (entries.some((e) => e.isIntersecting)) {
                this.loadInstagram();
                this._observer?.disconnect();
            }
        }, this._options.intersectionObserverOptions);

        this._observer.observe(el);
    }

    public isInViewPort(element: HTMLElement): boolean {
        const rect: DOMRect = element.getBoundingClientRect();

        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.left <= (window.innerWidth || document.documentElement.clientWidth) &&
            rect.bottom >= 0 &&
            rect.right >= 0
        );
    }

    public async loadInstagram(): Promise<void> {
        try {
            const consentGranted: boolean = await consentManagement.checkConsent('instagram');

            this._$element.toggleClass(this._options.teaserConsentDisplayedClass, !consentGranted);

            if (consentGranted) {
                this.loadImages();
                this.hideConsentInfo();
            } else {
                this.showConsentInfo();
            }
        } catch (error) {
            console.error('Error loading Instagram content: ', error);
        }
    }

    public loadImages(): void {
        const { consentSrc, consentSrcset } = this._options.dataAttributes;

        this._$element.find(`[${consentSrc}], [${consentSrcset}]`).each((_, el) => {
            const src = el.getAttribute(consentSrc);
            const srcset = el.getAttribute(consentSrcset);

            if (src) el.setAttribute('src', src);
            if (srcset) el.setAttribute('srcset', srcset);
        });
    }

    public async showConsentInfo() {
        await consentManagement.mountConsentLayer(this._$element[0], {
            classModifier: this._options.consentInfo.additionalClasses,
            text: this._options.consentInfo.text,
        });

        consentManagement.toggleConsentLayerVisibility(this._$element[0], true);

        this._$element
            .find(`.${this._options.teaserSlidesWrapperClass}`)
            .attr('aria-hidden', 'true');
    }

    public hideConsentInfo(): void {
        consentManagement.toggleConsentLayerVisibility(this._$element[0], false);

        this._$element.find(`.${this._options.teaserSlidesWrapperClass}`).removeAttr('aria-hidden');
    }
}
