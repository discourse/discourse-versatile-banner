import { apiInitializer } from "discourse/lib/api";
import VersatileBanner from "../components/versatile-banner";

export default apiInitializer((api) => {
  api.renderInOutlet(settings.plugin_outlet, VersatileBanner);
});
