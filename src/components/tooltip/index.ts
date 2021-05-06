import 'components/tooltip/tooltip.scss';
import Tooltip from 'components/tooltip/tooltip';

/**
 *  Tooltip component with touch device support.
 *
 *  Overview:
 *  - Component not included in any entry by default,
 *  - For all touch devices, tooltip changes into modal
 *  - Tooltip alignment can be set as setAlignment (top/bottom/left/right)
 *
 *  Sample block creation template usage:
        <?= $this->getLayout()
             ->createBlock('Magento\Framework\View\Element\Template')
             ->setTemplate('MageSuite_ThemeHelpers::tooltip.phtml')
             ->setAlignment('top')
             ->setTriggerText(__('Your trigger title'))
             ->setTitle(__('Your toolbar title'))
             ->setContent($yourContent)
             ->toHtml();
        ?>
 *
 */

new Tooltip();
