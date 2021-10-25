// this controller is for working with sell requests for sellers , for example create selling item
import sellModel from "../models/Sell";
import bcrypt = require("bcrypt");
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
router.post('/');
router.patch('/');
router.get('/');

export default router;
