export default function migrate(settings) {
  const isOldDefault = (value) =>
    typeof value === "string" &&
    value.trim().includes("i.imgur.com/k7SnZth.jpg");

  const value = settings.get("banner_background_image");

  if (value === "") {
    // the site explicitly cleared the old imgur default to show no image;
    // an empty (as opposed to unset) upload setting now expresses that
    settings.delete("banner_background_image");
    settings.set("banner_background_upload", "");
  } else if (isOldDefault(value)) {
    settings.delete("banner_background_image");
  }

  if (isOldDefault(settings.get("banner_background_image_dark"))) {
    settings.delete("banner_background_image_dark");
  }

  return settings;
}
