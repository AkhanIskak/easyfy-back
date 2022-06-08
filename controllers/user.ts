import User from "../services/user";
import db from "../models/Client";
const Client = db.clientModel;
const express = require("express");
import jwt from "jsonwebtoken";
import { userInfo } from "os";
const router = express.Router();
router.get("/user", (req, res) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    res.status(200).send({ message: "You are not logged in" });
  } else {
    //token verification
    jwt.verify(token, process.env.JWT_SECRET_STRING, function (err, decoded) {
      if (err) {
        res.status(200).send(err);
      } else User.userLog(decoded, res, Client);
    });
  }
});
router.put("/user/:token", async (req, res) => {
  jwt.verify(req.params.token, process.env.JWT_SECRET_STRING, async function (err, decoded) {
    if (err) {
      res.status(500).send(err);
      return;
    }
    await Client.findOneAndUpdate({ _id: decoded.id },req.body);
    res.status(200).json({
      message: "Данные успешно обновлены",
    });
  });
});
export default router;
