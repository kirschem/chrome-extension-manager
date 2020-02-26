const ExtensionManager = require("./ExtensionManager");
const ElevatedCommandExecutor = require("./ElevatedCommandExecutor");
const executeCommand = require("./executeCommand");

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
    try {
      const regQueryResult = await cmdExecutor.execute(cmd);
      const parsedRegQueryResult = this._parseRegQueryResult(regQueryResult);
      return parsedRegQueryResult
        .filter(pair => pair.value)
        .map(pair => pair.value);
    } catch (error) {
      console.error(
        "Failed querying disabled extensions from registry. Reason: %s",
        error
      );
      return [];
    }
  }

  async disableExtension(id) {
    const cmd = `reg ADD ${this._policiesDir} /t REG_SZ /d ${id} /v ${id} /f`;
    const cmdExecutor = new ElevatedCommandExecutor();
    try {
      await cmdExecutor.execute(cmd);
      return this._updatePolicySettings();
    } catch (error) {
      console.error("Failed disabling extension %s. Reason: %s", id, error);
      return;
    }
  }

  async enableExtension(id) {
    const cmd = `reg query ${this._policiesDir} /d /f ${id}`;
    const cmdExecutor = new ElevatedCommandExecutor();
    let regValuesToDelete = [];
    try {
      const queryResult = await cmdExecutor.execute(cmd);
      regValuesToDelete = this._parseRegQueryResult(queryResult).map(
        pair => pair.key
      );
      if (regValuesToDelete.length === 0) {
        // TODO: error handling
        return;
      }
    } catch (error) {
      console.error(
        "Failed querying for disabled extension with id '%s'. Reason: %s",
        id,
        error
      );
      return;
    }

    await Promise.all(
      regValuesToDelete.map(async regValue => {
        const delCmd = `reg delete ${this._policiesDir} /v "${regValue}" /f`;
        try {
          return await cmdExecutor.execute(delCmd);
        } catch (error) {
          console.error(
            "Enabling extension with id %s: Could not delete '%s' under %s. Reason: %s",
            id,
            regValue,
            error
          );
          return Promise.resolve();
        }
      })
    );
  }

  async _updatePolicySettings() {
    // TODO: This does not work. Chrome does not apply the policy from registry. Using /force causes old values to be set.
    // Research HKLM vs HKCU
    const cmd = "gpupdate";
    try {
      return executeCommand(cmd);
    } catch (error) {
      console.error(
        "Error during update of policy settings. Reason: %s",
        error
      );
    }
  }
}

module.exports = WindowsExtensionManager;
