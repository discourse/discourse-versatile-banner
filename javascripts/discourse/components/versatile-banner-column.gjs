import Component from "@glimmer/component";
import { htmlSafe } from "@ember/template";
import { or } from "truth-helpers";
import icon from "discourse/helpers/d-icon";

export default class VersatileBannerColumn extends Component {
  get isHttpLink() {
    return this.args.icon.startsWith("http");
  }

  <template>
    {{#if (or @icon @columnContent)}}
      <div class="{{@columnClass}} single-box">
        {{#if @icon}}
          <div class="icon">
            {{#if this.isHttpLink}}
              <img class="responsive-img" src={{@icon}} alt="Icon" />
            {{else}}
              {{icon @icon}}
            {{/if}}
          </div>
        {{/if}}
        {{#if @columnContent}}
          <div>
            {{htmlSafe @columnContent}}
          </div>
        {{/if}}
      </div>
    {{/if}}
  </template>
}
