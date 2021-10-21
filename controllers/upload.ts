import User from "../services/user-service";
import db from '../models/Client'
import bcrypt = require("bcrypt");
const Client = db.clientModel;
import transporter from '../utils/transporter'
var express = require('express');
import jwt from "jsonwebtoken";
var router = express.Router();
router.post("/upload", (req, res) => {
    // @ts-ignore
  
    // An unknown error occurred when uploadi ng.
    console.log(req.body);
    res.status(200).json({
      message: "success!",
    });
  });
export default router