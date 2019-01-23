/* tslint:disable:no-unused-new object-literal-key-quotes max-classes-per-file */
import * as $ from 'jquery';

import breakpoint from 'utils/breakpoint/breakpoint';
import * as viewXml from 'etc/view.json'
import deepGet from 'utils/deep-get/deep-get';

interface IGridLayoutSettings {
    /**
     * Defines selector of element containing source of data about image teasers.
     * This element should be placed inside the component instance.
     * This shall be hidden input with stringified JSON as value
     * @default {input.image-teasers-data}
     * @type {String}
     */
    dataSourceInputSelector: string;

     /**
     * Defines class component (wrapper)
     * @default {cs-grid-layout}
     * @type {String}
     */
    componentClass?: string;

    /**
     * Defines class of grid element (not wrapper)
     * @default {cs-grid-layout__grid}
     * @type {String}
     */
    gridClass?: string;

    /**
     * Defines class of single brick
     * @default {cs-grid-layout__brick}
     * @type {String}
     */
    brickClass?: string;

    /**
     * Tells if teasers shall be processed in browsers that do not support CSS Grid.
     * WARNING: it will be buggy, there's no way of using some scenarios in teasers and have them fully working on older browsers.
     * WARNING: support for browsers that don't support CSS Grid is DEPRECATED
     * @default {false}
     * @type {Boolean}
     */
    forceFloatingTeasersSupport?: Boolean;
}

/**
 * ItemCloner clones given item on mouseover and places is on top of hovered element in the same place
 * Clone resides on the bottom of the DOM tree and is positioned absolutely with height z-index ( defined in options )
 */
export default class GridLayout {
    private $wrapper: JQuery;
    private $grid: JQuery;
    private $productsGrid: JQuery;
    private $bricks: JQuery;
    private settings?: IGridLayoutSettings;
    private columnsCfg: any;
    private teasersCfg: any;
    public isCssGrid: boolean;
    public isProductsGrid: boolean;
    public productsGridRowsLimits: any;
    public virtualBricksLength: number;
    public teasers: any;
    public currentColsInRow: number;
    public currentRowsCount: number;

    /**
     * Creates and initiates new GridLayout component with given settings.
     * @param  {$wrapper} JQuery components' wrapper.
     * @param  {IGridLayoutSettings} settings Optional component settings.
     */
    public constructor($wrapper: JQuery, settings?: IGridLayoutSettings) {
        this.settings = $.extend(
            true,
            {},
            {
                dataSourceInputSelector: 'input.image-teasers-data',
                componentClass: 'cs-grid-layout',
                gridClass: 'cs-grid-layout__grid',
                brickClass: 'cs-grid-layout__brick',
                forceFloatingTeasersSupport: false,
            },
            settings
        );

        this.$wrapper = $wrapper || $(`.${this.settings.componentClass}`);
        this.$grid = this.$wrapper.find(`.${this.settings.gridClass}`);
        this.$bricks = this.$grid.children();
        this.teasers = [];
        this.isCssGrid = this._getIsCssGridSupported();
        this.$productsGrid = this.$wrapper.parent('.cs-products-grid');
        this.isProductsGrid = this.$productsGrid.length > 0;
        
        this.productsGridRowsLimits = this.isProductsGrid
            ? {
                  mobile: this.$productsGrid.data('rows-mobile'),
                  tablet: this.$productsGrid.data('rows-tablet'),
                  desktop: this.$productsGrid.data('rows-desktop'),
              }
            : {};

        this.columnsCfg = this._getColumnsConfiguration();
        this.teasersCfg = this._getTeasersData();

        if (this.columnsCfg && this.teasersCfg) {
            this.currentColsInRow = this.columnsCfg[
                this._getCurrentBreakpointName()
            ];
            this.virtualBricksLength = this._getVirtualBricksLength();
            this.currentRowsCount = Math.ceil(
                this.virtualBricksLength / this.currentColsInRow
            );

            this._initialize();
        }
    }

    /**
     * Resets outdated information and recalculates positions of all teasers again
     * Runs after breakpoint change and is available from outside to recalculate manually if needed
     */
    public recalculate(): void {
        this.currentColsInRow = this.columnsCfg[
            this._getCurrentBreakpointName()
        ];
        this.virtualBricksLength = this._getVirtualBricksLength();
        this.currentRowsCount = Math.ceil(
            this.virtualBricksLength / this.currentColsInRow
        );

        if (this.isCssGrid) {
            this._setTeasersCSS();
        } else if (this.settings.forceFloatingTeasersSupport) {
            this.$grid.append(this.teasers);
            this.teasers = [];
            this._setTeasersPositions();
        }
    }

    /**
     * Checks if display: grid is supported in browser (excluding old spec of IE) and if grid has display set to "grid"
     * @return {boolean}
     */
    protected _getIsCssGridSupported(): boolean {
        if (
            window.CSS &&
            window.CSS.supports &&
            typeof window.CSS.supports === 'function'
        ) {
            const currentCssDisplaySet: string = window
                .getComputedStyle(
                    document.querySelector(`.${this.settings.gridClass}`)
                )
                .getPropertyValue('display');

            return (
                CSS.supports('display', 'grid') &&
                CSS.supports('grid-auto-flow', 'row') &&
                currentCssDisplaySet === 'grid'
            );
        }

        return false;
    }

    /**
     * Gets project's columns configuration.
     * Includes sidebar adjustment in case sidebar is displayed on given breakpoint and if available at all
     * @return {any}
     */
    protected _getColumnsConfiguration(): any {
        const columnsCfg: any = deepGet(viewXml, 'vars.MageSuite_ContentConstructor.columns');
        const currentColumnsCfg: any = !this.$wrapper.hasClass(`${this.settings.componentClass}--with-sidebar`) ? columnsCfg['one-column'] : columnsCfg['multiple-columns'];

        return (typeof currentColumnsCfg !== 'undefined') ? currentColumnsCfg : columnsCfg.default_layout;
    }

    /**
     * Gets teasers data for given component.
     * @return {any}
     */
    protected _getTeasersData(): any {
        let result: any = '';
        const $dataEl: JQuery<HTMLElement> = this.$wrapper.find(this.settings.dataSourceInputSelector);

        if ($dataEl.length) {
            try {
                result = JSON.parse($dataEl.val() as string);
            } catch (err) {
                console.warn(`Could not parse teasers data from given element: ${err}`);
            };
        }

        return result;
    }

    /**
     * Gets current breakpoint name (key)
     * @return {string} key with breakpoint's name
     */
    protected _getCurrentBreakpointName(): any {
        return $.map(
            breakpoint,
            (val: number, key: string): string => {
                if (breakpoint.current === val && key !== 'current') {
                    return key;
                }
            }
        );
    }

    /**
     * Calculates "virtual" length of grid items
     * "virtual" means that teasers are included and their sizes are calculated too
     * f.e if teaser covers 2 tiles it counts as 2 brics, accordingly if it's 2x2 then it takes 4 bricks
     * @return {number} number of available bricks in grid
     */
    protected _getVirtualBricksLength(): number {
        let virtualLength: number = this.$grid.children().length;
        const teasers: any = this._getTeaserItems();

        if (this.currentColsInRow > 1) {
            virtualLength +=
                teasers.x2.length + (teasers.x4.length * 4 - teasers.x4.length);
        }

        if ($(window).width() >= breakpoint.tablet) {
            virtualLength += teasers.heros.length * 4 - teasers.heros.length;
        }

        return virtualLength;
    }

    /**
     * Returns all teasers and heros that are placed in the grid
     * @param {number} untilIndex - optional parameter to limit bricks if further filtering is not needed
     * @return {object} object with items sorted by type or size
     */
    protected _getTeaserItems(untilIndex?: number): any {
        let $bricks = this.$grid.children();
        let $x4items: any;
        let $x2items: any;

        if (untilIndex > 0) {
            $bricks = $bricks.filter(
                (idx: number): any => {
                    return idx < untilIndex;
                }
            );
        }

        $x4items = $bricks.filter(
            `.${this.settings.brickClass}--x2.${
                this.settings.brickClass
            }--y2:not(.${this.settings.brickClass}--hero)`
        );
        $x2items = $bricks
            .filter(
                `.${this.settings.brickClass}--x2:not(.${
                    this.settings.brickClass
                }--y2)`
            )
            .add(
                $bricks.filter(
                    `.${this.settings.brickClass}--y2:not(.${
                        this.settings.brickClass
                    }--x2)`
                )
            );

        return {
            x2: $x2items,
            x4: $x4items,
            heros: $(`.${this.settings.brickClass}--hero`),
        };
    }

    /**
     * Calculates position of given teaser item and gives us position where item should be placed
     * This method runs only if CSS Grid Layout is NOT(!) supported in user's browser
     * @param {object} teaserData - object containing required information about teaser: size and position where it should be added
     * @return {number} index of brick after which teaser should be placed (without adjustments)
     */
    protected _getTeaserIndex(teaserData: any): number {
        const windowWidth: number = $(window).width();
        let itemIndex: number =
            this.currentColsInRow * (teaserData.gridPosition.y - 1);
        let sizeX: number = teaserData.size.x;
        let sizeY: number = teaserData.size.y;

        if (this.currentColsInRow === 1 && sizeX > 1) {
            sizeX = 1;
        }

        if (this.currentColsInRow === 1 && sizeY > 1) {
            sizeY = 1;
        }

        if (teaserData.gridPosition.x === 'right' && teaserData.gridPosition.y > this.currentColsInRow) {
            itemIndex = itemIndex + (this.currentColsInRow - sizeX);
        } else if (teaserData.gridPosition.x === 'center' && sizeY < 2) {
            itemIndex = Math.floor(
                itemIndex + ((this.currentColsInRow / 2) - (sizeX / 2))
            );
        }

        const teasers: any = this._getTeaserItems(itemIndex);

        if (sizeX > 1 || sizeY) {
            itemIndex = itemIndex - teasers.x2.length;
        }

        if (windowWidth >= breakpoint.tablet) {
            itemIndex =
                itemIndex - teasers.x4.length * 3 - teasers.heros.length * 3;
        }

        return itemIndex;
    }

    /**
     * Makes sure that teaser will fit into grid.
     * Sometimes grid is affected (f.e. collection is filtered by aftersearch nav). This method checks if given teaser can be placed in the position it means to be in.
     * @param {object} teaserData - object containing required information about teaser: size and position where it should be added
     * @param {number} idx - index of teaser inside the grid along with all product tiles.
     * @return {boolean} true if there is a space for teaser in the grid
     */
    protected _getDoesTeaserFitIntoGrid(teaserData: any, idx: number): boolean {
        const sizeX: number = teaserData.size.x;
        const sizeY: number = teaserData.size.y;
        idx--;

        if (
            (this.currentRowsCount > 1 && this.currentRowsCount < sizeY) ||
            (this.currentColsInRow < 2 && sizeX > 1) || 
            this.$bricks.length < idx + sizeX * sizeY
        ) {
            return false;
        }

        return true;
    }

    /**
     * Converts given value from string or number to boolean
     * If argument passed is already a boolean, just returns it back
     */
    protected _getIsVisibleOnMobiles(value: any): boolean {
        if (typeof value === 'string') {
            return Boolean(parseInt(value));
        } else if (typeof value === 'number') {
            return Boolean(value);
        }

        return value;
    }

    /**
     * Loops through JSON of teasers and adjusts position returned by _getTeaserIndex method
     * This method runs only if CSS Grid Layout is NOT(!) supported in user's browser
     */
    protected _setTeasersPositions(): void {
        const windowWidth: number = $(window).width();

        for (let i: number = 0; i < this.teasersCfg.length; i++) {
            const $teaser: any = this.$grid.find(
                `.${this.settings.brickClass}[data-teaser-id="${
                    this.teasersCfg[i].id
                }"]`
            );
            let idx: number = this._getTeaserIndex(this.teasersCfg[i]);

            if ($teaser.length) {
                if (
                    (windowWidth < breakpoint.tablet &&
                        !this._getIsVisibleOnMobiles(
                            this.teasersCfg[i].mobile
                        )) ||
                    !this._getDoesTeaserFitIntoGrid(this.teasersCfg[i], idx)
                ) {
                    $teaser.addClass(`${this.settings.brickClass}--hidden`);
                    idx =
                        idx -
                        this.teasersCfg[i].size.x * this.teasersCfg[i].size.y;
                } else {
                    if (this.teasersCfg[i].gridPosition.x === 'right') {
                        $teaser.addClass(`${this.settings.brickClass}--right`);
                    }
                    this.teasers.push($teaser[0]);
                    this._insertTeaser($teaser, idx - 1);
                }
            } else {
                idx =
                    idx - this.teasersCfg[i].size.x * this.teasersCfg[i].size.y;
                console.warn(
                    `cs-grid-layout: Teaser was declared but not found in DOM (data-teaser-id: ${
                        this.teasersCfg[i].id
                    })`
                );
            }
        }
    }

    /**
     * Physically appends given teaser to given position
     * This method runs only if CSS Grid Layout is NOT(!) supported in user's browser
     * @param {object} $teaser - JQuery object to append
     * @param {number} gridIndex - indicates index of brick after which $teaser should be appended
     */
    protected _insertTeaser($teaser: any, gridIndex: number) {
        if (gridIndex < 1) {
            this.$grid.prepend($teaser);
        } else {
            $teaser.insertAfter(this.$grid.children().eq(gridIndex));
        }

        $teaser
            .removeClass(`${this.settings.brickClass}--hidden`)
            .addClass(`${this.settings.brickClass}--teaser-ready`);
    }

    /**
     * Calculates X and Y axis of given teaser and adjusts if it overflows current grid possibilities (rows, columns)
     * This method runs only if CSS Grid Layout IS supported in user's browser
     * @param {object} teaserData - object containing required information about teaser: size and position where it should be added
     * @return {object} X and Y axis in the grid
     */
    protected _getTeaserPositionInGrid(teaserData: any): any {
        let xPos: any = 1;
        let yPos: any = teaserData.gridPosition.y;

        if (yPos >= this.currentRowsCount && teaserData.size.y > 1) {
            yPos = this.currentRowsCount - 1;
        }

        if (teaserData.gridPosition.x === 'right') {
            xPos = this.currentColsInRow - teaserData.size.x + 1;
        } else if (teaserData.gridPosition.x === 'center') {
            xPos = (this.currentColsInRow % 2) === 1 ? Math.ceil(this.currentColsInRow / 2) : Math.floor(this.currentColsInRow / 2);
        }

        return {
            x: xPos,
            y: parseInt(yPos),
        };
    }

    /**
     * Loops through all teasers, adjusts calculated position and applies CSS grid styles to all teasers declared in JSON
     * This method runs only if CSS Grid Layout IS supported in user's browser
     */
    protected _setTeasersCSS(): void {
        this.teasers = [];
        const windowWidth = $(window).width();

        for (let i: number = 0; i < this.teasersCfg.length; i++) {
            const $teaser: any = this.$grid.find(
                `.${this.settings.brickClass}[data-teaser-id="${
                    this.teasersCfg[i].id
                }"]`
            );
            const teaser: any = $teaser[0];
            const idx: number = this._getTeaserIndex(this.teasersCfg[i]);

            if ($teaser.length) {
                if (
                    (windowWidth < breakpoint.tablet &&
                        !this._getIsVisibleOnMobiles(
                            Boolean(this.teasersCfg[i].mobile)
                        )) ||
                    !this._getDoesTeaserFitIntoGrid(this.teasersCfg[i], idx)
                ) {
                    $teaser.addClass(`${this.settings.brickClass}--hidden`);
                } else {
                    let pos: any = this._getTeaserPositionInGrid(
                        this.teasersCfg[i]
                    );

                    if (pos.x >= 1 && pos.y <= this.currentRowsCount) {
                        teaser.style.gridRowStart = pos.y;
                    }

                    if (pos.y <= this.currentRowsCount) {
                        if (pos.x >= 1 && pos.x <= this.currentColsInRow) {
                            teaser.style.gridColumnStart = pos.x;
                        } else if (pos.x > this.currentColsInRow) {
                            pos.x =
                                this.currentRowsCount -
                                this.teasersCfg[i].size.x +
                                1;
                        }
                    }

                    // check if teasers don't cover each other, if yes, put the last covering to the next free row
                    for (let n: number = 0; n < this.teasersCfg.length; n++) {
                        if (i > n) {
                            let teaserPos: any = this._getTeaserPositionInGrid(
                                this.teasersCfg[n]
                            );

                            if (teaserPos.y === pos.y && teaserPos.x === pos.x) {
                                pos.y = pos.y + parseInt(this.teasersCfg[n].size.y);
                                teaser.style.gridRowStart = pos.y;
                            }
                        }
                    }

                    $teaser
                        .removeClass(`${this.settings.brickClass}--hidden`)
                        .addClass(`${this.settings.brickClass}--teaser-ready`);
                }

                this.teasers.push(teaser);
            } else {
                console.warn(
                    `cs-grid-layout: Teaser was declared but not found in DOM (Teaser ID: ${
                        this.teasersCfg[i].id
                    })`
                );
            }
        }
    }

    /**
     * Checks support of CSS Grid Layout in browsers and Initializes the correct methods
     */
    protected _initialize(): void {
        if (this.isCssGrid) {
            this._setTeasersCSS();
        } else if (this.settings.forceFloatingTeasersSupport) {
            this._setTeasersPositions();
        }

        this._resizeHandler();
    }

    /**
     * Resize handler
     * Recalculation is triggered only if number of columns was changed
     */
    protected _resizeHandler(): void {
        let _this: any = this;
        let throttler: any;

        if (this.isProductsGrid) {
            this._setupProductsGrid();
        }

        $(window).on('resize', function(): void {
            clearTimeout(throttler);
            throttler = setTimeout((): void => {
                if (
                    _this.currentColsInRow !==
                    _this.columnsCfg[_this._getCurrentBreakpointName()]
                ) {
                    _this.currentColsInRow =
                        _this.columnsCfg[_this._getCurrentBreakpointName()];
                    if (_this.teasers.length) {
                        _this.recalculate();
                    }

                    if (_this.isProductsGrid) {
                        _this._setupProductsGrid();
                    }
                }
            }, 250);
        });
    }

    /**
     * If browser supports CSS Grid Layout, this method will add some CSS
     * to hide all rows below ${breakpoint}
     * @param  breakpoint {string} - 'mobile' / 'tablet' / 'desktop' to get info about rows limit set
     * @return JQuery's CSS prop object
     */
    protected _getProductsGridCSS(breakpoint: string): any {
        const maxRowsOccupied: number = Math.ceil(
            this.virtualBricksLength /
                this.columnsCfg[this._getCurrentBreakpointName()]
        );
        const rowsToSet: number =
            this.productsGridRowsLimits[breakpoint] >= maxRowsOccupied
                ? maxRowsOccupied
                : this.productsGridRowsLimits[breakpoint];

        return {
            'grid-template-rows': `repeat(${rowsToSet}, 1fr)`,
            'grid-auto-rows': '0',
            'overflow-y': 'hidden',
        };
    }

    /**
     * Rows limitation for Products Grid components starts here.
     * This method controls way of hidding rows based on matchMedia and CSS Grid support
     */
    protected _setupProductsGrid(): void {
        if (
            window.matchMedia(`(max-width: ${breakpoint.tablet - 1}px)`).matches
        ) {
            this._showProductsGrid('mobile');
        } else if (
            window.matchMedia(`(min-width: ${breakpoint.laptop}px)`).matches
        ) {
            this._showProductsGrid('desktop');
        } else {
            this._showProductsGrid('tablet');
        }

        this.$productsGrid.show();
    }

    /**
     * If browser DOES NOT support CSS Grid Layout, this method will calculate how many rows
     * should be SHOWN (for non-css-grid browsers PG items are initially hidden via CSS).
     * @param  breakpoint {string} - 'mobile' / 'tablet' / 'desktop' to get info about rows limit set
     */
    protected _showProductsGrid(breakpoint: string): void {
        let itemsToShow: number =
            this.currentColsInRow * this.productsGridRowsLimits[breakpoint];
        const teasers: any = this._getTeaserItems();
        let teaserSize: any = {
            x: this.currentRowsCount < 2 ? 1 : parseInt(this.teasersCfg[0].size.x, 10),
            y: parseInt(this.teasersCfg[0].size.y, 10),
        };

        // if teasers are hidden for mobile - adjust items to show by decreasing with teaser size
        if (
            breakpoint !== 'mobile' ||
            (breakpoint === 'mobile' &&
                this._getIsVisibleOnMobiles(this.teasersCfg[0].mobile))
        ) {
            itemsToShow -=
                teasers.x2.length + (teasers.x4.length * 4 - teasers.x4.length);
        } else {
            itemsToShow += teasers.x2.length + teasers.x4.length;
        }

        // if teaser height is higher than rows to show, decrease by teaser size minus X-bricks-taking size
        if (
            this.teasers.length &&
            this.productsGridRowsLimits[breakpoint] < teaserSize.y
        ) {
            itemsToShow += teaserSize.x * teaserSize.y - teaserSize.x;
        }

        if (itemsToShow < 1) {
            itemsToShow = 1;
        } else if (itemsToShow > this.$bricks.length) {
            itemsToShow = this.$bricks.length;
        }

        this.$grid.children().hide();
        this.$grid
            .children()
            .eq(itemsToShow - 1)
            .prevAll()
            .addBack()
            .show();
    }
}
