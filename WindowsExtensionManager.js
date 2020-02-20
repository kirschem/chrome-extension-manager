const _fs = require("fs");
const path = require("path");
const fs = _fs.promises;
const ExtensionManager = require("./ExtensionManager");
const ElevatedCommandExecutor = require("./ElevatedCommandExecutor");

class WindowsExtensionManager extends ExtensionManager {
  _parseRegQueryResult(regQueryResult) {
    const regex = /[\w()]* *REG_SZ *\w*/gm;
    const matches = regQueryResult.match(regex);
    if (matches.length === 0) {
      return [];
    }

    return matches.map(match => {
      match = match.replace(/  +/g, " ");
      const matchData = match.split(" ");
      const key = matchData[0];
      const value = matchData[2];
      return {
        key,
        value
      };
    });
  }

  async _getDisabledExtensionIds() {
    const cmd = `reg query ${this._policiesDir}`;
    const cmdExecutor = new ElevatedCommandExecutor();
    const regQueryResult = await cmdExecutor.execute(cmd);
    if (regQueryResult.stderr || regQueryResult.error) {
      console.error(
        "Failed querying disabled extensions from registry. Reason: %s",
        regQueryResult.error || regQueryResult.stderr
      );
      return [];
    }
    const parsedRegQueryResult = this._parseRegQueryResult(
      regQueryResult.stdout
    );

    // TODO: extract ids from parsed reg query result
    return [];
  }

  async disableExtension(id) {}

  async enableExtension(id) {
    const cmd = `reg ADD ${this._policiesDir} /t REG_SZ /d ${id}`;
    const cmdExecutor = new ElevatedCommandExecutor();
    await cmdExecutor.execute(cmd);
    return this._updatePolicySettings();
  }

  async _updatePolicySettings() {
    const cmd = "gpupdate /force";
    const cmdExecutor = new ElevatedCommandExecutor();
    return cmdExecutor.execute(cmd);
  }
}

module.exports = WindowsExtensionManager;
