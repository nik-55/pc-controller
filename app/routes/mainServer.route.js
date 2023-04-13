const {
  mainServerController,
} = require("../controllers/mainServer.controller");
const { authorizeIncomingRequest } = require("../middlewares/auth.middleware");

const router = (router) => {
  router.get(
    "/api/shutdown",
    authorizeIncomingRequest,
    mainServerController.shutdown
  );

  router.get(
    "/api/hibernate",
    authorizeIncomingRequest,
    mainServerController.hibernate
  );

  router.get(
    "/api/tasklist",
    authorizeIncomingRequest,
    mainServerController.tasklist
  );

  router.get(
    "/api/taskkill/:task",
    authorizeIncomingRequest,
    mainServerController.taskKill
  );

  return router;
};
module.exports = router;
