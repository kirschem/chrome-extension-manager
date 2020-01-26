const { ipcRenderer } = require("electron");

function disableExtension(id) {
  ipcRenderer.send("disableExtension", id);
}

function enableExtension(id) {
  ipcRenderer.send("enableExtension", id);
}

ipcRenderer.on("loading", () => {
  const html = `
    <div id="loading-spinner"
      class="d-flex justify-content-center align-items-center position-absolute"
      style="top:50%; left:50%; margin-left:-15px; margin-top:-15px;">
      <div class="spinner-border" style="height: 30px; width: 30px;"></div>
    </div>
  `;
  const extensionList = document.getElementById("extensionList");
  extensionList.innerHTML = "";

  document.body.innerHTML += html;
});

ipcRenderer.on("extensions", (event, data) => {
  const extensionList = document.getElementById("extensionList");

  const extensionItems = data.reduce((html, extensionData) => {
    html += `
    <tr title="ID: ${extensionData.id}">
      <td>${
        extensionData.iconSrc
          ? `<img src="${extensionData.iconSrc}" width="32" height="32" />`
          : ""
      }</td>
      <td>${extensionData.name}</td>
      <td>${extensionData.version}</td>
      <td>
        <input type="checkbox" ${
          extensionData.disabled
            ? `checked onclick="enableExtension('${extensionData.id}')"`
            : `onclick="disableExtension('${extensionData.id}')"`
        }
        }/>
      </td>
    </tr>`;
    return html;
  }, "");

  const tableHtml = `
    <table class="table">
      <thead>
        <th class="border-top-0"></th>
        <th class="border-top-0">Name</th>
        <th class="border-top-0">Version</th>
        <th class="border-top-0">Disable on this machine for current user</th>
      </thead>
      <tbody>
      ${extensionItems}
      </tbody>
    </table>
  `;
  const loadingSpinner = document.getElementById("loading-spinner");
  if (loadingSpinner) {
    loadingSpinner.remove();
  }
  extensionList.innerHTML = tableHtml;
});
