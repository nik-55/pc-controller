const jwt = require("jsonwebtoken");
const { allowRemoteControl } = require("../constants");

const authorizeInternalRequest = async (req, res, next) => {
  const authHeader = req.headers["auth-token"]; // Bearer token
  const token = authHeader;
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    next();
  });
};

const authorizeIncomingRequest = async (req, res, next) => {
  const authHeader = req.headers["auth-token"]; // Bearer token
  if (!allowRemoteControl) {
    return res.send({ err: "device status offline" });
  }
  const token = authHeader;
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    next();
  });
};

module.exports = { authorizeIncomingRequest, authorizeInternalRequest };
