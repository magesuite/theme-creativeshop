import $ from "jquery";
import OffcanvasNavigation from "../../../node_modules/creative-patterns/packages/components/offcanvas-navigation/src/offcanvas-navigation";

import contentSetter from "./content-setter";

const offNavClassName: string = "cs-offcanvas-navigation";

const navigaiton: any = new OffcanvasNavigation(null, {
  className: offNavClassName,
  contentSetter: contentSetter
});

export default navigaiton;
