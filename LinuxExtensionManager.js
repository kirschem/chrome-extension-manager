const _fs = require("fs");
const path = require("path");
const fs = _fs.promises;
const ExtensionManager = require("./ExtensionManager");

class LinuxExtensionManager extends ExtensionManager {}

module.exports = LinuxExtensionManager;
