import User from "../services/user-service";
import db from '../models/Client'
const Client = db.clientModel;
var express = require('express');
import jwt from "jsonwebtoken";
import { userInfo } from "os";
var router = express.Router();
router.get("/user", (req, res) => {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
  
    if (!token) {
      res.status(200).send({ message: "You are not logged in" });
    } else {
      //token verification
      jwt.verify(token, "secret", function (err, decoded) {
        if (err) {
          res.status(200).send(err);
        } else User.userLog(decoded, res, Client);
      });
    }
  });
  export default router;