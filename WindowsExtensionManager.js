const _fs = require("fs");
const ExtensionManager = require("./ExtensionManager");
const fs = _fs.promises;

class WindowsExtensionManager extends ExtensionManager {
  async listExtensions() {
    const extensionDirFiles = await fs.readdir(this._extensionDir);
    return extensionDirFiles;
  }
}

module.exports = WindowsExtensionManager;
