const ExtensionManager = require("./extensionManager");
const path = require("path");
const fs = require("fs").promises;
const { dialog } = require("electron");

class MacOSExtensionManager extends ExtensionManager {
  _policiesFileName = "com.google.Chrome.plist";
  _policiesFile = path.join(this._policiesDir, this._policiesFileName);

  async _reloadPlistFile() {
    const cmd = `defaults read ${this._policiesFile}`;
    await this._commandExecutor.execute(cmd, true);
    dialog.showMessageBox({
      type: "info",
      title: "Chrome Extension Manager",
      message: "You need to re-open Chrome for the changes to take effect.",
    });
  }

  async _readPlistFile() {
    try {
      const cmd = `plutil -convert json ${this._policiesFile}`;
      await this._commandExecutor.execute(cmd, true);
      const jsonContent = await fs
        .readFile(this._policiesFile)
        .then((content) => JSON.parse(content));

      return jsonContent;
    } catch (error) {
      console.error("Method '_readPlistFile failed...'", error);
      throw error;
    } finally {
      const cmd = `plutil -convert binary1 ${this._policiesFile}`;
      await this._commandExecutor.execute(cmd, true);
    }
  }

  async _writePlistFile(plistJsonObj) {
    // Backup old plist
    // TODO: Maybe add a hash of plistJsonObj as part of the filename
    const backupFile = this._policiesFile + ".BAK";
    try {
      fs.copyFile(this._policiesFile, backupFile);
    } catch (error) {
      console.error(
        "_writePlistFile: could not backup file '%s', aborting...",
        backupFile
      );
      throw error;
    }

    // Overwrite plist
    try {
      await fs.writeFile(this._policiesFile, JSON.stringify(plistJsonObj));
      const cmd = `plutil -convert binary1 ${this._policiesFile}`;
      await this._commandExecutor.execute(cmd, true);
    } catch (error) {
      console.error(
        "_writePlistFile: could not overwrite file  '%s', restoring backup...",
        this._policiesFile
      );
      try {
        await fs.copyFile(backupFile, this._policiesFile);
      } catch (error) {
        console.error(
          "_writePlistFile: error restoring backup '%s'",
          backupFile
        );
        throw error;
      }
    }

    // Clean backup
    try {
      return fs.unlink(backupFile);
    } catch (error) {
      console.error("_writePlistFile: error deleting backup '%s'", backupFile);
    }
  }

  async _getDisabledExtensionIds() {
    const plistContent = await this._readPlistFile();
    const extInstallBlacklist = plistContent.ExtensionInstallBlacklist;
    if (!extInstallBlacklist) {
      return [];
    }
    return extInstallBlacklist;
  }

  async enableExtension(id, noReload = false) {
    const plistContent = await this._readPlistFile();
    const extInstallBlacklist = plistContent.ExtensionInstallBlacklist;
    if (!extInstallBlacklist) {
      return;
    }
    const newBlackllist = extInstallBlacklist.filter((x) => x !== id);
    plistContent.ExtensionInstallBlacklist = newBlackllist;
    await this._writePlistFile(plistContent);
    if (!noReload) {
      await this._reloadPlistFile();
    }
  }

  async disableExtension(id, noReload = false) {
    const plistContent = await this._readPlistFile();
    if (!plistContent.ExtensionInstallBlacklist) {
      plistContent.ExtensionInstallBlacklist = [];
    }
    plistContent.ExtensionInstallBlacklist.push(id);
    await this._writePlistFile(plistContent);
    if (!noReload) {
      await this._reloadPlistFile();
    }
  }
}

module.exports = MacOSExtensionManager;
