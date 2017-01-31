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
export function renderTree( navigationTree: NavigationTree[], parent?: NavigationTree ) {
    let subtreeHTML: string = parent ? `<ul class="${offNavClassName}__list">` : '';
    navigationTree.forEach((category: NavigationTree, index: number) => {
        if ( parent && index === 0 ) {
            subtreeHTML += `<li class="${offNavClassName}__item">
                <a class="${offNavClassName}__link ${offNavClassName}__link--return" href="${parent.url}">${parent.name}</a>
            </li>
            <li class="cs-offcanvas-navigation__item">
                <a class="cs-offcanvas-navigation__link" href="${parent.url}">${$translate('All products')}</a>
            </li>`;
        }

        subtreeHTML += `<li class="${offNavClassName}__item">`;
        if (category.subcategories.length) {
            subtreeHTML +=`<a class="${offNavClassName}__link ${offNavClassName}__link--parent" href="${category.url}">${category.name}</a>
                ${renderTree(category.subcategories, category)}`;
        } else {
            subtreeHTML += `<a class="${offNavClassName}__link" href="${category.url}">${category.name}</a>`;
        }
        subtreeHTML += '</li>';
    });
    subtreeHTML += parent ? '</ul>': '';

    return subtreeHTML;
}

/**
 * Sets offcanvas navigation content.
 */
export const contentSetter = ( offcanvasNavigation: OffcanvasNavigation ): void => {
    const $navigation: JQuery = $( `.${navClassName}` );
    const $links: JQuery = $navigation.find( `.${navClassName}__link` ).not( `.${navClassName}__link--category, .${navClassName}__link--subcategory` );
    const $offNavList = offcanvasNavigation.getElement().find(`.${offNavClassName}__list`);
    $offNavList.append(renderTree(buildTree($links)));
};

export default contentSetter;
