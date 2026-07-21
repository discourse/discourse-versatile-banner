import { click, visit } from "@ember/test-helpers";
import { test } from "qunit";
import { acceptance } from "discourse/tests/helpers/qunit-helpers";

function setBannerCookie(name, state) {
  document.cookie = `${name}=${encodeURIComponent(
    JSON.stringify(state)
  )}; path=/;`;
}

function hasBannerCookie(name) {
  return document.cookie
    .split("; ")
    .some((entry) => entry.startsWith(`${name}=`));
}

function clearBannerCookies() {
  document.cookie = "banner_closed=; path=/; max-age=0";
  document.cookie = "banner_collapsed=; path=/; max-age=0";
}

acceptance("Versatile Banner - Logged out", function () {
  test("banner can be hidden from anons", async function (assert) {
    settings.show_for_anon = false;
    await visit("/");
    assert.dom(".banner-box").doesNotExist("hides the banner for anons");
  });

  test("banner can be shown to anons", async function (assert) {
    settings.show_for_anon = true;
    await visit("/");
    assert.dom(".banner-box").exists("shows the banner for anons");
  });
});

acceptance("Versatile Banner - Logged in", function (needs) {
  needs.user();

  test("banner can be hidden from members", async function (assert) {
    settings.show_for_members = false;
    await visit("/");
    assert.dom(".banner-box").doesNotExist("hides the banner for members");
  });

  test("banner can be shown to members", async function (assert) {
    settings.show_for_members = true;
    await visit("/");
    assert.dom(".banner-box").exists("shows the banner for members");
  });
});

acceptance("Versatile Banner - Routing", function () {
  settings.show_for_anon = true;
  settings.url_must_contain = "/c/*";

  test("banner is visible on the homepage", async function (assert) {
    settings.display_on_homepage = true;
    await visit("/");
    assert.dom(".banner-box").exists("shows the banner on the homepage");
  });

  test("banner is hidden from the homepage", async function (assert) {
    settings.display_on_homepage = false;
    await visit("/");
    assert.dom(".banner-box").doesNotExist("hides the banner on the homepage");
  });

  test("banner is visible on a set route", async function (assert) {
    settings.display_on_homepage = false;
    await visit("/c/1");

    assert.dom(".banner-box").exists("shows the banner on the /c/* route");
  });

  test("banner is not visible on other routes", async function (assert) {
    settings.display_on_homepage = false;
    await visit("/u");

    assert
      .dom(".banner-box")
      .doesNotExist("does not show the banner on the /u route");
  });
});

acceptance("Versatile Banner - Visibility", function () {
  test("banner can be expanded", async function (assert) {
    settings.show_for_anon = true;
    settings.collapsible = true;
    settings.default_collapsed_state = "collapsed";

    const encodedCookieValue = encodeURIComponent(
      JSON.stringify({
        name: "v1",
        collapsed: true,
      })
    );

    document.cookie = `banner_collapsed=${encodedCookieValue}; path=/;`;

    await visit("/");
    await click("button.toggle");

    assert
      .dom(".--banner-collapsed")
      .doesNotExist("the banner does not have the collapsed class");
  });

  test("banner can be collapsed", async function (assert) {
    settings.collapsible = true;
    settings.default_collapsed_state = "expanded";

    const encodedCookieValue = encodeURIComponent(
      JSON.stringify({
        name: "v1",
        collapsed: false,
      })
    );

    document.cookie = `banner_collapsed=${encodedCookieValue}; path=/;`;

    await visit("/");
    await click(".banner-box button.toggle");

    assert
      .dom(".--banner-collapsed")
      .exists("the banner has the collapsed class");
  });

  test("banner can be dismissed", async function (assert) {
    settings.dismissible = true;
    settings.cookie_lifespan = "none";

    await visit("/");
    await click(".banner-box button.close");

    assert.dom(".banner-box").doesNotExist("the banner can be dismissed");
  });
});

acceptance("Versatile Banner - Cookie state", function (needs) {
  needs.hooks.beforeEach(function () {
    clearBannerCookies();
    settings.show_for_anon = true;
    settings.cookie_lifespan = "week";
  });

  test("a matching closed cookie hides the banner", async function (assert) {
    settings.cookie_name = "v1";
    setBannerCookie("banner_closed", { name: "v1", closed: "true" });

    await visit("/");

    assert.dom(".banner-box").doesNotExist("the banner stays dismissed");
  });

  test("a stale closed cookie brings the banner back", async function (assert) {
    settings.cookie_name = "v2";
    setBannerCookie("banner_closed", { name: "v1", closed: "true" });

    await visit("/");

    assert
      .dom(".banner-box")
      .exists("changing cookie_name re-displays a dismissed banner");
  });

  test("a matching collapsed cookie collapses the banner", async function (assert) {
    settings.collapsible = true;
    settings.default_collapsed_state = "expanded";
    settings.cookie_name = "v1";
    setBannerCookie("banner_collapsed", { name: "v1", collapsed: true });

    await visit("/");

    assert.dom(".--banner-collapsed").exists("the banner stays collapsed");
  });

  test("a stale collapsed cookie falls back to the default state", async function (assert) {
    settings.collapsible = true;
    settings.default_collapsed_state = "expanded";
    settings.cookie_name = "v2";
    setBannerCookie("banner_collapsed", { name: "v1", collapsed: true });

    await visit("/");

    assert
      .dom(".--banner-collapsed")
      .doesNotExist("changing cookie_name re-expands a collapsed banner");
  });

  test("a malformed cookie is ignored", async function (assert) {
    settings.cookie_name = "v1";
    document.cookie = "banner_closed=not-json; path=/;";

    await visit("/");

    assert.dom(".banner-box").exists("the banner renders instead of erroring");
    assert.false(hasBannerCookie("banner_closed"), "the bad cookie is cleared");
  });

  test("a stale cookie is cleared rather than left to expire", async function (assert) {
    settings.cookie_name = "v2";
    setBannerCookie("banner_closed", { name: "v1", closed: "true" });

    await visit("/");

    assert.false(
      hasBannerCookie("banner_closed"),
      "the stale cookie is removed"
    );
  });

  test("widget-era string values are honoured", async function (assert) {
    settings.collapsible = true;
    settings.default_collapsed_state = "expanded";
    settings.cookie_name = "v1";
    setBannerCookie("banner_collapsed", { name: "v1", collapsed: "true" });

    await visit("/");

    assert
      .dom(".--banner-collapsed")
      .exists('a legacy collapsed: "true" cookie still collapses the banner');
  });

  test('widget-era collapsed: "false" does not collapse the banner', async function (assert) {
    settings.collapsible = true;
    settings.default_collapsed_state = "collapsed";
    settings.cookie_name = "v1";
    setBannerCookie("banner_collapsed", { name: "v1", collapsed: "false" });

    await visit("/");

    assert
      .dom(".--banner-collapsed")
      .doesNotExist('the string "false" is not treated as truthy');
  });
});

acceptance("Versatile Banner - Cookie lifespan none", function (needs) {
  needs.hooks.beforeEach(function () {
    clearBannerCookies();
    settings.show_for_anon = true;
    settings.cookie_name = "v1";
    settings.cookie_lifespan = "none";
  });

  test("existing cookies are discarded on load", async function (assert) {
    setBannerCookie("banner_closed", { name: "v1", closed: "true" });

    await visit("/");

    assert
      .dom(".banner-box")
      .exists("the banner is not suppressed by a cookie");
    assert.false(hasBannerCookie("banner_closed"), "the cookie is removed");
  });

  test("collapsing does not write a cookie", async function (assert) {
    settings.collapsible = true;
    settings.default_collapsed_state = "expanded";

    await visit("/");
    await click(".banner-box button.toggle");

    assert.dom(".--banner-collapsed").exists("the banner collapses in-session");
    assert.false(
      hasBannerCookie("banner_collapsed"),
      "no collapsed cookie is persisted"
    );
  });
});
