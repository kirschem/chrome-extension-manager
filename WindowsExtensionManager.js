const _fs = require("fs");
const path = require("path");
const fs = _fs.promises;
const ExtensionManager = require("./ExtensionManager");

class WindowsExtensionManager extends ExtensionManager {
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
          iconSrc: iconSrc
        };
      })
    );
  }
}

module.exports = WindowsExtensionManager;
