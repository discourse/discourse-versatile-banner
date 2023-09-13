import { acceptance } from "discourse/tests/helpers/qunit-helpers";
import { test } from "qunit";
import { click, visit } from "@ember/test-helpers";

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
