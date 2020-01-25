const sudo = require("sudo-prompt");
const exec = require("child_process").exec;

// Wrapper to remove direct dependency on sudo-prompt
class ElevatedCommandExecutor {
  constructor(environmentVars) {
    this._environmentVars = environmentVars;
  }

  async execute(cmd, cb) {
    return new Promise((resolve, reject) => {
      sudo.exec(cmd, { env: this._environmentVars }, function(
        error,
        stdout,
        stderr
      ) {
        const result = { error, stdout, stderr };
        if (error) {
          reject(result);
        }
        if (process.platform !== "win32") {
          // Reset sudo timestamp
          exec("sudo -k", () => resolve(result));
        }
        resolve(result);
      });
    });
  }
}

module.exports = ElevatedCommandExecutor;
