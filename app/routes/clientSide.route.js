const {
  clientSideController,
} = require("../controllers/clientSide.controller");
const {
  authorizeIncomingRequest,
  authorizeInternalRequest,
} = require("../middlewares/auth.middleware");

const router = (router) => {
  router.get("/login", clientSideController.login);
  router.get(
    "/batteryInfo",
    authorizeIncomingRequest,
    clientSideController.batteryInfo
  );

  router.post("/userInfo", clientSideController.userInfo);

  router.get("/dashboard", clientSideController.dashboard.getDashboard);

  router.post(
    "/dashboard",
    authorizeInternalRequest,
    clientSideController.dashboard.postDashboard
  );

  return router;
};
module.exports = router;
