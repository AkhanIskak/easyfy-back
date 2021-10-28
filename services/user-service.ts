/** @format */
import {promisify} from "util"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import crypto from "crypto"

const path = require('path');
const dotenv = require('dotenv');
dotenv.config();
export default class User {

    static changePassword = async (req, res, Client) => {
        console.log('ads');
        let user = await Client.findOne({email: req.params.email});
        if (!user) {
            res.status(500).send({message: "error"});
            throw Error("error");
        }


        const comparing = await bcrypt.compare(req.params.code, user.pswRstCode);
        if (!comparing) {
            await Client.findOneAndUpdate(
                {email: req.body.email},
                {pswRstCode: null}
            );
            res.status(500).send({message: "error ,try again"});
            throw Error("error , try again");
        }
        let date = new Date(user.pswRstDate).getTime() / 1000;


        if (date + parseInt(process.env.PASSWORD_RESET_LINK_EXPIRATION_TIME, 10) < Date.now() / 1000) {
            res.status(500).send({message: "Link is old"});
            throw Error('the link is old ');

        }

        const token = await promisify(jwt.sign)({id: user._id}, "secretPasswordReset", {
            expiresIn: 300,
        });
        await Client.findOneAndUpdate({email: req.body.email}, {pswRstCode: undefined, pswRstDate: undefined});
        res
            .cookie("auth", token,{sameSite:"Strict",httpOnly:true})

            .render('passwordReset',{ip:process.env.SERVER_IP,port:process.env.HTTP_PORT})


    };
    static resetPassword = async (req, res, Client, transporter) => {
        if (!req.body.email) {
            res.status(500).send({
                message: "please provide email",
            });
            throw Error("please provide email");
        }
        let code = crypto.randomBytes(20).toString('hex');
        console.log(code + " CODE RANDOM ");
        let client = await Client.findOne({email: req.body.email});
        if (!client) {
            res.status(500).send({message: "User does not exist "});
            throw Error("user does not exist ");
        }
        console.log(`http://${process.env.SERVER_IP}:${process.env.HTTP_PORT}/resetPassword/` + req.body.email + '/' + code);
        var mailOptions = {
            from: "alex12hitman@gmail.com",
            to: req.body.email,
            subject: "Your verification code ",
            text: `http://${process.env.SERVER_IP}:${process.env.HTTP_PORT}/resetPassword/` + req.body.email + '/' + code,
        };
        let hashCode = await bcrypt.hash(code, 8);
        await Client.findOneAndUpdate(
            {email: req.body.email},
            {pswRstCode: hashCode, pswRstDate: Date.now()}
        );

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log("Email sent: " + info.response);
            }
        });

        res.status(200).send({
            message: "We sent link to  reset password to your email  ",
        });
    };
    static userLog = async (dec, res, Client) => {
        let user = await Client.findById(dec.id);
        if (user) {
            if (user.passwordChangedAt) {
                let changedAt = parseInt(user.passwordChangedAt.getTime(), 10) / 1000;
                if (changedAt > dec.iat * 1) {
                    res.status(200).send({
                        message: "the session  is invalid, please login to start new",
                    });
                } else {
                    //give data
                    res.status(200).json({
                        message: "user is logged"
                    });
                }
            } else {
                res.status(200).json({
                    message: "user is logged"
                });
            }
        } else {
            res.send({message: "this user doesn't exist anymore"});
        }
    };
    static sendCode = async (res, transporter, Client, body) => {
        body.password = await bcrypt.hash(body.password, 10);

        let code = Math.floor(Math.random() * 10001);
        const mailOptions = {
            from: "alex12hitman@gmail.com",
            to: body.email,
            subject: "Your verification code ",
            text: code + "",
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log("Email sent: " + info.response);
            }
        });
        code = await bcrypt.hash(code + "", 8);
        body.emailConfirm = code;
        body.emailConfirmDate = Date.now();
        console.log(body);

        await Client.create(body);

        res.status(200).send({
            code: "success",
            message:
                "Registration is successful , please confirm your email , we send verification code to your email ",
        });
    };
    static confirmEmail = async (reqBody, Client, res) => {
        if (!reqBody.email || !reqBody.code) {
            res.status(500).send({message: "error, provide verification code"});
            throw Error("no email or verification");
        }
        let user = await Client.findOne({email: reqBody.email});
        if (!user.emailConfirm) {
            res.status(500).send({message: "The user is confirmed"});
            throw Error("user is confirmed");
        }

        let date = new Date(user.emailConfirmDate).getTime() / 1000;
        if (date + 300 < Date.now() / 1000) {
            res.status(200).send({message: "The code is old "});
            throw Error("The code is not valid");
        }
        let result = await bcrypt.compare(reqBody.code + "", user.emailConfirm);
        if (!result) {
            res.status(500).send({message: "The code is wrong"});
            throw Error("the code is wrong");
        }
        await Client.findOneAndUpdate(
            {email: reqBody.email},
            {
                emailConfirmed: true,
                emailConfirm: undefined,
                emailConfirmDate: undefined,
            }
        );
        res.status(200).send({message: "The email is succesfuly confirmed", code: "success"});
    };
    static resendEmailConfirm = async (transporter, reqBody, res, Client) => {
        let user = await Client.findOne({email: reqBody.email});
        if (!user.emailConfirm) {
            res.status(500).send({message: "The user is confirmed"});
            throw Error("user is confirmed");
        }

        let code = Math.floor(Math.random() * 10001);
        var mailOptions = {
            from: "alex12hitman@gmail.com",
            to: reqBody.email,
            subject: "Your verification code ",
            text: code + "",
        };
        code = await bcrypt.hash(code + "", 8);
        await Client.findOneAndUpdate(
            {email: reqBody.email},
            {emailConfirmDate: Date.now(), emailConfirm: code}
        );

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log("Email sent: " + info.response);
            }
        });

        res.status(200).send({
            message:
                "We resented  verification code to your email , please type code, it is valid for only 5 minutes",
        });
    };

}
