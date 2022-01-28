/**
 * Those components are small, they will be included in all entries by default.
 * Since they're not strictly bound to slider components now (all of carousels share the same CSS class for navigation/pagination) it doesn't make esense to implement them separately for each carousel and therefore we only want to import them once.
 * Feel free to remove it from particular entires in your project if you're sure they won't be needed
 */
import 'components/_slider/navigation/navigation.scss';
import 'components/_slider/pagination/pagination.scss';
