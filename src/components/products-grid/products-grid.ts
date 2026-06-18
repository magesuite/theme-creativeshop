export type ProductsGridOptions = {
    itemSelector: string;
    minItemHeight: number;
};

export class ProductsGrid {
    protected element: HTMLElement;
    protected options: ProductsGridOptions = {
        itemSelector: '.cs-products-grid__item',
        minItemHeight: 200,
    };

    protected eventListeners = {
        breakpointChange: this.onBreakpointChange.bind(this),
    };

    constructor(element: HTMLElement, config: Partial<ProductsGridOptions> = {}) {
        this.element = element;
        if (!this.element) {
            console.error('ProductsGrid: Element not found');
            return;
        }

        this.options = {
            ...this.options,
            ...config,
        };

        this.handleItemsVisibility();
        this.attachEventListeners();
    }

    protected attachEventListeners() {
        document.addEventListener('breakpointChange', this.eventListeners.breakpointChange);
    }

    public destroy() {
        document.removeEventListener('breakpointChange', this.eventListeners.breakpointChange);
        this.element = null;
    }

    protected onBreakpointChange() {
        this.handleItemsVisibility();
    }

    protected handleItemsVisibility() {
        this.element.querySelectorAll<HTMLElement>(this.options.itemSelector).forEach((item) => {
            if (item.offsetHeight < this.options.minItemHeight) {
                item.setAttribute('aria-hidden', 'true');
                item.setAttribute('inert', '');
            } else {
                item.removeAttribute('aria-hidden');
                item.removeAttribute('inert');
            }
        });
    }
}
