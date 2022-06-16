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
router.post("/", async (req, res) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }
  jwt.verify(token, process.env.JWT_SECRET_STRING, async function (err, decoded) {
    if (err) {
      console.log(err);
      res.status(500).send(err);
      return;
    }
    const userId = decoded.id;
    const user = await Client.findOneAndUpdate(
      { _id: userId },
      {
        from: [req.body.markers[0].latlng.latitude, req.body.markers[0].latlng.longitude],
        to: [req.body.markers[1].latlng.latitude, req.body.markers[1].latlng.longitude],
        about:req.body.about
      },
    );
    const maxDistance:number=parseInt(process.env.RADIUS,10) ;
    const users = await Client.aggregate([
      {
        $geoNear: {
          near: { coordinates: [req.body.markers[0].latlng.latitude, req.body.markers[0].latlng.longitude] },
          key: "from",
          distanceField: "dist.calculated",
          maxDistance,
          includeLocs: "dist.location",
          spherical: true,
        },
      },
    ]);
    users.shift();
    res.status(200).json({
      users,
    });
  });
});

export default router;
