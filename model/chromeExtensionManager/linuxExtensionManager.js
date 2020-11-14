const _fs = require("fs");
const path = require("path");
const fs = _fs.promises;
const ExtensionManager = require("./extensionManager");

class LinuxExtensionManager extends ExtensionManager {
  async _getPolicyFileWithExtension(files, extensionId) {
    const jsonPolicies = await Promise.all(
      files.map(async (file) => {
        return {
          file: file,
          content: await fs
            .readFile(file)
            .then((contents) => JSON.parse(contents)),
        };
      })
    );

    const policiesWithId = jsonPolicies.filter((jsonPolicy) =>
      this._policyContainsExtension(jsonPolicy.content, extensionId)
    );
    return policiesWithId.length > 0 ? policiesWithId[0].file : null;
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

    if (policyFolders.find((dirName) => dirName === "managed")) {
      await fs
        .readdir(path.join(this._policiesDir, "managed"))
        .then((files) =>
          files.map((file) => path.join(this._policiesDir, "managed", file))
        )
        .then((files) => policyFiles.push(...files));
    }

    return policyFiles;
  }

  async _getDisabledExtensionIds() {
    const policyFiles = await this._getPolicyFiles();
    const disabledExtensionIds = [];

    for (const policyFile of policyFiles) {
      const jsonPolicy = await fs
        .readFile(policyFile)
        .then((file) => JSON.parse(file));
      if (jsonPolicy.ExtensionSettings) {
        const idsInFile = Object.keys(jsonPolicy.ExtensionSettings).filter(
          (id) => {
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

  async disableExtension(id) {
    const policyFiles = await this._getPolicyFiles();
    const policyFileWithExtension = await this._getPolicyFileWithExtension(
      policyFiles,
      id
    );

    let policyFileContents = {};
    if (policyFileWithExtension) {
      // Policy file with settings for this extension already exists
      // Overwrite only installation_mode
      policyFileContents = await fs
        .readFile(policyFileWithExtension)
        .then((content) => JSON.parse(content));
      policyFileContents.ExtensionSettings[id] = {
        installation_mode: "blocked",
      };
    } else {
      // No policy file with extension settings exists yet
      // => create new file
      policyFileContents = {
        ExtensionSettings: { [id]: { installation_mode: "blocked" } },
      };
    }

    const cmd = `echo '${JSON.stringify(policyFileContents)}' > ${
      policyFileWithExtension
        ? policyFileWithExtension
        : path.join(this._policiesDir, "managed", "chrome-ext-manager.json")
    }`;
    const cmdExecutor = this._commandExecutor;
    return cmdExecutor.execute(cmd);
  }

  async enableExtension(id) {
    const policyFiles = await this._getPolicyFiles();
    const policyFileWithExtension = await this._getPolicyFileWithExtension(
      policyFiles,
      id
    );

    let policyFileContents = await fs
      .readFile(policyFileWithExtension)
      .then((content) => JSON.parse(content));

    policyFileContents.ExtensionSettings[id].installation_mode = "allowed";

    const cmd = `echo '${JSON.stringify(
      policyFileContents
    )}' > ${policyFileWithExtension}`;
    const cmdExecutor = this._commandExecutor;
    return cmdExecutor.execute(cmd);
  }
}

module.exports = LinuxExtensionManager;
