const open = require("open");

function getChromeAppName() {
  switch (process.platform) {
    case "win32":
      return "chrome";
    case "linux":
      return "google-chrome";
    case "darwin":
      return "google chrome";
  }
}

function openChrome() {
  open(getChromeAppName());
}

module.exports = openChrome;
