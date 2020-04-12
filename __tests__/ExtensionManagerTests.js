const createExtensionManager = require("../chromeExtensionManager/createExtensionManager");
const fakePaths = {
  win32: {
    chromeExtensions: "./__tests__/fake-extensions-dir",
    chromeExtensionPolicies:
      "HKEY_LOCAL_MACHINE\\Software\\Policies\\Google\\Chrome\\ExtensionInstallBlacklist",
  },
  darwin: {
    chromeExtensions: "./__tests__/fake-extensions-dir",
    chromeExtensionPolicies: "",
  },
  linux: {
    chromeExtensions: "./__tests__/fake-extensions-dir",
    chromeExtensionPolicies: "",
  },
};

test("listExtensions()", async () => {
  const extensionManager = createExtensionManager(fakePaths);

  const result = await extensionManager.listExtensions();

  expect(result.length).toBe(2);
});
