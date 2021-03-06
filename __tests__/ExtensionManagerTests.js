const createExtensionManager = require("../model/chromeExtensionManager/createExtensionManager");
const executeCommand = require("../util/executeCommand");
// Evelated execution does not work inside the build pipeline
const CommandExecutor = require("../util/commandExecutor");
const fs = require("fs-extra");
const mergeJsonInFolder = require("../util/jsonMerge");
const path = require("path");
const fakePaths = {
  win32: {
    chromeExtensions: "./__tests__/fake-extensions-dir",
    chromeExtensionPolicies:
      "HKEY_LOCAL_MACHINE\\Software\\Policies\\Google\\Chrome\\ExtensionInstallBlacklist",
  },
  darwin: {
    chromeExtensions: "./__tests__/fake-extensions-dir",
    chromeExtensionPolicies: "./__tests__/fake-plist-dir",
  },
  linux: {
    chromeExtensions: "./__tests__/fake-extensions-dir",
    chromeExtensionPolicies: "./__tests__/fake-etc-dir/opt/chrome/policies",
  },
};

const cleanEnvironment = async () => {
  const folder = fakePaths[process.platform].chromeExtensionPolicies;
  const backupFolder = path.join(folder, "bak");
  try {
    await fs.access(backupFolder);
  } catch (error) {
    console.log("No bak folder found inside '%s', skipping...", folder);
    return;
  }

  const files = await fs.readdir(backupFolder);
  return Promise.all(
    files.map((file) => {
      const src = path.join(backupFolder, file);
      const dest = path.join(folder, file);
      console.log("copying %s to %s", src, dest);
      return fs.copy(src, dest);
    })
  );
};

afterEach(cleanEnvironment);
beforeAll(cleanEnvironment);

test("listExtensions()", async () => {
  switch (process.platform) {
    case "win32": {
      const extensionManager = createExtensionManager(
        fakePaths,
        new CommandExecutor()
      );
      const result = await extensionManager.listExtensions();
      expect(result.length).toBe(2);
      break;
    }
    default: {
      const extensionManager = createExtensionManager(
        fakePaths,
        new CommandExecutor()
      );
      const result = await extensionManager.listExtensions();
      expect(result.length).toBe(2);
      const disabledCount = result.filter((x) => x.disabled).length;
      expect(disabledCount).toBe(1);
      break;
    }
  }
});

test("disableExtension()", async () => {
  const id = "digfbfaphojjndkpccljibejjbppifbc";
  const folder = fakePaths[process.platform].chromeExtensionPolicies;

  switch (process.platform) {
    case "darwin": {
      const policiesFile = path.join(folder, "com.google.Chrome.plist");
      const extensionManager = createExtensionManager(
        fakePaths,
        new CommandExecutor()
      );
      await extensionManager.disableExtension(id, true);
      // Convert to JSON
      const cmd = `plutil -convert json ${policiesFile}`;
      await executeCommand(cmd);
      // Read and check
      const newPoliciesFile = await fs.readFile(policiesFile).then(JSON.parse);
      const value = newPoliciesFile["ExtensionInstallBlacklist"];
      expect(value).toContain(id);
      // Ensure other contents remain untouched
      expect(newPoliciesFile["DoNot"]).toBe("Touch");
      break;
    }
    case "linux": {
      const extensionManager = createExtensionManager(
        fakePaths,
        new CommandExecutor()
      );
      await extensionManager.disableExtension(id, true);

      // Read and check
      const pathWithPolicies = path.join(folder, "managed");
      const allPolicies = mergeJsonInFolder(pathWithPolicies);
      const value = allPolicies["ExtensionSettings"][id]["installation_mode"];
      expect(value).toBe("blocked");
      // Ensure other contents remain untouched
      expect(allPolicies["DoNot"]).toBe("Touch");
      break;
    }
    default:
      console.log("Skipping %s test", process.platform);
      break;
  }
});

test("enableExtension()", async () => {
  const id = "bhlhnicpbhignbdhedgjhgdocnmhomnp";
  const folder = fakePaths[process.platform].chromeExtensionPolicies;

  switch (process.platform) {
    case "darwin": {
      const policiesFile = path.join(folder, "com.google.Chrome.plist");
      const extensionManager = createExtensionManager(
        fakePaths,
        new CommandExecutor()
      );
      await extensionManager.enableExtension(id, true);
      // Convert to JSON
      const cmd = `plutil -convert json ${policiesFile}`;
      await executeCommand(cmd);
      // Read and check
      const newPoliciesFile = await fs.readFile(policiesFile).then(JSON.parse);
      const value = newPoliciesFile["ExtensionInstallBlacklist"];
      expect(value).not.toContain(id);
      // Ensure other contents remain untouched
      expect(newPoliciesFile["DoNot"]).toBe("Touch");
      break;
    }
    case "linux": {
      const extensionManager = createExtensionManager(
        fakePaths,
        new CommandExecutor()
      );
      await extensionManager.enableExtension(id, true);

      // Read and check
      const pathWithPolicies = path.join(folder, "managed");
      const allPolicies = mergeJsonInFolder(pathWithPolicies);
      const value = allPolicies["ExtensionSettings"][id]["installation_mode"];
      expect(value).toBe("allowed");
      // Ensure other contents remain untouched
      expect(allPolicies["DoNot"]).toBe("Touch");
      break;
    }
    default:
      console.log("Skipping %s test", process.platform);
      break;
  }
});
