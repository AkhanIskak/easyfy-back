
import express from "express";
import User from "./Classes/User"
import db from "./clientmodel/clientModel"
const Client = db.client;
import bcrypt from "bcrypt";

import jwt from "jsonwebtoken"
import nodeMailer from "nodemailer"
let app = express();

var transporter = nodeMailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'alex12hitman@gmail.com',
		pass: 'yilmaz2015'
	}
});

app.use(express.json());

db.mongoose
	.connect(
		"mongodb+srv://akhan:yaeTjxjoRcC50EX5@cluster0.eyg7o.mongodb.net/<clients>?retryWrites=true&w=majority",
		{
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useFindAndModify: false,
			useCreateIndex: true,
		}
	)
	.then(() => console.log("connected to DB"));

app.post("/register",async (req, res) => {

	for (const [key, value] of Object.entries(req.body)) {
		if(!value)res.status(200).json({message:"please fill all required fields"})
	  }
	let client = await Client.findOne({$or: [
		{ email: req.body.email },
		{ phone: req.body.nickname }]});

		if (client) {
			res.status(200).send({ message: "This email or nickname are already in use" });
		} else {
			User.sendCode(res, transporter, Client, req.body)
		}
});

app.post("/changePassword", (req, res) => {
	if (req.body.email && req.body.password && req.body.newPassword) {
		Client.findOne({ email: req.body.email }).then(el => {
			bcrypt.compare(req.body.password, el.password).then(function (result) {
				if (result) {
					bcrypt.hash(req.body.newPassword, 10).then(psw => {
						Client.findOneAndUpdate(
							{ email: req.body.email },
							{ password: psw, passwordChangedAt: Date.now() }
						).then(() =>
							res.status(200).send({ message: "password is reset", info: el })
						);
					});
				} else {
					res.status(200).send({ message: "The old password is wrong " });
				}
			});
		});
	} else {
		res.status(200).send({ message: "Please fill all fields" });
	}
});
app.post('/confirmEmail', (req, res) => {
	User.confirmEmail(req.body, Client, res);
})
app.post('/resendCode', (req, res) => {
	User.resendEmailConfirm(transporter, req.body, res, Client)
})
app.post("/login", (req, res) => {
	if (req.body.password && req.body.email) {
		Client.findOne({ email: req.body.email }).then(answ => {
			if (answ) {
				bcrypt
					.compare(req.body.password, answ.password)
					.then(function (result) {
						if (result) {
							//sign jwt
							const token = jwt.sign(
								{ id: answ._id },
								"secret",
								{
									expiresIn: 1000,
								},
								function (err, token) {
									res.status(200).send({
										message: "User is successfuly loged in ",
										jwt: token,
										nickname: answ.nickname,
									});
								}
							);

							//
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
app.post('/forgotPassword', (req, res) => {

	User.resetPassword(req, res, Client, transporter);
})

app.get('/resetPassword/:email/:code', (req, res) => {
	if (req.params) {

		User.changePassword(req, res, Client);
	}
	else {
		res.status(500).send({ message: "error" })
	}
})
app.listen(5000, () => console.log("server is listening"));
