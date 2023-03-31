// To start the server:
// cd server
// npm init
// npm install express
// npm install body-parser
// node server.js

// Specify the port to listen on

const https = require("https");
const express = require("express");
const app = express();
const fs = require("fs");
const bodyParser = require("body-parser");

PORT = 80;
PATH = "/Users/marcinpajak/Appliscale/GIT/pdi-hmi/build-hmi-solution-WebAssembly_Qt_6_4_1-Debug/ui/"
FILE_TO_SERVE = PATH + "ui.html";

app.use(express.static(PATH));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", function (req, res) {
    console.log(FILE_TO_SERVE);
    res.sendFile(FILE_TO_SERVE);
});

const options = {
    key: fs.readFileSync("server.key"),
    cert: fs.readFileSync("server.cert"),
};

const server = https.createServer(options, app);

https.createServer(options, app).listen(PORT, function (req, res) {
    console.log("Server listening on port " + PORT);
});