import express from "express";
import db from "./models/Client";
import cookieParser from "cookie-parser";
import cors from "cors";
import https from "https";
import http from "http";
import fs from "fs";
import changePassword from "./controllers/change-password";
import auth from "./controllers/auth";
import user from "./controllers/user";
import avatar from "./controllers/avatar";
import sell from "./controllers/sell";
import radius from "./controllers/radius";
import dotenv from "dotenv";
dotenv.config();
//const privateKey = fs.readFileSync("ssl certificates/key.pem", "utf8");
//const certificate = fs.readFileSync("ssl certificates/cert.pem", "utf8");
//const credentials = { key: privateKey, cert: certificate, passphrase: "ahan" };
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
app.use(express.json());
app.use(cookieParser());
app.use("/changePassword", changePassword);
app.use("/", auth);
app.use("/", user);
app.use("/avatar", avatar);
app.use("/sell", sell);
app.use("/radius", radius);
const httpServer = http.createServer(app);
//const httpsServer = https.createServer(credentials, app);
httpServer.listen(process.env.HTTP_PORT, () => console.log(`server is listening on port ${process.env.HTTP_PORT}`));
