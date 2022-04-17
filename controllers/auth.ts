import User from "../services/user";
import db from "../models/Client";
import bcrypt = require("bcrypt");
const Client = db.clientModel;
import transporter from "../utils/transporter";
const express = require("express");
import jwt from "jsonwebtoken";
const dotenv = require("dotenv");
dotenv.config();
const router = express.Router();
router.post("/register", async (req, res) => {
  for (const [key, value] of Object.entries(req.body)) {
    if (!value) res.status(200).json({ message: "please fill all required fields" });
  }
  const client1 = Client.findOne({
    nickname: req.body.nickname,
  });
  const client2 = Client.findOne({
    email: req.body.email,
  });
  const values = await Promise.all([client1, client2]);
  console.log(values);

  if (values[0] || values[1]) {
    res.status(200).send({ message: "This email or nickname are already in use" });
  } else {
    User.sendCode(res, transporter, Client, req.body);
  }
});
router.post("/resendEmailConfirmCode", async (req, res) => {
  User.resendCode(res, transporter, Client, req);
});
router.post("/confirmEmail", (req, res) => {
  User.confirmEmail(req.body, Client, res);
});
router.post("/login", (req, res) => {
  if (req.body.password && req.body.email) {
    Client.findOne({ email: req.body.email }).then((answ) => {
      if (answ) {
        bcrypt.compare(req.body.password + "", answ.password + "").then(function (result) {
          if (result) {
            //sign jwt
            const token = jwt.sign(
              { id: answ._id },
              process.env.JWT_SECRET_STRING,
              {
                expiresIn: process.env.JWT_EXPIRE,
              },
              function (err, token) {
                console.log(token);
                res.status(200).send({
                  code: "success",
                  message: "User is successfuly loged in ",
                  jwt: token,
                  nickname: answ.nickname,
                });
              },
            );
          } else {
            res.status(200).send({ message: "Email or password is wrong" });
          }
        });
      } else {
        res.status(200).send({ message: "Email or password is wrong" });
      }
    });
  } else {
    res.status(200).send({ message: "please type password and email" });
  }
});

router.post("/forgotPassword", (req, res) => {
  User.resetPassword(req, res, Client, transporter);
});

router.get("/resetPassword/:email/:code", (req, res) => {
  console.log("happens")
  if (req.params) {
    User.changePassword(req, res, Client);
  } else {
    res.status(500).send({ message: "error" });
  }
});
router.get("/", (req, res) => {
  res.status(200).json({
    message: "success",
  });
});
export default router;
