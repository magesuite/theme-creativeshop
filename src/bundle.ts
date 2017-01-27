/* tslint:disable:no-unused-expression no-unused-new */

// =============================================================================
// Main scripting entry point.
// We import all of the components here and initialize them.
// It is a job of every component if it is present of the page.
// This approach creates nice bundle, with all of the components and their dependencies.

// =============================================================================
// Vendors
// =============================================================================

import 'vendors';

// =============================================================================
// Utilities
// =============================================================================

// =============================================================================
// Components
// =============================================================================

// =============================================================================
// Customizations
// =============================================================================

import './components/collapse/collapse';
import './components/dropdown/dropdown';
import './customizations/select/select';

import { init as collapsibleText } from './components/collapsible-text/collapsible-text';
collapsibleText();

import './customizations/navigation/navigation';

import { QtyIncrementCollection } from './customizations/qty-increment/qty-increment';
new QtyIncrementCollection();

import './customizations/hero/hero';
import './customizations/products-promo/products-promo';
import './customizations/sticky-block/sticky-block';
import './customizations/items-grid-layout/items-grid-layout';

import './customizations/reviews/reviews';

window.addEventListener('touchstart', function onFirstTouch(): void {
    document.body.classList.add('touch-device');
    window.removeEventListener('touchstart', onFirstTouch, false);
}, false);
