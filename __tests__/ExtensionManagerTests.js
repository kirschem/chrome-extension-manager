const ExtensionManager = require("../chromeExtensionManager/extensionManager");

test("listExtensions()", async () => {
  const extensionManager = new ExtensionManager(
    "./__tests__/fake-extensions-dir",
    ""
  );

  const result = await extensionManager.listExtensions();

  expect(result.length).toBe(2);
});
