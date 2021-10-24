import User from "../services/auth-service";
import util from "util";
import jwt from "jsonwebtoken";
import express from "express";
import bcrypt from "bcrypt";

const router = express.Router();
import exportObj from "../models/Client";

let client = exportObj.clientModel;

router.patch("/", async (req, res) => {
  if (req.query.oldPassword) {
    let oldPasswordHash = await bcrypt.hash(req.query.oldPassword, 10);
    let client1 = await client.find({ email: req.query.email });
    if (client1.password !== oldPasswordHash) {
      res.status(500).json({
        message: "old password is wrong",
      });
    }
    let newPassword = await bcrypt.hash(req.query.password, 10);
    client.findOneAndUpdate(
      { email: req.query.email },
      { password: newPassword, passwordChangedAt: Date.now() }
    );
    res.status(200).send("Password is successfuly updated");
  }
  jwt.verify(
    req.cookies.auth,
    "secretPasswordReset",
    async function (err, decoded) {
      if (err) {
        res.status(200).send(err);
      } else {
        let hash = await bcrypt.hash(req.query.password, 10);
        try {
          await client.findOneAndUpdate(
            { id: decoded._id },
            { password: hash, passwordChangedAt: Date.now() }
          );
        } catch (err) {
          res.status(500).json({
            message: "sorry , some error , please try later",
          });
        }
        res.status(200).json({
          message: "password is successfuly updated",
        });
      }
    }
  );
});
export default router;
