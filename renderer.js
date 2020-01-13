"use strict";

const { ipcRenderer } = require("electron");

ipcRenderer.on("extensions", (event, data) => {
  const extensionList = document.getElementById("extensionList");

  const extensionItems = data.reduce((html, extName) => {
    html += `<li>${extName}</li>`;
    return html;
  }, "");

  extensionList.innerHTML = extensionItems;
});
