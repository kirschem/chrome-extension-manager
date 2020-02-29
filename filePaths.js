module.exports = {
  win32: {
    chromeExtensions:
      process.env.APPDATA +
      "\\..\\Local\\Google\\Chrome\\User Data\\Default\\Extensions",
    chromeExtensionPolicies:
      "HKEY_LOCAL_MACHINE\\Software\\Policies\\Google\\Chrome\\ExtensionInstallBlacklist"
  },
  darwin: {
    chromeExtensions:
      process.env.HOME + "/Library/Application Support/Google/Chrome/Default",
    chromeExtensionPolicies: process.env.HOME + "/Library/Preferences"
  },
  linux: {
    chromeExtensions:
      process.env.HOME + "/.config/google-chrome/Default/Extensions",
    chromeExtensionPolicies: "/etc/opt/chrome/policies/"
  }
};
