import User from "../services/user";
import db from "../models/Client";
import * as fsPromise from "fs/promises";
import bcrypt = require("bcrypt");
const Client = db.clientModel;
const path = require("path");
import transporter from "../utils/transporter";
import express = require("express");
import jwt from "jsonwebtoken";
import fs = require("fs");
const dotenv = require("dotenv");
dotenv.config();
import multer = require("multer");
import exp = require("constants");

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./assets/avatars");
  },
  filename: function (req, file, callback) {
    callback(null, req.query.id + file.originalname);
  },
});
const upload = multer({
  limits: {
    fieldSize: 1024 * 1024 * 3,
    fileSize: 1024 * 1024 * 3,
  },
  storage: storage,
});

const router = express.Router();

router.post(
  "/",
  (req, res, next) => {
    jwt.verify(req.query.token, process.env.JWT_SECRET_STRING, async function (err, decoded) {
      if (err) {
        return res.status(500).json({
          status: "fail",
          message: "you are not logged in",
        });
      }
      req.query.id = decoded.id;
      try {
        await fsPromise.unlink(`assets/avatars/${decoded.id}.${req.query.oldFileType}`);
      } catch (err) { }
      next();
    });
  },

  upload.single("image"),
  (req, res) => {
    res.status(200).json({
      message: "success!",
    });
  },
);
router.get("/", (req, res) => {
  // console.log('1')
  jwt.verify(req.query.token, process.env.JWT_SECRET_STRING, async (err, decoded) => {
    // '../../assets/avatars' because assets are not in dist folder
    res.status(200).sendFile(path.join(__dirname, "../../assets/avatars", `${decoded.id}.${req.query.fileType}`));
  });
});
router.get("/:id", (req, res) => {
  console.log("reaches")
  fs.readdir(__dirname + "/../../assets/avatars", (err, files) => {
    if (err)
      console.log(err);

    for (let i in files) {
      if (path.parse(files[i]).name == req.params.id) {
        console.log("SENDING")
        res.status(200).sendFile(path.join(__dirname, "../../assets/avatars", `${req.params.id}${path.parse(files[i]).ext}`))
        return
      }
    }
    res.status(404).json({ message: "not found" })
  });
})
export default router;
