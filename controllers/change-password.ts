import User from "../services/user";
import util from "util";
import jwt from "jsonwebtoken";
import express from "express";
import bcrypt from "bcrypt";

const router = express.Router();
import exportObj from "../models/Client";

const client = exportObj.clientModel;

router.patch("/", async (req, res) => {
  console.log("comes");
  console.log(req.query);
  if (req.query.oldPassword) {
    const oldPasswordHash = await bcrypt.hash(req.query.oldPassword, 10);
    const client1 = await client.findOne({ email: req.query.email + "" });
    if (client1.password !== oldPasswordHash) {
      res.status(500).json({
        message: "old password is wrong",
      });
    }
    const newPassword = await bcrypt.hash(req.query.password, 10);
    client.findOneAndUpdate({ email: req.query.email + "" }, { password: newPassword, passwordChangedAt: Date.now() });
    res.status(200).send("Password is successfully updated");
  }
  jwt.verify(req.cookies.auth, process.env.SECRET_PSW_RESET, async function (err, decoded) {
    if (err) {
      console.log(err);
      res.status(200).send(err);
    } else {
      const hash = await bcrypt.hash(req.query.password, 10);
      try {
        console.log(decoded.id);
        const res = await client.findOneAndUpdate(
          { _id: decoded.id },
          { password: hash, passwordChangedAt: Date.now() },
        );
        console.log(res);
      } catch (err) {
        res.status(500).json({
          message: "sorry , some error , please try later",
        });
      }
      res.status(200).json({
        message: "password is successfully updated",
      });
    }
  });
});
export default router;
