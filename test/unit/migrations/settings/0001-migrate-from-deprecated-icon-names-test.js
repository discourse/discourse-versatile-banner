import { module, test } from "qunit";
import migrate from "../../../../migrations/settings/0001-migrate-from-deprecated-icon-names";

module(
  "Unit | Migrations | Settings | 0001-migrate-from-deprecated-icon-names",
  function () {
    test("migrate", function (assert) {
      const settings = new Map(
        Object.entries({
          first_column_icon: "",
          second_column_icon: "cog",
          third_column_icon: "",
          fourth_column_icon: "far fa-wrench",
        })
      );

      const result = migrate(settings);

      const expectedResult = new Map(
        Object.entries({
          first_column_icon: "",
          second_column_icon: "gear",
          third_column_icon: "",
          fourth_column_icon: "far-wrench",
        })
      );
      assert.deepEqual(Array.from(result), Array.from(expectedResult));
    });

    test("migrate empty settings", function (assert) {
      const settings = new Map(Object.entries({}));
      const result = migrate(settings);
      assert.deepEqual(Array.from(result), Array.from(settings));
    });

    test("migrate same settings", function (assert) {
      const settings = new Map(
        Object.entries({
          first_column_icon: "",
          second_column_icon: "gear",
          third_column_icon: "",
          fourth_column_icon: "far-wrench",
        })
      );
      const result = migrate(settings);
      assert.deepEqual(Array.from(result), Array.from(settings));
    });
  }
);
