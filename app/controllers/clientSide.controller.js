const { commandLine } = require("../utils/command.util");
const { getForwordingURL } = require("../utils/basic.util");
const { mainServerUrl } = require("../constants");

const clientSideController = {};

clientSideController.login = (req, res) => {
  res.sendFile("./login.html", { root: "app/views" });
};

clientSideController.batteryInfo = async (req, res) => {
  const reqBatteryPercentage = await commandLine(
    "wmic path Win32_Battery Get EstimatedChargeRemaining"
  );
  const batteryPercentage = reqBatteryPercentage.split("\n")[1];
  const reqBatteryStatus = await commandLine(
    "wmic path Win32_Battery Get BatteryStatus"
  );
  const batteryStatus = reqBatteryStatus.split("/n")[1] >= 2 ? 2 : 1;

  res.send({
    batteryPercentage: batteryPercentage,
    batteryStatus: batteryStatus,
  });
};

clientSideController.userInfo = async (req, res) => {
  console.log(req.body);
  if (req.body.deviceID == null) {
    const reqBatteryPercentage = await commandLine(
      "wmic path Win32_Battery Get EstimatedChargeRemaining"
    );
    const batteryPercentage = reqBatteryPercentage.stdout.split("\n")[1];
    const reqBatteryStatus = await commandLine(
      "wmic path Win32_Battery Get BatteryStatus"
    );
    const batteryStatus = reqBatteryStatus.stdout.split("/n")[1] >= 2 ? 2 : 1;
    process.env.SECRET_KEY = req.body.secret;

    process.env.userName = req.body.userName;
    const forwardingURL = await getForwordingURL();
    console.log(forwardingURL);
    res.send({
      forwardingURL: forwardingURL,
      batteryPercentage: batteryPercentage,
      batteryStatus: batteryStatus,
    });
  } else {
    process.env.deviceID = req.body.deviceID;

    res.send({ stats: "ok" });
  }
};

clientSideController.dashboard = {
  getDashboard: (req, res) => {
    res.sendFile("dashboard.html", { root: "app/views" });
  },

  postDashboard: async (req, res) => {
    const stateReq = req.body.deviceState;
    const jwt = req.headers["auth-token"];

    let allowRemoteControl;
    if (stateReq === "on") allowRemoteControl = true;
    else allowRemoteControl = false;

    const data = {
      userName: process.env.userName,
    };

    let reqObject = {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        "auth-token": jwt,
      },
      body: JSON.stringify(data),
    };

    console.log(reqObject);
    console.log("device id", process.env.deviceID);

    let resMainServer = await fetch(
      `${mainServerUrl}/api/devices/toggleactive/${process.env.deviceID}`,
      reqObject
    );
    resMainServer = res.json();
  },
};

module.exports = { clientSideController };
