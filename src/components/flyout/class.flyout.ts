/* tslint:disable:no-unused-new object-literal-key-quotes max-classes-per-file */
import $ from 'jquery';

interface IFlyout {
  toggleState(): void;
  destroy(): void;
}

interface IFlyoutSettings {
  name: string;
  /**
   * Define type: flyout, dropdown or collapse
   * @type {String}
   */
  type: string;
  /**
   * Define transition time in ms
   * @type {Number}
   */
  transitionTime?: number;
  /**
   * Define if content is other than <name>__content
   * @type {Jquery}
   */
  content?: JQuery;
  /**
   * Define if trigger is other than click
   * @type {String}
   */
  trigger?: string;
  /**
   * Define if flyout/collapse should be shown from the beginning
   * @type {Boolean}
   */
  initiallyShown?: boolean;
  /**
   * Collapse content can have min visible height but default is 0
   * @type {String}
   */
  minHeight?: string;
  /**
   * On show callback - when show transition starts
   * @type {any}
   */
  onShow?: any;
  /**
   * On show callback - when show transition ends
   * @type {any}
   */
  onShowCompleted?: any;
  /**
   * On show callback - when hide transition starts
   * @type {any}
   */
  onHide?: any;
  /**
   * On show callback - when hide transition ens
   * @type {any}
   */
  onHideCompleted?: any;
}

/**
 * Interface for object storing Flyout event listeners.
 * Storing those references allow us to remove them when destructing the object.
 */
interface IFlyoutEventListeners {
  resize?: any;
  toggleState?: any;
}

/**
 * Flyout component is component which can fire show method (usually after clicking on its trigger).
 * Then contentTransitioningClass is added to its content and show event is triggered.
 * After transition time contentInClass class is added to content and shown event is triggered
 * On hide  transitioning class is added and in class is removed. After transition time transitioning class is removed.
 */
class Flyout implements IFlyout {
  private name: string;
  private _shown: boolean = false;
  private settings: IFlyoutSettings;
  private contentOutClass: string;
  private contentInClass: string;
  private contentTransitioningClass: string;
  private triggerInClass: string;
  private _isTransitioning: boolean = false;
  private $element: JQuery;
  private $triggers: JQuery;
  private eventListeners: IFlyoutEventListeners = {};
  private $content: JQuery;
  private $close: JQuery;

  /**
   * Creates and initiates new Flyout component with settings.
   * * @param  {JQuery} $element Optional component settings.
   * @param  {IFlyoutSettings} settings Optional component settings.
   */
  public constructor($element: JQuery, settings: IFlyoutSettings) {
    // Extend component's defaults with given optional settings.

    this.settings = $.extend(
      {
        transitionTime: 350,
        trigger: 'click',
        shown: false,
        minHeight: 0,
        onShow: null,
        onShowCompleted: null,
        onHide: null,
        onHideCompleted: null,
        initiallyShown: false,
      },
      settings
    );

    this.name = settings.name;
    // Element is main wrapper for flyout/collapse
    this.$element = $element;
    this.$content = settings.content
      ? settings.content
      : $element.find(`.${this.name}__content`).first();
    this.$triggers = this.$element.find(`.${this.name}__trigger`);
    // Optional close for hide method
    this.$close = this.$element.find(`.${this.name}__close`).first();

    // Define all needed classes
    this.contentOutClass = `${this.name}__content--out`;
    this.contentInClass = `${this.name}__content--in`;
    this.contentTransitioningClass = `${this.name}__content--transitioning`;
    this.triggerInClass = `${this.name}__trigger--in`;

    // Attach all of the event listeners.
    this.attachEventListeners();

    // Store Component inside data of element
    this.$element.data(`${this.name}-instance`, this);

    // Show initial in
    if (
      this.settings.initiallyShown === true ||
      $element.find(`.${settings.name}__content--initial-in`).length
    ) {
      this.show();
      this.$content.removeClass(`${this.name}__content--initial-in`);
    }
  }

  /**
   * Destroys component, removes all event listeners.
   */
  public destroy(): void {
    // Assign reference to allow better minification.
    const eventListeners: IFlyoutEventListeners = this.eventListeners;
    // Remove events
    this.$triggers.off('click', eventListeners.toggleState);
    this.$close.off('click', eventListeners.toggleState);
    $(document).off('debouncedresize', eventListeners.resize);
  }

  /**
   * Toggles flyout state between shown and hidden.
   */
  public toggleState(): void {
    if (this._shown === false) {
      this.show();
    } else {
      this.hide();
    }
  }

  /**
   * Perform show action if element is not transitioning at the moment.
   * Remove class out for content and add class in. Add aria-expanded true for trigger
   * Set transitioning flag to true.
   * If is collapse type calculate height
   * Trigger event show
   * Trigger method showComplete after transition time
   */
  protected show(): void {
    if (
      this._isTransitioning ||
      this.$content.hasClass(this.contentInClass) ||
      this._shown === true
    ) {
      return;
    }

    this.$content.css('max-height', '');
    this.$content.removeClass(this.contentOutClass);
    this.$content.addClass(this.contentInClass);
    this.$triggers.addClass(this.triggerInClass);
    this.$triggers.prop('aria-expanded', true);
    this._isTransitioning = true;

    if (this.settings.type === 'collapse') {
      // Let scrollHeight: number = this.$content[0].scrollHeight;
      // Animation can be added here
    }

    // Trigger show event and callback
    this.$element.trigger(`${this.name}.show`);

    if (this.settings.onShow) {
      this.settings.onShow();
    }

    setTimeout(() => this.showComplete(), this.settings.transitionTime);

    // Add overlay if it is flyout
    if (this.settings.type === 'flyout') {
      // TO DO
    }
  }

  /**
   * Trigger shown event
   * Set transitioning flag to false. Set shown flag to true
   */
  protected showComplete(): void {
    this._isTransitioning = false;

    // Trigger show completed event and callback
    this.$element.trigger(`${this.name}.shown`);

    if (this.settings.onShowCompleted) {
      this.settings.onShowCompleted();
    }

    this._shown = true;
  }

  /**
   * Perform hide action if element is not transitioning at the moment.
   * Remove class in for content and trigger. Add class transitioning for content. Add aria-expanded false for trigger
   * Set transitioning flag to true.
   * If is collapse type calculate height
   * Trigger event hide
   * Trigger method hideComplete after transition time
   */
  protected hide(): void {
    if (
      this._isTransitioning ||
      this.$content.hasClass(this.contentTransitioningClass) ||
      this._shown === false
    ) {
      return;
    }

    this.$content.addClass(this.contentTransitioningClass);
    this.$content.removeClass(this.contentInClass);
    this.$triggers.removeClass(this.triggerInClass);

    this.$triggers.prop('aria-expanded', false);
    this._isTransitioning = true;

    if (this.settings.type === 'collapse') {
      // Let scrollHeight: number = this.$content.innerHeight();
      // Animation can be added here
    }

    // Trigger hide event and callback
    this.$element.trigger(`${this.name}.hide`);
    if (this.settings.onHide) {
      this.settings.onHide();
    }

    setTimeout(() => this.hideComplete(), this.settings.transitionTime);

    // Remove overlay if it is flyout
    if (this.name === 'flyout') {
      // TO DO
    }
  }

  /**
   * Trigger hidden event
   * Set transitioning flag to false. Set shown flag to false
   */
  protected hideComplete(): void {
    this.$content
      .removeClass(`${this.contentTransitioningClass}`)
      .addClass(this.contentOutClass);
    this._isTransitioning = false;
    this._shown = false;

    // Trigger hide completed event and callback
    this.$element.trigger(`${this.name}.hidden`);
    if (this.settings.onHideCompleted) {
      this.settings.onHideCompleted();
    }
    if (this.settings.type === 'collapse') {
      this.$content.css({ height: '', 'max-height': this.settings.minHeight });
    }
  }

  /**
   * Update width of flyout
   */
  protected closeOnClickOutside(event: Event): void {
    if (this._shown === false || this.settings.type === 'collapse') {
      return;
    }

    if (
      !$(event.target).is(this.$element) &&
      !this.$element.find($(event.target)).length
    ) {
      this.toggleState();
    }
  }

  /**
   * Attaches all needed event listeners for show / hide behaviour.
   */
  protected attachEventListeners(): void {
    // Assign reference to allow better minification.
    const eventListeners: IFlyoutEventListeners = this.eventListeners;

    // Click on trigger to toggle component state
    eventListeners.toggleState = this.toggleState.bind(this);
    this.$triggers.on('click', eventListeners.toggleState);
    this.$close.on('click', eventListeners.toggleState);
    $(document).on('click', this.closeOnClickOutside.bind(this));
  }
}

/**
 * Initializes all flyouts on the page.
 */
class FlyoutCollection {
  public constructor(settings: IFlyoutSettings) {
    $(`.${settings.name}`).each((index: number, element: any) => {
      new Flyout($(element), settings);
    });
  }
}

export { Flyout };
export { IFlyout };
export { IFlyoutSettings };
