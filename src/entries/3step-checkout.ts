// =============================================================================
// Tsc Checkout entry point
// It imports all the components required by Checkout
// Each page type has own entry point containing required components.
// It allows optimizing bundles in webpack - which gathers common imports in separate package.
// It is a job of every component to initialize itself.

import 'config/base.scss';

// =============================================================================
// Components
// =============================================================================

// Base components
import 'components/3step-checkout';
import 'components/messages';
