const _fs = require("fs");
const path = require("path");
const fs = _fs.promises;
const ExtensionManager = require("./ExtensionManager");

class WindowsExtensionManager extends ExtensionManager {}

module.exports = WindowsExtensionManager;
