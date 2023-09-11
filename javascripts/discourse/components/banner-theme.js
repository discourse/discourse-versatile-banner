import Component from "@glimmer/component";
import { inject as service } from "@ember/service";

export default class BannerTheme extends Component {
  @service currentUser;

  get displayBanner() {
    return (
      (settings.show_for_members && this.currentUser) ||
      (settings.show_for_anon && !this.currentUser)
    );
  }
}
