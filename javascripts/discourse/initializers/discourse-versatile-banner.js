import { apiInitializer } from "discourse/lib/api";
import VersatileBanner from "../components/versatile-banner";

export default apiInitializer("1.15.0", (api) => {
  api.renderInOutlet(settings.plugin_outlet, VersatileBanner);
});
