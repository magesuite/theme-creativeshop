interface IOverlay {
    show(): void;
    hide(): void;
    isVisible(): boolean;
}

interface IOverlaySettings {
    $element: JQuery;
    visibleClass: string;
    onShow?(): void;
    onHide?(): void;
}

class Overlay implements IOverlay {
    private _visible: boolean = false;
    private $element: JQuery;
    private visibleClass: string;

    private onShow: any = null;
    private onHide: any = null;

    constructor(settings: IOverlaySettings) {
        this.$element = settings.$element;
        this.visibleClass = settings.visibleClass;

        this.onShow = settings.onShow;
        this.onHide = settings.onHide;

    }

    public hide(): void {
        this.$element.removeClass(this.visibleClass);
        this._visible = false;
        this.$element.trigger('overlay:hidden');

        if (this.onHide) {
            this.onHide();
        }
    }

    public show(): void {
        this.$element.addClass(this.visibleClass);
        this._visible = true;
        this.$element.trigger('overlay:shown');

        if (this.onShow) {
            this.onShow();
        }

    }

    public isVisible(): boolean {
        return this._visible;
    }

}

export {Overlay};
export {IOverlay};
export {IOverlaySettings};
