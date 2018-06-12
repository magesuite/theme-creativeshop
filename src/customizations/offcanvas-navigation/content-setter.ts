import $ from 'jquery';
import 'mage/translate';
import OffcanvasNavigation from '../../../node_modules/creative-patterns/packages/components/offcanvas-navigation/src/offcanvas-navigation';

export interface NavigationTree {
    name: string;
    url: string;
    icon: string;
    productCount: string;
    activeClass: string;
    subcategories: NavigationTree[];
}

const navClassName: string = 'cs-navigation';
const offNavClassName: string = 'cs-offcanvas-navigation';
const infoStripeClassName: string = 'cs-information-stripe';

/**
 * Builds subtree structure from existing desktop navigation.
 * @param  {JQuery}         $link Root link for tree.
 * @return {NavigationTree}       Navigation tree originating in root link.
 */
export function buildSubtree($link: JQuery): NavigationTree {
    const $subcategories: JQuery = $link.next();
    const subcategoryClass = $subcategories.hasClass(`${navClassName}__flyout`)
        ? `.${navClassName}__link--category`
        : `.${navClassName}__link--subcategory`;
    const $sublinks: JQuery = $subcategories.find(subcategoryClass);
    const subcategories: NavigationTree[] = $.map(
        $sublinks,
        (sublink: HTMLElement) => {
            return buildSubtree($(sublink));
        }
    );

    const subtree: NavigationTree = {
        name: $link
            .clone()
            .children()
            .remove()
            .end()
            .text()
            .trim(),
        url: $link.attr('href'),
        icon: $link.find(`> .${navClassName}__link-icon-wrapper`).length
            ? $link
                  .find(
                      `> .${navClassName}__link-icon-wrapper .${navClassName}__link-icon`
                  )
                  .attr('src')
            : '',
        productCount: $link.find(`> .${navClassName}__link-products-qty`).length
            ? $link.find(`> .${navClassName}__link-products-qty`).text()
            : '',
        activeClass: $link.parent().data('active-class')
            ? $link.parent().data('active-class')
            : '',
        subcategories: subcategories,
    };

    return subtree;
}

/**
 * Build navigation tree structure from exisiting desktop navigation.
 * @param  {JQuery}           $links Main links of desktop navigation.
 * @return {NavigationTree[]}        Complete navigation tree
 */
export function buildTree($links: JQuery): NavigationTree[] {
    const navigationTree: NavigationTree[] = [];
    $links.each((index: number, link: HTMLElement) => {
        navigationTree.push(buildSubtree($(link)));
    });
    return navigationTree;
}

/**
 * Renders navigation tree.
 * @param  {NavigationTree[]} navigationTree Navigation tree data.
 * @param  {NavigationTree}   parent         Parent category.
 * @return {string}                          Rendered HTML.
 */
export function renderTree(
    navigationTree: NavigationTree[],
    parent?: NavigationTree,
    settings?: any
): string {
    let subtreeHTML: string = parent
        ? `<ul class="${offNavClassName}__list">`
        : '';
    navigationTree.forEach((category: NavigationTree, index: number) => {
        if (parent && index === 0) {
            subtreeHTML += `<li class="${offNavClassName}__item">
                <a class="${offNavClassName}__link ${offNavClassName}__link--return" href="${
                parent.url
            }">
                    <svg class="${offNavClassName}__icon">
                        <use xlink:href="#arrow_prev"></use>
                    </svg>
                    <span class="${offNavClassName}__text">
                        ${parent.name}
                    </span>
                </a>
            </li>
            <li class="cs-offcanvas-navigation__item">
                <a class="cs-offcanvas-navigation__link" href="${
                    parent.url
                }">${$.mage.__('All products')}</a>
            </li>`;
        }

        const categoryIconHTML: string =
            settings.showCategoryIcon && category.icon
                ? `<span class="${offNavClassName}__category-icon-wrapper">
                    <img src="${category.icon}" alt="${
                      category.name
                  }" class="${offNavClassName}__category-icon">
               </span>`
                : '';
        const productCountHTML: string =
            settings.showProductsCount && category.productCount
                ? `<span class="${offNavClassName}__product-qty">${
                      category.productCount
                  }</span>`
                : '';
        let additionalItemClass: string = categoryIconHTML
            ? `${offNavClassName}__item--with-icon`
            : '';

        if (category.activeClass.length) {
            additionalItemClass += ` ${category.activeClass}`;
        }

        subtreeHTML += `<li class="${offNavClassName}__item ${additionalItemClass}">`;
        if (category.subcategories.length) {
            subtreeHTML += `<a class="${offNavClassName}__link ${offNavClassName}__link--parent" href="${
                category.url
            }">
                <span class="${offNavClassName}__text">
                    ${categoryIconHTML} ${category.name} ${productCountHTML}
                </span>
                <svg class="${offNavClassName}__icon">
                    <use xlink:href="#arrow_next"></use>
                </svg>
            </a>
                ${renderTree(category.subcategories, category, settings)}`;
        } else {
            subtreeHTML += `<a class="${offNavClassName}__link" href="${
                category.url
            }">
                <span class="${offNavClassName}__text">
                    ${categoryIconHTML} ${category.name} ${productCountHTML}
                </span>
            </a>`;
        }
        subtreeHTML += '</li>';
    });
    subtreeHTML += parent ? '</ul>' : '';

    return subtreeHTML;
}

export function renderUserAction(): string {
    const $accountLink: JQuery = $(`.${infoStripeClassName}__account-link`);

    if (!$accountLink.length) {
        return '';
    } else {
        const accountLinkHref: string = $accountLink.attr('href');
        const accountLinkText: string = $accountLink.text().trim();
        const accountActionType: string =
            accountLinkHref.toLowerCase().indexOf('out') === -1 ? 'in' : 'out';

        return `<li class="${offNavClassName}__item">
        <a class="${offNavClassName}__link ${offNavClassName}__link--sign-${accountActionType}" href="${accountLinkHref}">
            <span class="${offNavClassName}__text">
                ${accountLinkText}
            </span>
            <svg class="${offNavClassName}__icon">
                <use xlink:href="#sign-${accountActionType}"></use>
            </svg>
        </a>
    </li>`;
    }
}

// add placeholder for storeviewswitcher
export function renderStoreViewSwitcher(): string {
    return `<div class="cs-offcanvas-navigation__item-lang-switcher"></div>`;
}

// move storeviewswitcher to placeholder in offcanvas
export function moveStoreViewSwitcher(): void {
    jQuery(`#switcher-language-nav`).appendTo(
        `.cs-offcanvas-navigation__item-lang-switcher`
    );
}

/**
 * Sets offcanvas navigation content.
 */
export const contentSetter = (
    offcanvasNavigation: OffcanvasNavigation
): void => {
    const $navigation: JQuery = $(`.${navClassName}`);
    const $links: JQuery = $navigation
        .find(`.${navClassName}__link`)
        .not(
            `.${navClassName}__link--category, .${navClassName}__link--subcategory`
        );
    const $offNavList: JQuery = offcanvasNavigation
        .getElement()
        .find(`.${offNavClassName}__list`);
    $offNavList.append(
        renderTree(buildTree($links), null, offcanvasNavigation._options) +
            renderUserAction() +
            renderStoreViewSwitcher()
    );
    moveStoreViewSwitcher();
};

export default contentSetter;
