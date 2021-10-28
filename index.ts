import express from "express";
import db from "./models/Client";
const cookieParser = require("cookie-parser");
import cors = require("cors");
import https = require("https");
import http = require("http");
import fs = require("fs");
import changePassword from "./controllers/change-password";
import auth from "./controllers/auth";
import user from "./controllers/user";
import avatar from "./controllers/avatar";
import sell from "./controllers/sell";
import path from 'path';
const dotenv = require("dotenv");
dotenv.config();
var privateKey = fs.readFileSync("ssl certificates/key.pem", "utf8");
var certificate = fs.readFileSync("ssl certificates/cert.pem", "utf8");
const credentials = { key: privateKey, cert: certificate, passphrase: "ahan" };

db.mongoose
  .connect(process.env.MONGO_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => console.log("connected to DB"));

const app = express();
app.set("view engine", "pug");
app.use(cors());
// @ts-ignore
app.use(express.json());
app.use(cookieParser());
app.use("/changePassword", changePassword);
app.use("/", auth);
app.use("/", user);
app.use("/avatar", avatar);
app.use("/sell", sell);
let httpServer = http.createServer(app);
let httpsServer = https.createServer(credentials, app);

httpServer.listen(process.env.HTTP_PORT, () =>
  console.log(`server is listening on port ${process.env.HTTP_PORT}`)
);
