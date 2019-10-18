# Magento 2 Creativeshop theme
This this is our parent theme for shops based on Magento 2.

# Requirements

- Magento 2,
- NodeJS,
- Gulp.

# Documentation
* [First steps](#first-steps)
    * [Building Creativeshop](#building-creativeshop)
    * [Setting up new theme](#setting-up-new-theme)
    * [Development](#development)
* [Adding new component](#new-component-creation)
    * [Component structure](#component-structure)
    * [Entry file](#entry-file)
* [Styles customization](#styles-customization)
    * [Customization process](#customization-process)
    * [Customization of `<your-theme>/src/config`](#customization-of-your-themesrcconfig)
    * [Customizing existing components](#customizing-existing-components)
    * [Mixins and hooks](#mixins-and-hooks)
* [Split entries](#split-entries)
* [Frequently Asked Questions](#frequently-asked-questions)

## First steps

[Creativeshop](https://github.com/creativestyle/theme-creativeshop) is a Magento 2 theme package that leverages all the functionality MageSuite has to offer. It relies on component-based development approach, so it can be easily customized and extended to your needs by adding new components or overriding existing ones. This guide will show you how to setup your project with Creativeshop, explain recommended workflow and demonstrate how to use its best features, customize them and add new ones to suit your purpose.

[Once you have MageSuite installed](https://github.com/magesuite/magesuite), you need to **build** Creativeshop and then create your own child theme. MageSuite does not rely on Magento for building the assets, it uses its own solution based on Webpack and Gulp instead. Thanks to it, you can maintain your theme repository with your own code only; rest is inherited in build process from Creativeshop.

### Building Creativeshop
Before you start, make sure you have [Node.js](https://nodejs.org/en/) installed.
1. Navigate to `vendor/creativestyle/theme-creativeshop`.
2. Run `yarn install && yarn build`. It will install dependencies and build artifacts into `app/design` directory.

### Setting up new theme
1. [Install MageSuite Theme Generator](https://www.npmjs.com/package/@creativestyle/magesuite-theme-generator). It's a small NPM package that does for you all the dirty work of creating new Creativeshop-based theme in proper framework.
2. Navigate to `vendor/creativestyle` and run `magesuite-theme-generator` command, the generator will ask you couple of questions.
3. Navigate to your new theme directory (`vendor/creativestyle/<your-theme>`) and initiate version control repository.
4. Build your new theme in the same way that you've build `theme-creativeshop`.
5. Run `bin/magento setup:upgrade`.
6. Change active Magento theme to your new theme.

Now you should have got Magento installation up and running with your new Creativeshop-based theme.

**Don't forget to set `theme-creativeshop` or your new theme as global in Content → Design → Configuration, otherwise the Magesuite's Content Constructor will not work properly**.

### Development

Creativeshop is designed to achieve convenient Magento 2 development environment. After you have created your new theme you can use, modify or add any component you find in parent theme. This whole inheriting procedure is the part of theme build process, which incorporates all the stuff you need to do with your code as a theme developer. Here are commands that you may choose depending on what you would like to achieve:

* `yarn build`: builds entire theme from `vendor/creativestyle/<your-theme>` into `app/design/frontend/creativestyle/<your-theme>` directory, where Magento is able to find and apply it.
* `yarn gulp watch`: same as above, but the build is triggered automatically every time any changes are made in the source directory.
* `yarn start`: same as above, but the additional Browsersync server is set up. It provides browser automatic reloading, CSS injection and the ability to tunnel local environment, so that it is possible to open it on any device within the same network.

In case you wonder how the build process looks in detail:

* Previous files from destination directory are cleaned to avoid any unwanted leftovers.
* Images are copied and optimized.
* Miscellaneous files that don't require any transforms, such as fonts and templates, are copied.
* SCSS and TypeScript source files are compiled and optimized.
* Magento frontend caches are cleaned.

You have installed and built your first Creativeshop-based theme. How about adding some new component to it?

## Adding new component

Creating new components is the core of the development process with Creativeshop. It's the first thing you should do if you want to customize existing component as well as write yours from scratch. 

Creativeshop incorporates something which may be called *component inheritance*. Once you have created your child theme properly, it can inherit all the parent components. You can do whathever you want with those inherited components - modify them to any degree or just use them without any changes. It's a powerful tool for building your theme out of curated ready to use and easily customizable parts.

It's good to remember one main rule of this inheritance process - **if the file is absent in the child theme, the corresponding file from parent theme is included**. That's why you can safely omit any file, even the entry, and the theme will be still compiled. What's interesting, the inheritance chain works with any number of themes, so you can have got grandchild, grandgrandchild themes and so on.

Let's create new `addtocart` component in our child theme. This component is responsible for displaying the button and product quantity select.

### Component structure

Components are stored in `~Creativeshop/src/components/<component>` directory. We will refer to the path to the `theme-creativeshop` Magento package as `~Creativeshop`, and to the name of the component as `<component>`. You can usually find following content in this folder:

- `index.ts`: Entry file. Contains imports of dependencies, TypeScript modules and SCSS files as well as script initializing the component in final website.
- `<component>.ts`: TypeScript module with the component definition.
- `<component>.scss`: Component styles.
- `mixin.scss`: Declarations of mixins used in the component styles.
- `hook.scss`: Hooks for component mixins.

Not all of the files listed above are neccessary. Technically, functional creativeshop component is nothing more than a TypeScript module importing needed files and exporting them for Webpack consume.

For now, let's create `addtocart` folder in your `~Creativeshop/src/components`. Note that path of your new component must match path of the parent component. 

### Entry file

Here you can see the original `addtocart` component entry file:

```
import AddToCart from 'components/addtocart/addtocart';
import 'components/addtocart/addtocart.scss';
new AddToCart();
```

Responsibilities of this file are as follows:
- It imports the component TypeScript class. This can be also plain TypeScript or even JavaScript module, but we recommend the [classical object oriented approach](https://levelup.gitconnected.com/typescript-object-oriented-concepts-in-a-nutshell-cb2fdeeffe6e).
- It imports the component styles.
- It initializes the component in final website.

You may notice that many Creativeshop components imports and uses jQuery. You can import any other third party library installed in `node_modules`. It's also frequent to import other Creativeshop components as dependencies.

If your new component serves only the purpose of customizing existing parent component - that's it! From now on you can insert any file into your component directory, and will it override the coresponding file from parent theme. It's as easy as that. However, bear in mind that **if your component is not just for customizing purposes, additional steps are needed** to make it work. You will learn about it later.
 
You've just learned about inner workings of a Creativeshop component and added your first customization component. How about customizing some styles?

## Styles customization

Styling the storefront is bread and butter of every Magento project. Creativeshop is designed to provide best frontend experience, both for end user and developer - because we should have fun with the development, shouldn't we?

There are two ways to customize Creativeshop component style:

- **Overriding Sass variables**. You can use extensive set of variables to quickly configure certain parts of code, such as paddings, colors, animations, icons and more.
- **Overriding CSS rulesets**. You can mix your own code with existing codebase and get desired effects. You can do it either by modyfing original styles or by writing them from scratch.

If you have ever used a modern CSS framework such as Bootstrap or Foundation, you are probably familiar with the first approach. It's convenient to some extent - problems begin when you want more control over look and feel of your frontend. Oftentimes only way to cope with it is to copy rulesets from original code and modify them, or to create new ones with higher specitifity. Both are quite mundane tasks, and will eventually make make your codebase a nightmare to maintain.

Creativeshop handles that issue in elegant way by allowing you to directly override particular CSS rulesets in your child theme. During build process, your customized component styles are merged to original ones - exactly like when a web browser calculates final styles. You have full control over output. You can either change a few declarations or write completely new code, and what is the best - you are always precise about selectors and specificity.

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

> Snippet from `src/config/colors`
```scss
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

> Snippet from `src/config/variables`
```scss
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

> Snippet from `your-theme/src/components/footer/footer.scss`
```scss
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

## Customizing existing components

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

> Snippet from `your-theme/components/container/container.scss`
```scss
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

> Snippet from `your-theme/src/components/badge/mixin.scss`
```scss
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
```scss
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

#### Utils

There are additional useful functions here, often imported in components. It is good to familiarize yourself with them to be able to use them.  

You've just learned about good style customization practices. It's time to find out how to add your own brand new component!

## Split entries

To increase the performance of the pages loading, we decided to use [Webpack's split chunks feature](https://webpack.js.org/plugins/split-chunks-plugin/), which allows dividing bundles into chunks.
The idea behind was to not load every Magesuite component at once, just to have a commons bundle with components that are always required and the smaller bundles that we can import exactly when we need it.
Webpack takes all the entries and extracts the commons bundles (*commons.js* and *commons.css*) containing components used in most of the entries, then puts the rest in smaller particular bundles.
Build files you can find in `app/design/frontend/creativestyle/theme-creativeshop/web/js` and `app/design/frontend/creativestyle/theme-creativeshop/web/css`.

> Example:
> Assume we have 2 entry points: *pdp.ts* and *category.ts*. Each of them imports components/product-tile plus its specific components, like `pages/pdp` and `pages/category`.
> Based on that, Webpack creates commons.js and commons.css bundles containing the *product-tile* component logic and styling. But it also creates *pdp.js*/*pdp.css* and *category.js*/*category.css* bundles to be used for PDP or category page only.

In ,theme-creativeshop/src/entries, you can find two types of entry points: **entries for pages** (ex. category.ts) and **entries for modules** (ex. magesuite-brand-management.ts). 

### Base entries

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


### Entries for modules

They can contain styles and logic used by the specific module. Bundles generated form them, we use only as an addition to the base bundles. 
For example, the *magesuite-brand-management.ts* entry imports only styling for the brand list (`MageSuite_BrandManagement/web/css/brands-index.scss`).

Brand page itself relies on category.js and category.css bundles but in addition, we attach magesuite-brand-management.css bundle to it

### Adding components to entries

To add a new component, you have to import it in every entry where you want it. 
For example, if you want to add some "special-product-promo" component, which will be used on category page and PDP only, you have to add below code to the pdp.ts and category.ts entries.

```javascript
import 'components/special-product-promo';
```

# Frequently asked questions

* [Unable to add image in Hero Carousel](https://github.com/magesuite/magesuite/issues/25)
* [Admin - console error `Cannot read property 'defaults' of undefined`](https://github.com/magesuite/magesuite/issues/23)
* [Component paragraph fails to render in frontend](https://github.com/magesuite/magesuite/issues/22)