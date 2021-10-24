import User from "../services/auth-service";
import db from "../models/Client";
import bcrypt = require("bcrypt");
const Client = db.clientModel;
import transporter from "../utils/transporter-email";
var express = require("express");
import jwt from "jsonwebtoken";
import multiparty from "multiparty";
import fs = require("fs");
import multer = require("multer");
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fieldSize: 1024 * 1024 * 3,
  },
});

var router = express.Router();

router.post(
  "/upload",
  (req, res, next) => {
    try {
      upload.single("photo");
    } catch (err) {
      res.status(500).json({
        status:"File is too large",
      })
    }
  },
  (req, res) => {
    jwt.verify(req.body.cookie, "secret", function (err, decoded) {
      if (err) {
        console.log(err);
        return res.status(500).json({
          status: "you are not logged in",
        });
      } else {
        if (req.body.uri) {
          var data = req.body.uri.replace(/^data:image\/\w+;base64,/, "");
          var buf = new Buffer(data, "base64");
          fs.writeFile(`image.${req.body.type}`, buf, function (err) {
            if (err) {
              console.log("error", err);
            }
          });
          res.status(200).json({
            message: "success!",
          });
        } else {
          res.status(500).json({
            status: "File is too large",
          });
        }
      }
    });
  }
);
export default router;
