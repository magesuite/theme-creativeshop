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

import './components/dropdown/dropdown';
import { init as hero } from './customizations/hero/_hero';
hero();

import './customizations/navigation/navigation';

import { QtyIncrementCollection } from './customizations/qty-increment/qty-increment.ts';
new QtyIncrementCollection();

import './customizations/sticky-block/sticky-block';
