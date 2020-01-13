module.exports = {
  win32: {
    chromeExtensions:
      process.env.APPDATA +
      "\\..\\Local\\Google\\Chrome\\User Data\\Default\\Extensions",
    chromeExtensionPolicies:
      "SoftwarePoliciesGoogleChromeExtensionInstallBlacklist"
  },
  darwin: {},
  linux: {}
};
