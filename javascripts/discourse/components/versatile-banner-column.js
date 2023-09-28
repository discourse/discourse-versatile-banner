import Component from "@glimmer/component";

export default class VersatileBannerColumn extends Component {
  get isHttpLink() {
    return this.args.icon.startsWith("http");
  }
}
