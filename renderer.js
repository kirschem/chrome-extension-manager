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
    <table>
      <thead>
        <th></th>
        <th>ID</th>
        <th>Name</th>
        <th>Version</th>
        <th>Disable on this machine</th>
      </thead>
      <tbody>
      ${extensionItems}
      </tbody>
    </table>
  `;
  extensionList.innerHTML = tableHtml;
});
