// =============================================================================
// CMS pages entry point
// It imports all the components required by CMS pages
// Each page type has own entry point containing required components.
// It allows optimizing bundles in webpack - which gathers common imports in separate package.
// It is a job of every component to initilize itself.

import 'config/base.scss';
// TODO: Remove this file when possible
import 'bundle.scss';

// =============================================================================
// Components
// =============================================================================

// Base components
import 'components/container';
import 'components/dropdown-switcher';
import 'components/authorization-link';
import 'components/header';
import 'components/logo';
import 'components/minicart';
import 'components/navigation';
import 'components/offcanvas-toggle';
import 'components/offcanvas';
import 'components/topbar';
import 'components/visually-hidden';
import 'components/critical';

// Carousels (navigation/pagination CSS)
import 'components/_slider';
