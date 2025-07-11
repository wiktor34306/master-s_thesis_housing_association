import config from "./config";
const express = require("express");
const pool = require("../db");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
import routes from "./REST/routes";

app.use(cors({
    origin: '*',
  }));
  
  app.options("*", cors());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json({limit: "2048kb"}));
  
  app.use(express.static('public'));
  
  app.get("/", (req, res) => {
    console.log("Start");
    res.send("Hello, server has started")
  });
  
  routes(app);
  
  app.get("/*", function (req,res) {
    res.sendFile(__dirname + "/public/index.html");
  });
  
  app.listen(config.port, () => {
    console.log(`Server started on port ${config.port}`)
  })
