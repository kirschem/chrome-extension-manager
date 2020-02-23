const exec = require("child_process").exec;

async function executeCommand(command) {
  return await new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command '${command}': ${stderr}`);
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
}

module.exports = executeCommand;
