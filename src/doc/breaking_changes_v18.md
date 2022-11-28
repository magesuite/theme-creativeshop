# List of breaking changes in theme-creativeshop version ^18.0.0

## **Sub-components imports removed from components and moved to entries for  better  ovverwriting possibilities:**
- removed from components/header/index.ts and added to all page-specfic entries:
```
'components/header/search'
'components/header/user-nav'
```

- removed from components/product-details/index.ts and added to entries/pdp.ts:
```
'components/product-details/additional' added to pdp entry
'components/product-details/description'
'components/product-details/main'
'components/product-details/nav'
```

- removed from components/cart/index.ts and added to entries/checkout.ts:
```
'components/cart/cart-bonus'
'components/cart/cart-item'
'components/cart/cart-summary'
'components/cart/cart-table'
```

> Dev Hint: The following files shall be reviewed
> *components/cart/index.ts*, 
> *components/header/index.ts*, 
> *components/product-deatils/index.ts*,
> and aligned with core (import of sub-components should be in entries now).

<br/>

## **import of 'bundle.scss' removed from entries..**
...as it only imported 'Magento_Theme/web/css/source/layout'**
The latter is now imported in entries instead.

> Dev Hint: move your custom styles from bundle.scss, to 'config/base.scss'

<br/>

## **introduced index.ts for 'Amazon_Pay' optional component**
Import in entires should look like: 
`import 'Amazon_Pay' instead of 'Amazon_Pay/web/css/source/module.scss'`
> non-breaking but better to align

<br/>

## introduced index.ts for 'MageSuite_PackstationDhl' optional component
Import in entires should look like:
`import 'MageSuite_PackstationDhl' instead of 'MageSuite_PackstationDhl/web/css/source/module.scss'`
> non-breaking but better to align

<br/>

## introduced index.ts for 'Magento_LoginAsCustomerFrontendUi' component and adjusted import in 'entries/login-as-customer'
> non-breaking

<br/>

## introduced index.ts for 'MageSuite_SuccessPageOrderDetails' optional component
Import in entires should look like:
`import 'MageSuite_SuccessPageOrderDetails'` instead of `import 'MageSuite_SuccessPageOrderDetails/web/css/last-order-details.scss'`
> non-breaking but better to align

<br/>

## introduced index.ts for 'MageSuite_BrandManagement' component
Import in entires should look like:
`import 'MageSuite_BrandManagement'` instead of `import 'MageSuite_BrandManagement/web/css/brands-index.scss'`
> non-breaking but better to align

<br/>

## introduced index.ts for 'MageSuite_BackInStock' component
Import in entires should look like:
`import 'MageSuite_BackInStock'` instead of `import 'MageSuite_BackInStock/web/css/product-stock-subscription.scss'`
> non-breaking but better to align

<br/>

## introduced 'MageSuite_Pwa' folder and moved 'components/pwa-a2hs-guide' there.
Optional import should look like:
`import 'MageSuite_Pwa'` instead of `import 'components/pwa-a2hs-guide'`
> Dev Hint: If 'components/pwa-a2hs-guide' has been overwritten in project, please move files accordingly and adjust imports.

<br/>

## introduced 'MageSuite_PwaNotifications' folder and moved 'components/notification-panel' there.
optional import should look like:
`import 'MageSuite_PwaNotifications'` instead of `import 'components/notification-panel'`
> Dev Hint: 
> If 'components/notification-panel' has been overwritten in project, please move files accordingly and adjust imports.
> Also, notification-panel component was imported by default in entires/pdp.ts - it's not anymore. Import it in your project if in use.

<br/>

## introduced 'MageSuite_QuickReorder' folder and moved 'components/latest-products-purchased' and 'components/reorder-banner' there
Imports should look like:
`import 'MageSuite_QuickReorder/latest-products-purchased'` instead of `import 'components/latest-purchased-products'`
`import 'MageSuite_QuickReorder/reorder-banner'` instead of `import 'components/reorder-banner'`
Additionally, latest-products-purchased component is optional now, previously it was by default imported in 'entries/customer.ts'.
> Dev Hint: 
> If 'components/latest-products-purchased' or 'components/reorder-banner' has been overwritten in project, please move files accordingly and adjust imports.
> If you do not import latest products purchased component in your child project explicitly and want to use it - add import to entry.

<br/>

## moved plugincompany-contactform component, from customization/plugincompany-contactform, to module folder 'PluginCompany_ContactForms'.
Also, it is an OPTIONAL component now, so make sure you import it in entries when project is using it.
> Dev Hint: 
> Check if you need plugincompany-contactform, if not - add import to your entries, if you overwritten this component, move files accordingly and adjust imports.
> Previously it was imported by default in entries: checkout.ts, contact.ts, customer.ts

<br/>

## Removed 'components/non-critical' as it was an experiment which we do not use, styles moved to 'confg/base.scss'
> Dev Hint: if you used components/non-critcal component, move thees styles to other components.

<br/>

## Removed 'entires/critical.ts' as it was an experiment which we do not use
> Dev Hint: if you used this entry - recreate it in project instead.

<br/>

## removed 'vendors/swiper.scss' as Swiper is no longer used and supported by MageSuite.

<br/>

## removed 'vendors/_jquery.debouncedresize.js' as it is not used.

<br/>

## removed 'sprites/' as it is a relict.

<br/>

## removed entiely 'components/image-teaser-legacy', 'entries/image-teaser-legacy' as we dropped its support a qouple of versions before.

<br/>

## removed entiely 'components/teaser' as it is a relict
There are two related changes:
`teaser/mixins/pagination.scss` mixins were still used in product-gallery component, therefore we moved this file to 'product-gallery/pagination/mixins.scss',
cleaned up variables, removed hooks and changed variable names, removing 'teaser_' prefix.
A helper function 'get-gradient-angle' from 'components/teaser/functions.scss' was moved to 'component/image-teaser/functions/get-gradient-angle.scss'
> Dev hint: If project extends/overwrites 'components/teaser/mixins/pagination' or adds pagination hooks, move this component to
> 'product-gallery/pagination/mixins.scss', adjust imports, cleanup variable names and change their names removing 'teaser_' prefix from them. 
> If hooks for pagination were used, add related styles directly in 'components/product-gallery/product-gallery.scss'

<br/>

## 'entires/product-compare.ts' has been changed, and imports only 'components/product-compare' instead of all the components.
Product compare page now uses cms bundle + product compare component styles, see: 'catalog_product_compare_index.xml'
It does not make sense to build whole entry as it only needs this one additional component in comparison to cms bundle.
> Dev hint: 
> Check if product-compare page is displayed properly in child project.
> generated product-compare.css is attached in xml by default, but if any component added to this page produces JS logic, it has to be attached additionally.
> It can be added via xml, like we do for our base bundles (see "scripts" block in: `src/Magento_Theme/layout/default.xml`)

<br/>

## 'entires/magesuite-brand-management.ts' has been changed, and imports only 'MageSuite_BrandManagement' instead of all the components.
Brand management page now uses category bundle + magesuite-brand-management styles, see: 'brands_index_all.xml'
It does not make sense to build whole entry as it only needs this one additional component in comparison to category bundle.
> Dev hint: 
> Check if brand management page is displayed properly in child project.
> generated magesuite-brand-management.css is attached in xml by default, but if any component added to this page produces JS logic, it has to be attached additionally.
> It can be added via xml, like we do for our base bundles (see "scripts" block in: `src/Magento_Theme/layout/default.xml`)

<br/>

## 'entires/magesuite-store-locator.ts' has been changed, and imports only 'MageSuite_StoreLocator' component instead of all the components.
Store locator page now uses cms bundle + magesuite-store-locator bundle, see: 'storelocator_index_index.xml'
It does not make sense to build whole entry as it only needs this one additional component in comparison to cms bundle.
> Dev hint: 
> Check if store locator page is displayed properly in child project.
> generated magesuite-store-locator.css is attached in xml by default, but if any component added to this page produces JS logic, it has to be attached additionally.
> It can be added via xml, like we do for our base bundles (see "scripts" block in: `src/Magento_Theme/layout/default.xml`)

<br/>

## 'entires/contact.ts' has been changed, and imports only additional components instead of all the components.
Store locator page now uses cms bundle + contact bundle, see: 'contact_index_index.xml' and 'contactforms_form_view.xml'
It does not make sense to build whole entry as it only needs this one additional components in comparison to cms bundle.
> Dev hint: 
> Check if contact page is displayed properly in child project.
> generated contact.css is attached in xml by default, but if any component added to this page produces JS logic, it has to be attached additionally.
> It can be added via xml, like we do for our base bundles (see "scripts" block in: `src/Magento_Theme/layout/default.xml`)

<br/>

## Removed 'entries/breakpoint', 'utils/breakpoint/breakpoint.ts' and dependency to it from 'requirejs-config.js'.
It does not support listening with jQuery anymore, use native addEventListener as described in 'src/Magento_Theme/templates/head/breakpoint-script.phtml'
> Dev hint: search for 'breakpointChange' event through your child theme, if you use it,  make sure that listener is attached to document using addEventListener, 
> and event data is properly referenced (like event.detail.breakpointName)

<br/>

## Advanced tab has been created for teaser based CC components with index equals to 2.
This tab provides additional options for teaser based CC components like possibility to set `fetchpriority` attribute as high, open CTA links in new tab
and passing tracking ID value to teaser slide element as data attribute.
> Dev hint:
> Check if project theme implements any custom field within newly created tab with index equals 2, if so adjust index properly in order to not to override
> advanced tab. 

<br/>

## Checkout "Next button" logic was refactored in order to make it more extensible.
Next button script was refactored in odrer to allow to add own logic for enabling/disabling the button in child themes and modules.
In "theme-creativeshop/src/Magento_Checkout/web/js/next-button.js" method called "canContinueToPayment" was added. 
"isDisabled" property, which was an observable before, became computed because it checks multiple observables. Now it returns !this.canContinueToPayment()
> Dev hint:
> Check if project theme adds a mixin to next-button.js, if so move disabling/enambil logic to canContinueToPayment method. Do not forget to return parent method at the end: "return this._super();"
> Do not reinitialize "isDisabled" in mixin
> Heavy test checkout if you use packstation dhl module or pick in store.

<br/>

## submit-button-enabler mixin has been removed
submit-button-enabler.js mixin has been removed as the same function has been introduced in Magento v2.4.x 
within Magento/Catalog/view/frontend/web/js/catalog-add-to-cart.js
> Dev hint:
> Check if project extends this logic and adjust or remove.

<br/>