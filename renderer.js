const { ipcRenderer } = require("electron");

function disableExtension(id) {
  ipcRenderer.send("disableExtension", id);
}

function enableExtension(id) {
  ipcRenderer.send("enableExtension", id);
}

ipcRenderer.on("loading", () => {
  const html = `
    <div id="loadingSpinner">
    <div class="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
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
    <table class="table-striped">
      <thead>
        <th></th>
        <th>Name</th>
        <th>Version</th>
        <th>Disable locally</th>
      </thead>
      <tbody>
      ${extensionItems}
      </tbody>
    </table>
  `;
  const loadingSpinner = document.getElementById("loadingSpinner");
  if (loadingSpinner) {
    loadingSpinner.remove();
  }
  extensionList.innerHTML = tableHtml;
});
