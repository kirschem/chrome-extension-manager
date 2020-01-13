const _fs = require("fs");
const ExtensionManager = require("./ExtensionManager");
const path = require("path");
const { app } = require("electron");
const fs = _fs.promises;

class WindowsExtensionManager extends ExtensionManager {
  _localesFolder = "_locales";

  _getLocale() {
    return app.getLocale();
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

  async listExtensions() {
    const extensionIds = await fs.readdir(this._extensionDir);
    return Promise.all(
      extensionIds.map(async id => {
        const versionFolder = (
          await fs.readdir(path.join(this._extensionDir, id))
        )[0];

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

        return {
          name: manifest["name"],
          version: manifest["version"],
          id: id
        };
      })
    );
  }
}

module.exports = WindowsExtensionManager;
