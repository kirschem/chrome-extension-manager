module.exports = {
  win32: {
    chromeExtensions:
      process.env.APPDATA +
      "\\..\\Local\\Google\\Chrome\\User Data\\Default\\Extensions",
    chromeExtensionPolicies:
      "HKEY_LOCAL_MACHINE\\Software\\Policies\\Google\\ExtensionInstallBlacklist"
  },
  darwin: {},
  linux: {
    chromeExtensions:
      process.env.HOME + "/.config/google-chrome/Default/Extensions",
    chromeExtensionPolicies: "/etc/opt/chrome/policies/"
  }
};
