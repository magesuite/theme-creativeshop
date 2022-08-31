# Elasticsearch Instant Search integration with MageSuite. 

MageSuite now supports Elastic Search premium feature - Instant Search, by integrating it into MageSuite CI and UX. 
Integration consists of: 
* overwritten elastic search form template to provide proper structure and classnames used in our components
* optional component providing CSS & JS scripts to make search integrated with MageSuite header

## How to use the integration:

In all the basic page entries (where the search is used), import of `components/header/search` shall be removed 
and `Smile_ElasticsuiteInstantSearch` should be imported instead.

By default default page entries are:

* `cms.ts` - cms pages
* `pdp.ts` - product details page
* `category.ts` - products overview page (category)
* `checkout.ts` - checkout, cart pages
* `customer.ts` - user area pages

`components/header/search` component is by default included in all of them, as it integrates default magento elastic search with MageSuite header functionallities.
Therefore entries in child projects have to be recreated from scratch, with skipped search component, instead of importing whole entries from theme-creativeshop.

Therefore for example in `entries/cms.ts` entry in child project instead of:

```
import 'Creativeshop/entries/cms';

// additional project components for cms page:
import 'components/amgdprcookie';
```

Recreate the whole entry by copying theme-creativeshop origina entry content to project's `entires/cms.ts` entry and add your additional components. 

> This practice is recommended anyway, as this way all the redundant components (not used by the project) can be skipped (what decreases page load and increases performance)

