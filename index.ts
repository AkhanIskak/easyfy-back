import express from "express";
import User from "./Classes/User";
import db from "./clientmodel/clientModel";
const cookieParser = require('cookie-parser')
const Client = db.clientModel;
import bcrypt = require("bcrypt");
import cors = require("cors");
import jwt from "jsonwebtoken";
import nodeMailer from "nodemailer";
import https = require("https");
import http = require("http");
import fs = require('fs')
import changePassword from "./controllers/changePassword";

const dotenv = require('dotenv');
dotenv.config();
var privateKey = fs.readFileSync('ssl certificates/key.pem', 'utf8');
var certificate = fs.readFileSync('ssl certificates/cert.pem', 'utf8');
const credentials = {key: privateKey, cert: certificate, passphrase: 'ahan'};

let app = express();
app.use(cookieParser());
app.use(cors());
var transporter = nodeMailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
    },
});

app.use(express.json());

db.mongoose
    .connect(
        process.env.MONGO_CONNECTION_STRING, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true,
        }
    )
    .then(() => console.log("connected to DB"));
app.use("changePassword", changePassword);
app.post("/register", async (req, res) => {
    for (const [key, value] of Object.entries(req.body)) {
        if (!value)
            res.status(200).json({message: "please fill all required fields"});
    }
    let client1 = Client.findOne({
        nickname: req.body.nickname,
    });
    let client2 = Client.findOne({
        email: req.body.email,
    });
    let values = await Promise.all([client1, client2]);
    console.log(values);

    if (values[0] || values[1]) {
        res
            .status(200)
            .send({message: "This email or nickname are already in use"});
    } else {
        User.sendCode(res, transporter, Client, req.body);
    }
});


app.post("/confirmEmail", (req, res) => {
    User.confirmEmail(req.body, Client, res);
});
app.post("/resendCode", (req, res) => {
    User.resendEmailConfirm(transporter, req.body, res, Client);
});
app.post("/login", (req, res) => {
    if (req.body.password && req.body.email) {
        Client.findOne({email: req.body.email}).then((answ) => {
            if (answ) {
                bcrypt
                    .compare(req.body.password, answ.password)
                    .then(function (result) {
                        if (result) {
                            //sign jwt
                            const token = jwt.sign(
                                {id: answ._id},
                                "secret",
                                {
                                    expiresIn: 1000,
                                },
                                function (err, token) {
                                    res.status(200).send({
                                        code: "success",
                                        message: "User is successfuly loged in ",
                                        jwt: token,
                                        nickname: answ.nickname,
                                    });
                                }
                            );

                            //
                        } else {
                            res.status(200).send({message: "Email or password is wrong"});
                        }
                    });
            } else {
                res.status(200).send({message: "Email or password is wrong"});
            }
        });
    } else {
        res.status(200).send({message: "please type password and email"});
    }
});
app.get("/user", (req, res) => {
    let token;
    //check headers
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        res.status(200).send({message: "You are not logged in"});
    } else {
        //token verification
        jwt.verify(token, "secret", function (err, decoded) {
            if (err) {
                res.status(200).send(err);
            } else User.userLog(decoded, res, Client);
        });
    }
});
app.post("/forgotPassword", (req, res) => {

    User.resetPassword(req, res, Client, transporter);
});

app.get("/resetPassword/:email/:code", (req, res) => {
    if (req.params) {
        User.changePassword(req, res, Client);
    } else {
        res.status(500).send({message: "error"});
    }
});
app.get("/", (req, res) => {
    res.status(200).json({
        message: "success"
    })
})

let httpServer = http.createServer(app);
let httpsServer = https.createServer(credentials, app);
const PORT = 5000;
httpsServer.listen(3000);

httpServer.listen(PORT);
