// this controller is for working with sell requests for sellers , for example create selling item
import sellModel from "../models/Sell";
import client from "../models/Client";
const clientModel = client.clientModel;
const dotenv = require("dotenv");
dotenv.config();
import bcrypt = require("bcrypt");
import transporter = require("../utils/transporter");
var express = require("express");
import jwt = require("jsonwebtoken");
import fs = require("fs");
import multer = require("multer");
var storage = multer.diskStorage({
  destination: function (req, file, callback) {
      callback(null, './assets/avatars');
  },
  filename: function (req, file, callback) {
      callback(null, file.originalname);
  }
});
const upload = multer({
  limits: {
    fieldSize: 1024 * 1024 * 3,
  },
  storage:storage
});

var router = express.Router();
router.post("/", upload.single("image"), async (req, res) => {
  let file = req.body.image;
  let formData = req.body;
  console.log(req.body); 
  jwt.verify(formData.token, process.env.JWT_SECRET_STRING, async (err, decoded) => {
    if (err) {
      return res.status(500).json({ message: "sorry , you need to login" });
    }
    try {
      console.log(decoded);
      let { email } = await clientModel.findOne(
        { _id: decoded.id },
        { email: 1, _id: 0, total: 1 }
      );

      sellModel.create({
        sellerId: decoded.id,
        email: email,
        name: formData.name,
        description: formData.description,
        location: formData.location,
      });
      res.status(200).json({
        status: "success",
        message: "sell request is created",
      });
    } catch (err) {
      res.status(500).json({ status: "sorry something went wrong" });
    }
  });
});
router.patch("/");
router.get("/");

export default router;