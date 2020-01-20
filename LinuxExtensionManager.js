const _fs = require("fs");
const path = require("path");
const fs = _fs.promises;
const ExtensionManager = require("./ExtensionManager");

class LinuxExtensionManager extends ExtensionManager {
  async _getDisabledExtensionIds() {
    const policyFolders = await fs.readdir(this._policiesDir);
    const policieFiles = [];

    if (policyFolders.find(dirName => dirName === "managed")) {
      await fs
        .readdir(path.join(this._policiesDir, "managed"))
        .then(files =>
          files.map(file => path.join(this._policiesDir, "managed", file))
        )
        .then(files => policieFiles.push(...files));
    }

    // Disabling extensions in /recommended seems to have no effect
    // if (policyFolders.find(dirName => dirName === "recommended")) {
    //   await fs
    //     .readdir(path.join(this._policiesDir, "recommended"))
    //     .then(files =>
    //       files.map(file => path.join(this._policiesDir, "recommended", file))
    //     )
    //     .then(files => policieFiles.push(...files));
    // }

    const disabledExtensionIds = [];

    for (const policyFile of policieFiles) {
      const jsonPolicy = await fs
        .readFile(policyFile)
        .then(file => JSON.parse(file));
      if (jsonPolicy.ExtensionSettings) {
        const idsInFile = Object.keys(jsonPolicy.ExtensionSettings).filter(
          id => {
            if (
              jsonPolicy.ExtensionSettings.hasOwnProperty(id) &&
              jsonPolicy.ExtensionSettings[id].installation_mode &&
              jsonPolicy.ExtensionSettings[id].installation_mode === "blocked"
            ) {
              return true;
            }
          },
          []
        );
        disabledExtensionIds.push(...idsInFile);
      }
    }

    return disabledExtensionIds;
  }
}

module.exports = LinuxExtensionManager;
