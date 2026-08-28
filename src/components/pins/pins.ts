import viewXml from 'etc/view';
import deepGet from 'utils/deep-get/deep-get';

export interface IPinsConfig {
    cardBreakpoint?: string; // From this breakpoint up, pins can show cards.
    closeDelay?: number;
}

type Placement = 'top' | 'bottom' | 'left' | 'right';

export default class Pins {
    protected static readonly OPPOSITE_PLACEMENT: {
        [key in Placement]: Placement;
    } = {
        top: 'bottom',
        bottom: 'top',
        left: 'right',
        right: 'left',
    };

    // Dismissal is page-wide, so its listeners are bound once, not per overlay.
    protected static pageListenersBound: boolean = false;
    protected static openPin: HTMLElement | null = null;
    protected static closeTimer: number | undefined;

    protected element: HTMLElement;
    protected closeDelay: number;
    protected cardBreakpoint: number;
    protected cardsEnabled: boolean = true;
    protected navSelector: string = '.cs-slider-navigation';
    protected navScopeSelector: string = '.cs-image-teaser__slides-wrapper';

    public constructor(element: HTMLElement, config?: IPinsConfig) {
        if (element.classList.contains('cs-pins--initialized')) {
            return;
        }

        this.element = element;
        this.element.classList.add('cs-pins--initialized');

        this.cardBreakpoint = this.resolveCardBreakpoint(config);
        this.closeDelay = config?.closeDelay ?? 160;
        this.setCardsEnabled();
        this.attachEventListeners();

        this.init();
        Pins.bindPageListeners();
    }

    protected resolveCardBreakpoint(config?: IPinsConfig): number {
        const name =
            config?.cardBreakpoint ??
            deepGet(viewXml, 'vars.MageSuite_ContentConstructor.teaser.pins.card_breakpoint');

        return window.breakpoint[name];
    }

    protected attachEventListeners(): void {
        document.addEventListener('breakpointChange', () => this.onBreakpointChange());
    }

    protected setCardsEnabled(): void {
        this.cardsEnabled = window.breakpoint.current >= this.cardBreakpoint;
    }

    protected onBreakpointChange(): void {
        this.setCardsEnabled();

        if (!this.cardsEnabled && this.element.contains(Pins.openPin)) {
            Pins.closeCard(Pins.openPin);
        }

        this.setRichPinRoles();
    }

    protected init(): void {
        this.element
            .querySelectorAll<HTMLElement>('.cs-pins__pin')
            .forEach((pin: HTMLElement) => this.bindPin(pin));

        this.setRichPinRoles();
    }

    protected setRichPinRoles(): void {
        const pins = this.element.querySelectorAll<HTMLElement>('.cs-pins__pin--rich');

        pins.forEach((pin: HTMLElement) => {
            const trigger = pin.querySelector<HTMLElement>('.cs-pins__trigger');

            if (!trigger) {
                return;
            }

            if (trigger.dataset.cardLabel === undefined) {
                trigger.dataset.cardLabel = trigger.getAttribute('aria-label') || '';
            }

            if (this.cardsEnabled) {
                trigger.removeAttribute('role');
                trigger.setAttribute('aria-expanded', 'false');
                trigger.setAttribute('aria-label', trigger.dataset.cardLabel);

                return;
            }

            const card = pin.querySelector<HTMLElement>('.cs-pins__card');
            const linkLabel = card?.getAttribute('aria-label');

            trigger.setAttribute('role', 'link');
            trigger.removeAttribute('aria-expanded');

            if (linkLabel) {
                trigger.setAttribute('aria-label', linkLabel);
            }
        });
    }

    protected static bindPageListeners(): void {
        if (Pins.pageListenersBound) {
            return;
        }

        Pins.pageListenersBound = true;

        document.addEventListener('click', (event: Event) => {
            const target = event.target as HTMLElement;

            if (!target.closest('.cs-pins__pin')) {
                Pins.closeCard(Pins.openPin);
            }
        });

        window.addEventListener('resize', () => Pins.closeCard(Pins.openPin));

        document.addEventListener('keydown', (event: KeyboardEvent) => {
            if (event.key !== 'Escape') {
                return;
            }

            const open = Pins.openPin;

            Pins.closeCard(open);
            open?.querySelector<HTMLElement>('.cs-pins__trigger')?.focus();
        });
    }

    protected bindPin(pin: HTMLElement): void {
        const trigger = pin.querySelector<HTMLElement>('.cs-pins__trigger');

        if (!trigger) {
            return;
        }

        if (!pin.classList.contains('cs-pins__pin--rich')) {
            trigger.addEventListener('click', (event: Event) => {
                this.suppress(event);
                this.navigate(pin);
            });
            return;
        }

        const card = pin.querySelector<HTMLElement>('.cs-pins__card');

        if (pin.getAttribute('data-trigger') === 'hover') {
            pin.addEventListener('mouseenter', () => this.openCard(pin));
            pin.addEventListener('mouseleave', () => this.scheduleClose(pin));
            if (card) {
                card.addEventListener('mouseenter', () => Pins.cancelClose());
                card.addEventListener('mouseleave', () => this.scheduleClose(pin));
            }
        }

        trigger.addEventListener('click', (event: Event) => this.activateRichPin(pin, event));

        if (card) {
            card.addEventListener('click', (event: Event) => {
                this.suppress(event);
                this.navigate(pin);
            });
            card.addEventListener('keydown', (event: KeyboardEvent) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    this.suppress(event);
                    this.navigate(pin);
                }
            });
        }
    }

    protected activateRichPin(pin: HTMLElement, event: Event): void {
        if (this.cardsEnabled) {
            this.toggleCard(pin, event);
            return;
        }

        this.suppress(event);
        this.navigate(pin);
    }

    protected toggleCard(pin: HTMLElement, event: Event): void {
        this.suppress(event);

        if (pin.classList.contains('is-open')) {
            Pins.closeCard(pin);
            return;
        }

        this.openCard(pin);
    }

    protected openCard(pin: HTMLElement): void {
        if (!this.cardsEnabled) {
            return;
        }

        Pins.cancelClose();

        if (Pins.openPin !== pin) {
            Pins.closeCard(Pins.openPin);
        }

        this.loadCardImage(pin);
        this.positionCard(pin);
        pin.classList.add('is-open');
        Pins.openPin = pin;
        Pins.setExpanded(pin, true);
    }

    protected static closeCard(pin: HTMLElement | null): void {
        if (!pin) {
            return;
        }

        pin.classList.remove('is-open');
        Pins.setExpanded(pin, false);

        if (Pins.openPin === pin) {
            Pins.openPin = null;
        }
    }

    protected static setExpanded(pin: HTMLElement, expanded: boolean): void {
        const trigger = pin.querySelector<HTMLElement>('.cs-pins__trigger');

        if (trigger?.getAttribute('role') === 'link') {
            return;
        }

        trigger?.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    }

    protected scheduleClose(pin: HTMLElement): void {
        Pins.cancelClose();
        Pins.closeTimer = window.setTimeout(() => Pins.closeCard(pin), this.closeDelay);
    }

    protected static cancelClose(): void {
        window.clearTimeout(Pins.closeTimer);
        Pins.closeTimer = undefined;
    }

    /**
     * Tries sides in order: the editor's choice, its opposite, then the rest.
     * First side where the card fits the image and misses the slider arrows wins;
     * if none do, the editor's side is kept. The card is then nudged along the
     * other axis so a pin near a corner still fits.
     */
    protected positionCard(pin: HTMLElement): void {
        const card = pin.querySelector<HTMLElement>('.cs-pins__card');

        if (!card) {
            return;
        }

        // The overlay is the image box, not the figure, which can be taller.
        const boxRect: DOMRect = this.element.getBoundingClientRect();
        const obstacles: DOMRect[] = this.obstacleRects(pin);
        const preferred = pin.getAttribute('data-position') as Placement;

        // Centre it first: a stale shift would skew the measurement.
        card.style.setProperty('--cs-pins-card-shift', '0px');

        let placed: boolean = false;
        let shift: number = 0;
        const order: Placement[] = this.placementOrder(preferred);

        for (const side of order) {
            card.setAttribute('data-arrow', Pins.OPPOSITE_PLACEMENT[side]);

            const rect: DOMRect = card.getBoundingClientRect();

            if (!this.fitsInside(side, rect, boxRect)) {
                continue;
            }

            const candidateShift: number = this.overflowShift(side, rect, boxRect);

            if (this.hitsObstacle(side, rect, candidateShift, obstacles)) {
                continue;
            }

            placed = true;
            shift = candidateShift;
            break;
        }

        if (!placed) {
            // Nothing works: keep the editor's side.
            card.setAttribute('data-arrow', Pins.OPPOSITE_PLACEMENT[preferred]);
            shift = this.overflowShift(preferred, card.getBoundingClientRect(), boxRect);
        }

        card.style.setProperty('--cs-pins-card-shift', `${Math.round(shift)}px`);
    }

    // Navigation arrows sit above the overlay and take the click,
    // so cards keep clear of them. A faded-out arrow still counts.
    protected obstacleRects(pin: HTMLElement): DOMRect[] {
        const scope = pin.closest<HTMLElement>(this.navScopeSelector);

        if (!scope) {
            return [];
        }

        return Array.from(scope.querySelectorAll<HTMLElement>(this.navSelector))
            .map((nav: HTMLElement) => nav.getBoundingClientRect())
            .filter((rect: DOMRect) => rect.width > 0 && rect.height > 0);
    }

    protected hitsObstacle(
        side: Placement,
        cardRect: DOMRect,
        shift: number,
        obstacles: DOMRect[]
    ): boolean {
        const horizontal: boolean = side === 'top' || side === 'bottom';
        const left: number = cardRect.left + (horizontal ? shift : 0);
        const top: number = cardRect.top + (horizontal ? 0 : shift);
        const right: number = left + cardRect.width;
        const bottom: number = top + cardRect.height;

        return obstacles.some(
            (rect: DOMRect) =>
                left < rect.right && right > rect.left && top < rect.bottom && bottom > rect.top
        );
    }

    protected placementOrder(preferred: Placement): Placement[] {
        const opposite = Pins.OPPOSITE_PLACEMENT[preferred];

        return preferred === 'top' || preferred === 'bottom'
            ? [preferred, opposite, 'right', 'left']
            : [preferred, opposite, 'top', 'bottom'];
    }

    protected fitsInside(side: Placement, cardRect: DOMRect, boxRect: DOMRect): boolean {
        if (side === 'top') {
            return cardRect.top >= boxRect.top;
        }
        if (side === 'bottom') {
            return cardRect.bottom <= boxRect.bottom;
        }
        if (side === 'left') {
            return cardRect.left >= boxRect.left;
        }

        return cardRect.right <= boxRect.right;
    }

    protected overflowShift(side: Placement, cardRect: DOMRect, boxRect: DOMRect): number {
        const horizontal: boolean = side === 'top' || side === 'bottom';
        const start: number = horizontal ? cardRect.left : cardRect.top;
        const end: number = horizontal ? cardRect.right : cardRect.bottom;
        const boxStart: number = horizontal ? boxRect.left : boxRect.top;
        const boxEnd: number = horizontal ? boxRect.right : boxRect.bottom;

        if (start < boxStart) {
            return boxStart - start;
        }

        if (end > boxEnd) {
            return boxEnd - end;
        }

        return 0;
    }

    protected navigate(pin: HTMLElement): void {
        const href: string | null = pin.getAttribute('data-href');

        if (!href) {
            return;
        }

        if (pin.getAttribute('data-target') === '_blank') {
            window.open(href, '_blank', 'noopener');
            return;
        }

        window.location.href = href;
    }

    // The cards sit in the viewport from the start, so it
    // would fetch every card image on page load instead
    // of on first open if lazyLoad or loading native were used.
    protected loadCardImage(pin: HTMLElement): void {
        const image = pin.querySelector<HTMLImageElement>('.cs-pins__card-image');

        if (!image || image.getAttribute('src')) {
            return;
        }

        const source: string | null = image.getAttribute('data-src');

        if (!source) {
            return;
        }

        image.addEventListener(
            'load',
            () => {
                image.classList.add('is-loaded');
                const media = image.closest<HTMLElement>('.cs-pins__card-media');
                if (media) {
                    media.classList.add('is-loaded');
                }
            },
            { once: true }
        );

        image.src = source;
    }

    protected suppress(event: Event): void {
        event.stopPropagation();
        event.preventDefault();
    }
}
