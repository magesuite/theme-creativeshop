# Magento 2 Creativeshop theme
This this is our parent theme fo shops based on Magento 2.

## Getting started
### Requirements

- Magento 2,
- NodeJS,
- Gulp.


# Documentation
* [First steps](https://gitlab.creativestyle.pl/m2c/theme-creativeshop/tree/next#first-steps)
    * [Setting up new theme](https://gitlab.creativestyle.pl/m2c/theme-creativeshop/tree/next#setting-up-new-theme)
    * [Development](https://gitlab.creativestyle.pl/m2c/theme-creativeshop/tree/next#development)
* [SCSS customization](https://gitlab.creativestyle.pl/m2c/theme-creativeshop/tree/next#scss-customization)
    * [Customization process](https://gitlab.creativestyle.pl/m2c/theme-creativeshop/tree/next#customization-process)
    * [Customization of `<your-theme>/src/config`](https://gitlab.creativestyle.pl/m2c/theme-creativeshop/tree/next#customization-of-your-themesrcconfig)
    * [Customizing existing components](https://gitlab.creativestyle.pl/m2c/theme-creativeshop/tree/next#customizing-existing-components)
    * [Mixins and hooks](https://gitlab.creativestyle.pl/m2c/theme-creativeshop/tree/next#mixins-and-hooks)
* [New component creation](https://gitlab.creativestyle.pl/m2c/theme-creativeshop/tree/next#new-component-creation)
    * [Adding a new component to the entries](https://gitlab.creativestyle.pl/m2c/theme-creativeshop/tree/next#adding-a-new-component-to-the-entries)
* [Split entries](https://gitlab.creativestyle.pl/m2c/theme-creativeshop/tree/next#split-entries)



## First steps

[theme-creativeshop](https://github.com/creativestyle/theme-creativeshop) is a Magento 2 theme package that leverages all the functionality MageSuite has to offer. It relies on component-based development approach, so it can be easily customized and extended to your needs by adding new components or overriding existing ones. This guide will show you how to setup your project with `theme-creativeshop`, explain recommended workflow and demonstrate how to use its best features, customize them and add new ones to suit your purpose.

### Setting up new theme

[Once you have MageSuite installed](https://github.com/magesuite/magesuite), you need to create your new theme and build static assets. MageSuite does not rely on Magento for building the assets, it uses its own solution based on Webpack and Gulp instead. Thanks to it, you can maintain your theme repository with your own code only; rest is inherited in build process from theme-creativeshop.

1. [Install MageSuite Theme Generator](https://www.npmjs.com/package/@creativestyle/magesuite-theme-generator). It's a small NPM package that does for you all the dirty work of creating new creativeshop-based theme in proper framework.
2. Navigate to `vendor/creativestyle` and run `magesuite-theme-generator` command, the generator will ask you couple of questions.
3. Initiate version control repository in your new theme directory.
4. Run `yarn install && yarn build` to install dependencies and build static assets. You have to do this both for `theme-creativeshop` and your new theme directory.
5. Run `bin/magento setup:upgrade` to register your new theme.
6. Change active Magento theme to your new theme.

Now you should have got Magento installation up and running with your new creativeshop-based theme.

### Development

`theme-creativeshop` is designed to achieve convenient Magento 2 development environment. After you have created your new theme you can use, modify or add any component you find in parent theme. This whole inheriting procedure is the part of theme build process, which incorporates all the stuff you need to do with your code as a theme developer. Here are commands that you may choose depending on what you would like to achieve:

* `yarn build`: builds entire theme from `vendor/creativestyle/<your-theme>` into `app/design/frontend/creativestyle/<your-theme>` directory, where Magento is able to find and apply it.
* `yarn gulp watch`: same as above, but the build is triggered automatically every time any changes are made in the source directory.
* `yarn start`: same as above, but the additional Browsersync server is set up. It provides browser automatic reloading, CSS injection and the ability to tunnel local environment, so that it is possible to open it on any device within the same network.

In case you wonder how the build process looks in detail:

* Previous files from destination directory are cleaned to avoid any unwanted leftovers.
* Images are copied and optimized.
* Miscellaneous files that don't require any transforms, such as fonts and templates, are copied.
* SCSS and TypeScript source files are compiled and optimized.
* Magento frontend caches are cleaned.

## SCSS customization

Styling theme-creativeshop is generally based on SCSS variables. 

### Customization process

* Assign colors to color name variables in `src/config/colors` - we use Hex color code
* Assign color name variables to theme variables in `src/config/variables`
* Add/modify component variables in `<your-theme>/src/components/component.scss`

Those dependencies allow us to change whole theme colors set up very fast, by only adjusting variables. 

### Customization of `<your-theme>/src/config`

#### Colors
`src/config/colors` - here you should create variables for all the colors used in your theme.

* Start with the import of colors from theme-creativeshop to be able to use them as well: `@import '~Creativeshop/config/colors';`
* Use online tools to name colors, eg. [color-name-hue](www.color-blindness.com/color-name-hue) or [name-that-color](chir.ag/projects/name-that-color)

Below snippet from `src/config/colors`
```sass
@import '~Creativeshop/config/colors';
 
$color_monza: #da001a;
$color_monza--hover: #ce0019;
 
$color_lochinvar: #2b827c; //$color_secondary-500, $color_secondary-200
 
$color_desert-storm: #f3f3f2; // $color_background-500, grey backgrounds
$color_alto: #dcdcdc; // $color_border-200, $color_background-600, light border, teh same as magesuite
 
$color_gray-nurse: #e6e7e5; // $color_background-800
 
$color_dust-gray: #9b9b9b; // $color_text-400, $color_border-500, $color_border-700, light texts, inputs(basic) borders
$color_pumice: #bfc0bf; // color_border-500
```

#### Variables

`src/config/variables` - here store all the variables used in the whole theme, such as colors - primary, secondary, background, font-sizes, font-weight, etc.

* Start with the import of variables from theme-creativeshop to be able to use them as well: `@import '~Creativeshop/config/variables';`
* Theme-creativeshop provides a lot of variables and most of them should be overwritten.
* Follow the convention: `component_element-modifier` (with one underscore and one hyphen). If modifiers are numbers, they indicate the degree or intensity - 200 is the lightest and 900 is the darkest.

Below snippet from `src/config/variables`
```sass
@import '~Creativeshop/config/variables';
 
$color_text-400: $color_dust-gray; //light gray
$color_text-500: $color_abbey;
$color_text-600: $color_abbey;
 
$price_color: $color_primary-500;
$price_special-color: $color_primary-500;
 
$global_header-height-mobile: 5.5rem;
 
$border-radius_base: 5px;
 
$global_header-hide-search-item-trigger-breakpoint: '>=laptop';
```

All the variables in theme-creativeshop are marked as `!default`. This means that they are taken by default, but if you create a variable with the same name, you will overwrite it and the new variable will be taken into account. 

`src/config/base` - basic styling of basic components, such as body, buttons, etc. 

`src/config/breakpoints` - this is where the breakpoints structure is set; likely, you won't have to make any changes to this file. 

#### Variables naming convention

`$component-name_element-name` - use the underscore only once:

Below snippet from `your-theme/src/components/footer/footer.scss`
```sass
@import 'config/variables';
 
$footer_background: $color_background-550;
 
$footer_section-title-color: $color_text-200;
$footer_section-title-font-size: 1.4em;
 
$footer_section-separator-border: 1px solid $color_border-400;
 
$footer_section-plus-include: false;
$footer_section-dropdown-width: 1.6rem;
$footer_section-dropdown-height: 1rem;
$footer_section-dropdown-color: $color_primary-500;
 
$footer_logo-width: 13.5em;
$footer_logo-height: 2.3em;
```

### Customizing existing components

* The styling takes place in component (`<your-theme>/src/components/component`).
* To customize each component, create a component under the same directory in your theme and import the original component into it.
* Do not change anything in theme-creativeshop, but make all the changes in your theme, creating the same structure of components. 

Once the configuration folder is ready, you can start customizing the components. A simple component includes: 

* `new-component.ts` - contains the definition of the component
* `new-component.scss` - contains styling of the component
* `index.ts` - imports the component styles and initializes it. 

Some of them contain subfolders or additional files.

If you customize a component existing in theme-creativeshop, you do not need to create a `.ts` files in your topic unless you want to expand more `.ts` structure.

If you only want to customize SCSS, create a `.scss` file with the same path as the original one and import the original `.scss` file into it.

Don't forget to import the component from theme-creativeshop to be able ro reuse it's variables and functionalities.

Below snippet from `your-theme/components/container/container.scss`
```sass
@import 'config/variables';
@import 'vendors/include-media';
 
@import '~Creativeshop/components/container/container.scss';
 
.#{$ns}container {
    $root: &;
 
    &--page-pdp-details-main {
        @include media('<tablet') {
            padding: 0;
        }
    }
}
```

In each component, you start the customization process by overwriting the variables. Add new variables if needed. Below, import the original component, and then start entering your styles into the existing classes.

Sometimes there are subfolders in the component. During the customization process, it is important to have the same folder structure. Only then the gulp merging process will run correctly.

### Mixins and hooks

* We use SASS mixins to make our code reusable and more versatile.
* You will find mixins files created for components that can have different variants - e.g. buttons, teasers, badges, etc.
* Use the hook files to modify mixins - it is always empty in theme-creativeshop and you can overwrite this file by creating it in your theme to modify a specific mixin. 
* If you want to overwrite the variables declared in the mixin file, do so in the appropriate mixin file in your theme. 

Below snippet from `your-theme/src/components/badge/mixin.scss`
```sass
@import 'config/variables';
@import 'components/badge/hook';
 
$badge_height: 2.1rem;
$badge_padding: 0.5rem 1.2rem;
$badge_border-radius: 0;
 
$badge--new-background: $color_background-700;
$badge--new-color: $color_white;
 
$badge--sale-background: $color_primary-500;
$badge--discount-background: transparent;
 
$badge--free-shipping-background: $color_background-700;
$badge--popular-background: $color_background-700;
 
@import '~Creativeshop/components/badge/mixin.scss';
```

Below snippet from `your-theme/src/components/badge/hook.scss`
```sass
@import 'utils/get-value-from-list';
 
/* stylelint-disable block-no-empty  */
@mixin badge_hook($type) {
    display: flex;
    flex-direction: column;
    min-width: 5rem;
 
    &:before {
        content: none;
    }
}
 
@mixin badge_type-hook($type) {
    @if ($type == 'is_advertised') {
        background-color: $color_background-900;
        color: $color_white;
    }
 
    @if ($type == 'discount') {
        min-width: 4.8rem;
        padding: 0 ;
    }
}
```

### Utils

There are additional useful functions here, often imported in components. It is good to familiarize yourself with them to be able to use them.  



## New component creation

New component has to be located in `src/components`, inside your theme directory;
```
theme-creativeshop/src/components/<component-name>
```

It should contain:

* `new-component.ts` - contains the definition of the component
* `new-component.scss` - contains styling of the component
* `index.ts` - imports the component styles and initializes it. Below you can find index.ts file from quantity-increment component. Below snippet from `components/qty-increment/index.ts`:

```javascript
import * as $ from 'jquery';
 
import QtyIncrement from 'components/qty-increment/qty-increment';
import 'components/qty-increment/qty-increment.scss';
 
$('.cs-qty-increment').each(function(): void {
    new QtyIncrement($(this));
});
```

### Adding a new component to the entries

In theme-creativeshop/src/entries you can find the entry points.
We use separate entries for the particular page types and modules to take advantage of Webpack's chucks splitting feature, which is described in a [Split entries article.]()

Basically, the most important entries are:
* cms.ts
* pdp.ts
* category.ts
* checkout.ts
* customer.ts
* contact.ts

They are responsible for specific pages across the shop and contain all the components that are required for them.
If your component is to be used visible on PDP and category, below code has to be added to both entries:
`components/qty-increment/index.ts`
```javascript
import 'components/<component-name>';
```

### Split entries

To increase the performance of the pages loading, we decided to use [Webpack's split chunks feature](https://webpack.js.org/plugins/split-chunks-plugin/), which allows dividing bundles into chunks.
The idea behind was to not load every Magesuite component at once, just to have a commons bundle with components that are always required and the smaller bundles that we can import exactly when we need it.
Webpack takes all the entries and extracts the commons bundles (*commons.js* and *commons.css*) containing components used in most of the entries, then puts the rest in smaller particular bundles.
Build files you can find in `app/design/frontend/creativestyle/theme-creativeshop/web/js` and `app/design/frontend/creativestyle/theme-creativeshop/web/css`.

> Example:
> Assume we have 2 entry points: *pdp.ts* and *category.ts*. Each of them imports components/product-tile plus its specific components, like `pages/pdp` and `pages/category`.
> Based on that, Webpack creates commons.js and commons.css bundles containing the *product-tile* component logic and styling. But it also creates *pdp.js*/*pdp.css* and *category.js*/*category.css* bundles to be used for PDP or category page only.

In ,theme-creativeshop/src/entries, you can find two types of entry points: **entries for pages** (ex. category.ts) and **entries for modules** (ex. magesuite-brand-management.ts). 

#### Base entries

They should contain **all components** that are needed for some specific page in the shop.
Bundles produced from these entries we import on particular pages

Regarding CSS, we add the commons.css to every page in the shop and add other bundles via xml inside the `<head>` tag in places where we need them.

> Example: `theme-creativeshop/src/Magento_Catalog/layout/catalog_product_view.xml`
```html
<head>
    <css src="css/pdp.css"/>
</head>
```

As for the Javascript bundles, they have defined an explicit dependency on the commons.js package (in `theme-creativeshop/src/requirejs-config.js`).

To add the single JS bundle we use the reference to the script block where we can pass the bundle_name argument.

> Example: theme-creativeshop/src/Magento_Catalog/layout/catalog_product_view.xml

```xml
<referenceBlock name="scripts">
    <arguments>
        <argument name="bundle_name" xsi:type="string">pdp</argument>
    </arguments>
</referenceBlock>
```

**Important:** When we use this script block, we replace the js bundle, not adding another one, so you need to be sure that bundle you use contains all the required components.

Basically, the most important entries are:
* `cms.ts` - cms pages
* `pdp.ts` - product details page
* `category.ts` - products overview page (category)
* `checkout.ts` - checkout, cart pages
* `customer.ts` - user area pages
* `contact.ts` - contact page

They are responsible for basic pages across the shop and contain all the components that are required for them.

By default, we use cms.js bundle as the base one.


#### Entries for modules

They can contain styles and logic used by the specific module. Bundles generated form them, we use only as an addition to the base bundles. 
For example, the *magesuite-brand-management.ts* entry imports only styling for the brand list (`MageSuite_BrandManagement/web/css/brands-index.scss`).

Brand page itself relies on category.js and category.css bundles but in addition, we attach magesuite-brand-management.css bundle to it

#### Adding components to entries

To add a new component, you have to import it in every entry where you want it. 
For example, if you want to add some "special-product-promo" component, which will be used on category page and PDP only, you have to add below code to the pdp.ts and category.ts entries.

```javascript
import 'components/special-product-promo';
```

