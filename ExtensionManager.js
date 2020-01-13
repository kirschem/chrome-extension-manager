class ExtensionManager {
  constructor(extensionDir, policiesDir) {
    if (new.target === ExtensionManager) {
      throw new TypeError(
        "Cannot create instance of abstract class ExtensionManager"
      );
    }
    this._extensionDir = extensionDir;
    this._policiesDir = policiesDir;
  }

  async listExtensions() {
    throw new TypeError("Must override method");
  }

  async enableExtension(id) {
    throw new TypeError("Must override method");
  }

  async disableExtension(id) {
    throw new TypeError("Must override method");
  }
}

module.exports = ExtensionManager;
