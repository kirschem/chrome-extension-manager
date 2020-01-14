"use strict";
const { ipcRenderer } = require("electron");

ipcRenderer.on("extensions", (event, data) => {
  const extensionList = document.getElementById("extensionList");

  const extensionItems = data.reduce((html, extensionData) => {
    html += `
    <tr>
      <td>${
        extensionData.iconSrc
          ? `<img src="${extensionData.iconSrc}" width="32" height="32" />`
          : ""
      }</td>
      <td>${extensionData.id}</td>
      <td>${extensionData.name}</td>
      <td>${extensionData.version}</td>
      <td>
        <input type="checkbox" />
      </td>
    </tr>`;
    return html;
  }, "");

  const tableHtml = `
    <table class="table">
      <thead>
        <th class="border-top-0"></th>
        <th class="border-top-0">ID</th>
        <th class="border-top-0">Name</th>
        <th class="border-top-0">Version</th>
        <th class="border-top-0">Disable on this machine</th>
      </thead>
      <tbody>
      ${extensionItems}
      </tbody>
    </table>
  `;
  extensionList.innerHTML = tableHtml;
});
