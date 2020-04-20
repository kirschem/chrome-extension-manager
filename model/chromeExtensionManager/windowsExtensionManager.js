const ExtensionManager = require("./extensionManager");
const ElevatedCommandExecutor = require("../../util/elevatedCommandExecutor");
const executeCommand = require("../../util/executeCommand");
const openChrome = require("../../util/openChrome");
const { clipboard, dialog } = require("electron");

class WindowsExtensionManager extends ExtensionManager {
  _parseRegQueryResult(regQueryResult) {
    const regex = /[\w()]* *REG_SZ *\w*/gm;
    const matches = regQueryResult.match(regex);
    if (!matches) {
      return [];
    }

    return matches.map((match) => {
      match = match.replace(/  +/g, " ");
      const matchData = match.split(" ");
      const key = matchData[0];
      const value = matchData[2];
      return {
        key,
        value,
      };
    });
  }

  async _getDisabledExtensionData() {
    const cmd = `reg query ${this._policiesDir}`;
    try {
      const regQueryResult = await executeCommand(cmd);
      const parsedRegQueryResult = this._parseRegQueryResult(regQueryResult);
      return parsedRegQueryResult.filter(
        (pair) => pair.value && parseInt(pair.key, 10) !== NaN
      );
    } catch (error) {
      console.error(
        "Failed querying disabled extensions from registry. Reason: %s",
        error
      );
      return [];
    }
  }

  async _getDisabledExtensionIds() {
    return await this._getDisabledExtensionData().then((result) =>
      result.map((pair) => pair.value)
    );
  }

  async disableExtension(id) {
    const prevKeyNames = await this._getDisabledExtensionData().then((result) =>
      result.map((pair) => parseInt(pair.key)).sort()
    );
    const newKeyName =
      prevKeyNames.length > 0 ? prevKeyNames[prevKeyNames.length - 1] + 1 : 1;
    const cmd = `reg ADD ${this._policiesDir} /t REG_SZ /d ${id} /v ${newKeyName} /f`;
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
    let regValuesToDelete = [];
    try {
      const queryResult = await executeCommand(cmd);
      regValuesToDelete = this._parseRegQueryResult(queryResult).map(
        (pair) => pair.key
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
      regValuesToDelete.map(async (regValue) => {
        const delCmd = `reg delete ${this._policiesDir} /v "${regValue}" /f`;
        try {
          const cmdExecutor = new ElevatedCommandExecutor();
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

    await this._updatePolicySettings();
  }

  async _updatePolicySettings() {
    // TODO: This does not work. Chrome does not apply the policy from registry.
    // Maybe just open the chrome://policy page and ask the user to refresh manually.
    // const cmd = "gpupdate /force";
    // try {
    //   return executeCommand(cmd);
    // } catch (error) {
    //   console.error(
    //     "Error during update of policy settings. Reason: %s",
    //     error
    //   );
    // }

    // Workaround: Instruct the user the manually reload policies (chrome settings pages must be typed in manually by the user,
    // see https://stackoverflow.com/questions/35624774/how-to-open-chrome-inspect-devices-using-command-prompt)

    clipboard.writeText("chrome://policy");
    dialog
      .showMessageBox({
        type: "info",
        buttons: ["Open Chrome", "Cancel"],
        title: "Chrome Extension Manager",
        detail:
          "The URL has already been copied to your clipboard. Just paste it into the address bar.",
        message:
          "Please open 'chrome://policy' and hit the 'Refresh Policies' button to apply the changes.",
      })
      .then((clickedBtn) => clickedBtn === 0 && openChrome());
  }
}

module.exports = WindowsExtensionManager;
