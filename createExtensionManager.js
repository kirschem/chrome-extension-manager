const filePaths = require("./filePaths");
const extensionManagers = {
  win32: require("./chromeExtensionManager/windowsExtensionManager"),
  linux: require("./chromeExtensionManager/linuxExtensionManager"),
  darwin: require("./chromeExtensionManager/macOSExtensionManager")
};

function createExtensionManager() {
  const platform = process.platform;
  if (
    filePaths.hasOwnProperty(platform) &&
    extensionManagers.hasOwnProperty(platform)
  ) {
    return new extensionManagers[platform](
      filePaths[platform].chromeExtensions,
      filePaths[platform].chromeExtensionPolicies
    );
  } else {
    throw new Error("OS not supported");
  }
}

module.exports = createExtensionManager;
