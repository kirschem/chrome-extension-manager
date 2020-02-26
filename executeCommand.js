const exec = require("child_process").exec;

async function executeCommand(command) {
  console.debug("Executing command: %s", command);
  return await new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error || stderr) {
        console.error(`Error executing command '${command}': ${stderr}`);
        reject(error || stderr);
      } else {
        resolve(stdout);
      }
    });
  });
}

module.exports = executeCommand;
