const ExtensionManager = require("./extensionManager");
const ElevatedCommandExecutor = require("../elevatedCommandExecutor");
const path = require("path");
const executeCommand = require("../executeCommand");
const fs = require("fs").promises;

class MacOSExtensionManager extends ExtensionManager {
  _policiesFileName = "com.google.Chrome.plist";
  _policiesFile = path.join(this._policiesDir, this._policiesFileName);

  async _reloadPlistFile() {
    const cmd = `defaults read ${this._policiesFile}`;
    await executeCommand(cmd);
  }

  async _readPlistFile() {
    try {
      const cmd = `plutil -convert json ${this._policiesFile}`;
      await executeCommand(cmd);
      const jsonContent = await fs
        .readFile(this._policiesFile)
        .then(content => JSON.parse(content));

      return jsonContent;
    } catch (error) {
      console.error("Method '_readPlistFile failed...'");
      throw error;
    } finally {
      const cmd = `plutil -convert binary1 ${this._policiesFile}`;
      await executeCommand(cmd);
    }
  }

  _writePlistFile(plistJsonObj) {
    // TODO: Overwrite plist file and convert to binary
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
}

module.exports = MacOSExtensionManager;
