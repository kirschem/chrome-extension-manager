const sudo = require("sudo-prompt");
const exec = require("child_process").exec;
const CommandExecutor = require("./commandExecutor");

class ElevatedCommandExecutor extends CommandExecutor {
  async execute(cmd, nonElevatedExecution) {
    if (nonElevatedExecution) {
      return super.execute(cmd);
    }
    console.debug("Executing cmd in elevated context: %s", cmd);
    return new Promise((resolve, reject) => {
      sudo.exec(cmd, { name: "Chrome Extension Manager" }, function (
        error,
        stdout,
        stderr
      ) {
        const result = { error, stdout, stderr };
        if (error || stderr) {
          console.error(
            `Error executing command in elevated context '${cmd}': ${stderr}`
          );
          reject(error || stderr);
        }
        if (process.platform !== "win32") {
          // Reset sudo timestamp
          exec("sudo -k", () => resolve(stdout));
        }
        resolve(stdout);
      });
    });
  }
}

module.exports = ElevatedCommandExecutor;
