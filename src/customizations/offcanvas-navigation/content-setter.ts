import $ from 'jquery';
import $translate from 'mage/translate';
import OffcanvasNavigation from '../../../node_modules/creative-patterns/packages/components/offcanvas-navigation/src/offcanvas-navigation';

export interface NavigationTree {
    name: string;
    url: string;
    subcategories: NavigationTree[];
};

const navClassName: string = 'cs-navigation';
const offNavClassName: string = 'cs-offcanvas-navigation';
const infoStripeClassName: string = 'cs-information-stripe';

/**
 * Builds subtree structure from existing desktop navigation.
 * @param  {JQuery}         $link Root link for tree.
 * @return {NavigationTree}       Navigation tree originating in root link.
 */
export function buildSubtree( $link: JQuery ): NavigationTree {
    const $subcategories: JQuery = $link.next();
    const $sublinks: JQuery = $subcategories.find( `.${navClassName}__link` );
    const subcategories: NavigationTree[] = $.map( $sublinks, ( sublink: HTMLElement ) => {
        return buildSubtree( $( sublink ) );
    } );
    const subtree: NavigationTree = {
        name: $link.text().trim(),
        url: $link.attr( 'href' ),
        subcategories: subcategories,
    };

    return subtree;
}

/**
 * Build navigation tree structure from exisiting desktop navigation.
 * @param  {JQuery}           $links Main links of desktop navigation.
 * @return {NavigationTree[]}        Complete navigation tree
 */
export function buildTree( $links: JQuery ): NavigationTree[] {
    const navigationTree: NavigationTree[] = [];
    $links.each( ( index: number, link: HTMLElement ) => {
        navigationTree.push(buildSubtree( $( link ) ) );
    } );
    return navigationTree;
}

/**
 * Renders navigation tree.
 * @param  {NavigationTree[]} navigationTree Navigation tree data.
 * @param  {NavigationTree}   parent         Parent category.
 * @return {string}                          Rendered HTML.
 */
export function renderTree( navigationTree: NavigationTree[], parent?: NavigationTree ): string {
    let subtreeHTML: string = parent ? `<ul class="${offNavClassName}__list">` : '';
    navigationTree.forEach((category: NavigationTree, index: number) => {
        if ( parent && index === 0 ) {
            subtreeHTML += `<li class="${offNavClassName}__item">
                <a class="${offNavClassName}__link ${offNavClassName}__link--return" href="${parent.url}">
                    <svg class="${offNavClassName}__icon">
                        <use xlink:href="#arrow_prev"></use>
                    </svg>
                    <span class="${offNavClassName}__text">
                        ${parent.name}
                    </span>
                </a>
            </li>
            <li class="cs-offcanvas-navigation__item">
                <a class="cs-offcanvas-navigation__link" href="${parent.url}">${$translate('All products')}</a>
            </li>`;
        }

        subtreeHTML += `<li class="${offNavClassName}__item">`;
        if (category.subcategories.length) {
            subtreeHTML += `<a class="${offNavClassName}__link ${offNavClassName}__link--parent" href="${category.url}">
                <span class="${offNavClassName}__text">
                    ${category.name}
                </span>
                <svg class="${offNavClassName}__icon">
                    <use xlink:href="#arrow_next"></use>
                </svg>
            </a>
                ${renderTree(category.subcategories, category)}`;
        } else {
            subtreeHTML += `<a class="${offNavClassName}__link" href="${category.url}">
                <span class="${offNavClassName}__text">
                    ${category.name}
                </span>
            </a>`;
        }
        subtreeHTML += '</li>';
    });
    subtreeHTML += parent ? '</ul>' : '';

    return subtreeHTML;
}

export function renderUserAction(): string {
    const $accountLink: JQuery = $( `.${infoStripeClassName}__account-link` );
    const accountLinkHref: string = $accountLink.attr( 'href' );
    const accountLinkText: string = $accountLink.text();
    const accountActionType: string = accountLinkText.indexOf( 'out' ) === -1 ? 'in' : 'out';

    return `<li class="${offNavClassName}__item">
        <a class="${offNavClassName}__link ${offNavClassName}__link--sign-${accountActionType}" href="${accountLinkHref }">
            <span class="${offNavClassName}__text">
                ${accountLinkText}
            </span>
            <svg class="${offNavClassName}__icon">
                <use xlink:href="#sign-${accountActionType}"></use>
            </svg>
        </a>
    </li>`;
}

/**
 * Sets offcanvas navigation content.
 */
export const contentSetter: Function = ( offcanvasNavigation: OffcanvasNavigation ): void => {
    const $navigation: JQuery = $( `.${navClassName}` );
    const $links: JQuery = $navigation.find( `.${navClassName}__link` ).not( `.${navClassName}__link--category, .${navClassName}__link--subcategory` );
    const $offNavList: JQuery = offcanvasNavigation.getElement().find( `.${offNavClassName}__list` );
    $offNavList.append( renderUserAction() + renderTree( buildTree( $links ) ) );
};

export default contentSetter;
