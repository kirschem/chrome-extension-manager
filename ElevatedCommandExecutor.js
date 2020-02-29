const sudo = require("sudo-prompt");
const exec = require("child_process").exec;

// Wrapper to remove direct dependency on sudo-prompt
class ElevatedCommandExecutor {
  constructor(environmentVars) {
    this._environmentVars = environmentVars;
  }

  async execute(cmd) {
    console.debug("Executing cmd in elevated context: %s", cmd);
    return new Promise((resolve, reject) => {
      sudo.exec(
        cmd,
        { env: this._environmentVars, name: "Chrome Extension Manager" },
        function(error, stdout, stderr) {
          const result = { error, stdout, stderr };
          if (error || stderr) {
            console.error(
              `Error executing command in elevated context '${command}': ${stderr}`
            );
            reject(error || stderr);
          }
          if (process.platform !== "win32") {
            // Reset sudo timestamp
            exec("sudo -k", () => resolve(stdout));
          }
          resolve(stdout);
        }
      );
    });
  }
}

module.exports = ElevatedCommandExecutor;
