const express = require("express");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();
const app = express();

app.use(express.static(path.join(__dirname, "/app/views")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const clientSideRouters = require("./app/routes/clientSide.route")(
  express.Router()
);
const mainServerRouters = require("./app/routes/mainServer.route")(
  express.Router()
);

app.use(clientSideRouters);
app.use(mainServerRouters);

app.listen("8080", (req, res) => {
  console.log("listening to port 8080");
});
