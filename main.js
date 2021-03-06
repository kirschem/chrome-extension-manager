"use strict";
const { app, BrowserWindow, ipcMain, Menu } = require("electron");
const createExtensionManager = require("./model/chromeExtensionManager/createExtensionManager");
const filePaths = require("./util/filePaths");
const CommandExecutor = require("./util/commandExecutor");
const extensionManager = createExtensionManager(
  filePaths,
  new CommandExecutor()
);

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  Menu.setApplicationMenu(null);

  mainWindow.loadFile("index.html");

  mainWindow.on("closed", function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  mainWindow.webContents.on("did-finish-load", async () => {
    mainWindow.webContents.send("loading");
    const extensions = await extensionManager.listExtensions();
    mainWindow.webContents.send("extensions", extensions);
  });

  ipcMain.on("list-extensions", async (event) => {
    const extensions = await extensionManager.listExtensions();
    mainWindow.webContents.send("extensions", extensions);
  });

  ipcMain.on("enableExtension", async (event, extId) => {
    mainWindow.webContents.send("loading");
    await extensionManager.enableExtension(extId);
    const extensions = await extensionManager.listExtensions();
    mainWindow.webContents.send("extensions", extensions);
  });

  ipcMain.on("disableExtension", async (event, extId) => {
    mainWindow.webContents.send("loading");
    await extensionManager.disableExtension(extId);
    const extensions = await extensionManager.listExtensions();
    mainWindow.webContents.send("extensions", extensions);
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});
