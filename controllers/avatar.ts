import User from "../services/user-service";
import db from "../models/Client";
import bcrypt = require("bcrypt");
const Client = db.clientModel;
const path = require('path');
import transporter from "../utils/transporter";
import express = require("express");
import jwt from "jsonwebtoken";
import fs = require("fs");
const dotenv = require("dotenv");
dotenv.config();
import multer = require("multer");
import exp = require("constants");
var storage = multer.diskStorage({
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
  },
  storage: storage,
});

var router = express.Router();

router.post(
  "/",
  (req, res, next) => {
    jwt.verify(
      req.query.token,
      process.env.JWT_SECRET_STRING,
      function (err, decoded) {
        if (err) {
          console.log(err);
          return res.status(500).json({
            status: "fail",
            message: "you are not logged in",
          });
        }
        req.query.id = decoded.id;
        next();
      }
    );
  },
  upload.single("image"),
  (req, res) => {
    res.status(200).json({
      message: "success!",
    });
  }
);
router.get("/", (req, res) => {
  jwt.verify(
    req.query.token,
    process.env.JWT_SECRET_STRING,
    async (err, decoded) => {
      
      console.log(path.join(__dirname, '../assets/avatars', `${decoded.id}.jpeg`));
      // '../../assets/avatars' because assets are not in dist folder
      res.status(200).sendFile(path.join(__dirname, '../../assets/avatars', `${decoded.id}.jpeg`))

    }
  );
});
export default router;
