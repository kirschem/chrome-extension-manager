const _fs = require("fs");
const path = require("path");
const { app } = require("electron");
const fs = _fs.promises;

class ExtensionManager {
  _localesFolder = "_locales";

  constructor(extensionDir, policiesDir) {
    // Removed for easier testing
    // if (new.target === ExtensionManager) {
    //   throw new TypeError(
    //     "Cannot create instance of abstract class ExtensionManager"
    //   );
    // }
    this._extensionDir = extensionDir;
    this._policiesDir = policiesDir;
  }

  async listExtensions() {
    const extensionIds = await fs.readdir(this._extensionDir);
    const disabledExtensionIds = await this._getDisabledExtensionIds();
    return Promise.all(
      extensionIds.map(async id => {
        try {
          // Get the version folder first, that contains the extension's src
          const versionFolder = (
            await fs.readdir(path.join(this._extensionDir, id))
          )[0];

          // Get the manifest
          const manifest = await fs
            .readFile(
              path.join(this._extensionDir, id, versionFolder, "manifest.json")
            )
            .then(buffer => JSON.parse(buffer));

          // Get translated extension name
          if (manifest["name"].startsWith("__")) {
            manifest["name"] = await this._retrieveTranslation(
              manifest["name"],
              path.join(this._extensionDir, id, versionFolder)
            );
          }

          // Get the icon
          const iconSrc = manifest["icons"]
            ? await this._retrieveIconAsBase64DataUri(
                path.join(
                  this._extensionDir,
                  id,
                  versionFolder,
                  manifest["icons"]["128"]
                )
              )
            : "";

          return {
            name: manifest["name"],
            version: manifest["version"],
            id: id,
            iconSrc: iconSrc,
            disabled: disabledExtensionIds.find(_id => _id === id)
          };
        } catch (error) {
          console.error(
            "Could not process extension with id '%s': %o",
            id,
            error
          );
          return null;
        }
      })
    ).then(results => results.filter(ext => ext !== null));
  }

  async _getDisabledExtensionIds() {
    throw new TypeError("Must override method");
  }

  async enableExtension(id) {
    throw new TypeError("Must override method");
  }

  async disableExtension(id) {
    throw new TypeError("Must override method");
  }

  _getLocale() {
    return app.getLocale();
  }

  async _retrieveIconAsBase64DataUri(iconPath) {
    const ext = path.extname(iconPath).substr(1);
    const base64 = await fs.readFile(iconPath, { encoding: "base64" });
    return `data:image/${ext};base64,${base64}`;
  }

  async _retrieveTranslation(key, extensionPath) {
    const localesPath = path.join(extensionPath, this._localesFolder);
    key = key.replace("MSG_", "").replace(/__/g, "");

    // Some translations are lowercase regardless of caml case key, some respect case sensitivity
    const bufferToTranslation = buffer => {
      const translations = JSON.parse(buffer);
      return translations[key]
        ? translations[key].message
        : translations[key.toLowerCase()].message;
    };

    try {
      // Try user's current locale first
      await fs
        .readFile(path.join(extensionPath, this._getLocale, "messages.json"))
        .then(bufferToTranslation);
    } catch (error) {
      // Otherwise get the first english version we can find
      const englishLocaleFolder = await (
        await fs.readdir(localesPath)
      ).find(locale => locale.startsWith("en"));
      if (englishLocaleFolder) {
        return await fs
          .readFile(
            path.join(localesPath, englishLocaleFolder, "messages.json")
          )
          .then(bufferToTranslation);
      }
    }

    // Return back the key if there was no appropriate translation found
    console.warn(
      "Could not find appropriate translation for extension in path: %s",
      extensionPath
    );
    return key;
  }
}

module.exports = ExtensionManager;
