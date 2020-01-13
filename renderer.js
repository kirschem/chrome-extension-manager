"use strict";

const { ipcRenderer } = require("electron");

ipcRenderer.on("extensions", (event, data) => {
  const extensionList = document.getElementById("extensionList");

  const extensionItems = data.reduce((html, extensionData) => {
    html += `<li>${extensionData.id} - ${extensionData.name} - ${extensionData.version}</li>`;
    return html;
  }, "");

  extensionList.innerHTML = extensionItems;
});
