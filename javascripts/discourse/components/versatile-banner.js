import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";
import { service } from "@ember/service";
import cookie, { removeCookie } from "discourse/lib/cookie";
import { convertIconClass } from "discourse/lib/icon-library";
import { defaultHomepage } from "discourse/lib/utilities";
import { i18n } from "discourse-i18n";

export default class VersatileBanner extends Component {
  @service router;
  @service site;
  @service currentUser;
  @tracked bannerClosed = this.cookieClosed || false;
  @tracked
  bannerCollapsed =
    this.collapsedFromCookie !== null
      ? this.collapsedFromCookie
      : this.isDefaultCollapsed;

  cookieClosed = cookie("banner_closed");
  cookieCollapsed = cookie("banner_collapsed");
  isDefaultCollapsed = settings.default_collapsed_state === "collapsed";
  collapsedFromCookie = this.cookieCollapsed
    ? JSON.parse(this.cookieCollapsed).collapsed
    : null;
  columnData = [
    {
      content: settings.first_column_content,
      class: "first_column",
      icon: convertIconClass(settings.first_column_icon),
    },
    {
      content: settings.second_column_content,
      class: "second_column",
      icon: convertIconClass(settings.second_column_icon),
    },
    {
      content: settings.third_column_content,
      class: "third_column",
      icon: convertIconClass(settings.third_column_icon),
    },
    {
      content: settings.fourth_column_content,
      class: "fourth_column",
      icon: convertIconClass(settings.fourth_column_icon),
    },
  ];

  get cookieExpirationDate() {
    if (settings.cookie_lifespan === "none") {
      removeCookie("banner_closed", { path: "/" });
      removeCookie("banner_collapsed", { path: "/" });
    } else {
      return moment().add(1, settings.cookie_lifespan).toDate();
    }
  }

  get displayForUser() {
    return (
      (settings.show_for_members && this.currentUser) ||
      (settings.show_for_anon && !this.currentUser)
    );
  }

  get showOnRoute() {
    const path = this.router.currentURL;

    if (
      settings.display_on_homepage &&
      this.router.currentRouteName === `discovery.${defaultHomepage()}`
    ) {
      return true;
    }

    if (settings.url_must_contain.length) {
      const allowedPaths = settings.url_must_contain.split("|");
      return allowedPaths.some((allowedPath) => {
        if (allowedPath.slice(-1) === "*") {
          return path.indexOf(allowedPath.slice(0, -1)) === 0;
        }
        return path === allowedPath;
      });
    }
  }

  get shouldShow() {
    return this.displayForUser && this.showOnRoute;
  }

  get toggleLabel() {
    return this.bannerCollapsed
      ? i18n(themePrefix("toggle.expand_label"))
      : i18n(themePrefix("toggle.collapse_label"));
  }

  get toggleIcon() {
    return this.bannerCollapsed ? "chevron-down" : "chevron-up";
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
    this.bannerCollapsed = !this.bannerCollapsed;
    let bannerState = {
      name: settings.cookie_name,
      collapsed: this.bannerCollapsed,
    };

    if (this.cookieExpirationDate) {
      if (this.cookieCollapsed) {
        bannerState = JSON.parse(this.cookieCollapsed);
        bannerState.collapsed = this.bannerCollapsed;
      }
    } else {
      bannerState.collapsed = this.bannerCollapsed;
    }

    cookie("banner_collapsed", JSON.stringify(bannerState), {
      expires: this.cookieExpirationDate,
      path: "/",
    });
  }
}
