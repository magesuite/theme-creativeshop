# Magento 2 Creativeshop theme
This this is our parent theme fo shops based on Magento 2.

## Getting started
### Requirements

- Magento 2,
- NodeJS,
- Gulp.


# Documentation
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

