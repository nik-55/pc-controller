const util = require("util");

const exec = util.promisify(require("child_process").exec);

const commandLine = async (command) => {
  const { stdout, error } = await exec(command);
  return { stdout, error };
};

module.exports = { commandLine };
