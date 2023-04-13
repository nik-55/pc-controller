const { commandLine } = require("../utils/command.util");
const { mainServerUrl } = require("../constants");

const mainServerController = {};

mainServerController.shutdown = async (req, res) => {
  const jwt = req.headers.authorization;
  const deleteReqObj = {
    method: "DELTE",
    headers: {
      authorization: jwt,
    },
    body: {
      userName: JSON.stringify(userName),
    },
  };
  await fetch(`${mainServerUrl}/api/devices/delete/${deviceID}`, deleteReqObj);
  res.send({ status: "ok" });
  const { stdout, error } = commandLine("./commands/_shutdown.txt"); // here i dont need to or may be i can wait for complete process to finish i.e i close txt file
};

mainServerController.hibernate = async (req, res) => {
  // send hibernation success remark
  res.send({ staus: "ok" });
  const { stdout, error } = await commandLine("./commands/_hibernate.txt");
  // when device is online send this back to the server informing about being online
  const jwt = req.headers.authorization;
  const patchReqObj = {
    method: "PATCH",
    headers: {
      authorization: jwt,
    },
    body: {
      userName: JSON.stringify(userName),
    },
  };
  const toggleActivityRequest = await fetch(
    `${mainServerUrl}/api/devices/toggleactive/${deviceID}`,
    patchReqObj
  );
};

mainServerController.tasklist = async (req, res) => {
  const { stdout, error } = await commandLine("tasklist");
  if (error) {
    res.send("error is", error);
  }
  if (stdout) {
    const lines = stdout.split("\n").slice(3, -1); // Get the lines of output, excluding the headers and footers
    const processes = lines.map((line) => {
      const columns = line.trim().split(/\s+/); // Split each line into columns using any amount of whitespace as the delimiter
      return { processName: columns[0], memoryUsage: columns[4] }; // Create an object with the relevant columns
    });

    res.send({ processes: processes });
  }
};

mainServerController.taskKill = async (req, res) => {
  const task = req.params.task;
  try {
    await commandLine(`taskkill /im ${task}.exe /F`);
    res.send({ status: "ok" });
  } catch (err) {
    res.send({ status: "failed", err: err });
  }
};

module.exports = { mainServerController };
