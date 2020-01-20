const _fs = require("fs");
const path = require("path");
const fs = _fs.promises;
const ExtensionManager = require("./ExtensionManager");

class LinuxExtensionManager extends ExtensionManager {
  async _getPolicyFileWithExtension(files, extensionId) {
    const jsonPolicies = await Promise.all(
      files.map(async file => {
        return {
          file: file,
          content: await fs.readFile(file).then(file => JSON.parse(file))
        };
      })
    );

    return jsonPolicies.filter(jsonPolicy =>
      this._policyContainsExtension(jsonPolicy.content, extensionId)
    )[0].file;
  }

  _policyContainsExtension(policyContent, extensionId) {
    if (policyContent.ExtensionSettings) {
      return policyContent.ExtensionSettings.hasOwnProperty(extensionId);
    }
    return false;
  }

  async _getPolicyFiles() {
    const policyFolders = await fs.readdir(this._policiesDir);
    const policyFiles = [];

    if (policyFolders.find(dirName => dirName === "managed")) {
      await fs
        .readdir(path.join(this._policiesDir, "managed"))
        .then(files =>
          files.map(file => path.join(this._policiesDir, "managed", file))
        )
        .then(files => policyFiles.push(...files));
    }

    return policyFiles;
  }

  async _getDisabledExtensionIds() {
    const policyFiles = await this._getPolicyFiles();

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

    for (const policyFile of policyFiles) {
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

  async enableExtension(id) {
    const policyFiles = await this._getPolicyFiles();
    const policyFileWithExtension = await this._getPolicyFileWithExtension(
      policyFiles,
      id
    );

    const jsonPolicy = await fs
      .readFile(policyFileWithExtension)
      .then(content => JSON.parse(content));

    jsonPolicy.ExtensionSettings[id].installation_mode = "blocked";

    // TODO: run as root
    return fs.writeFile(policyFileWithExtension, JSON.stringify(jsonPolicy));
  }
}

module.exports = LinuxExtensionManager;
