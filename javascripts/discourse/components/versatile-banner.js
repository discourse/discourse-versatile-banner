import Component from "@glimmer/component";

import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";

import { defaultHomepage } from "discourse/lib/utilities";
import cookie, { removeCookie } from "discourse/lib/cookie";

import { inject as service } from "@ember/service";

export default class VersatileBanner extends Component {
  @service router;
  @service site;
  @tracked bannerClosed = cookie("banner_closed") || false;
  @tracked bannerHidden = cookie("banner_collapsed")
    ? JSON.parse(cookie("banner_collapsed")).collapsed
    : settings.default_collapsed_state == "collapsed"
    ? true
    : false;

  get cookieExpirationDate() {
    if (settings.cookie_lifespan == "none") {
      removeCookie("banner_closed", { path: "/" });
      removeCookie("banner_collapsed", { path: "/" });
    } else {
      return moment().add(1, settings.cookie_lifespan).toDate();
    }
  }

  get shouldShow() {
    // todo get this (fully) working

    const path = window.location.pathname;
    let urlMatch = false;
    if (settings.display_on_homepage) {
      return this.router.currentRouteName === `discovery.${defaultHomepage()}`;
    }

    if (settings.url_must_contain.length) {
      const allowedPaths = settings.url_must_contain.split("|");
      urlMatch = allowedPaths.some((allowedPath) => {
        if (allowedPath.slice(-1) === "*") {
          return path.indexOf(allowedPath.slice(0, -1)) === 0;
        }
        return path === allowedPath;
      });

      return urlMatch;
    }
  }

  get toggleLabel() {
    return this.bannerHidden
      ? I18n.t(themePrefix("toggle.expand_label"))
      : I18n.t(themePrefix("toggle.collapse_label"));
  }

  get toggleIcon() {
    return this.bannerHidden ? "chevron-down" : "chevron-up";
  }

  get columnIcons() {
    return [
      settings.first_column_icon,
      settings.second_column_icon,
      settings.third_column_icon,
      settings.fourth_column_icon,
    ];
  }

  get columnData() {
    return [
      {
        content: settings.first_column_content,
        class: "first_column",
      },
      {
        content: settings.second_column_content,
        class: "second_column",
      },
      {
        content: settings.third_column_content,
        class: "third_column",
      },
      {
        content: settings.fourth_column_content,
        class: "fourth_column",
      },
    ];
  }

  @action
  closeBanner() {
    this.bannerClosed = true;

    if (this.cookieExpirationDate) {
      const bannerState = { name: settings.cookie_name, closed: "true" };
      cookie("banner_closed", JSON.stringify(bannerState), {
        expires: this.cookieExpirationDate,
        path: "/",
      });
    }
  }

  @action
  toggleBanner() {
    this.bannerHidden = !this.bannerHidden;
    let bannerState = {
      name: settings.cookie_name,
      collapsed: this.bannerHidden,
    };

    if (this.cookieExpirationDate) {
      if (cookie("banner_collapsed")) {
        bannerState = JSON.parse(cookie("banner_collapsed"));
        bannerState.collapsed = this.bannerHidden;
      }
    } else {
      bannerState.collapsed = this.bannerHidden;
    }

    cookie("banner_collapsed", JSON.stringify(bannerState), {
      expires: this.cookieExpirationDate,
      path: "/",
    });
  }
}
