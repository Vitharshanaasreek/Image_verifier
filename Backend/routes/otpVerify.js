const router = require("express").Router();
const smtpTransporter = require("nodemailer-smtp-transport");
const nodemailer = require("nodemailer");
const { userModel, validate } = require("../schema/user");
const otp = require("otp-generator");
const bcrypt = require("bcrypt");
const Joi = require("joi");
var jwt = require("jsonwebtoken");

const transporter = nodemailer.createTransport(
  smtpTransporter({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PWD,
    },
  })
);

const otpmap = new Map();

router.post("/otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.send({ msg: "email id required" });
    }
    console.log(email);
    const otpvalue = otp.generate(4, {
      digits: true,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    const exptime = 10 * 60 * 1000;
    otpmap.set(email, { code: otpvalue, exptime: exptime + Date.now() });
    const timeId = setTimeout(() => {
      otpmap.delete(email);
    }, exptime);
    const mailOptions = {
      to: email,
      subject: "OTP Verification Code",
      html: ` <html>
                   <head>
                  <style>
                      body {
                          font-family: Arial, sans-serif;
                          background-color: #f4f4f4;
                          margin: 0;
                          padding: 0;
                      }
                      .container {
                          max-width: 600px;
                          margin: 0 auto;
                          padding: 20px;
                          background-color: #fff;
                          border-radius: 5px;
                          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                      }
              
                      .header {
                          background-color: #007BFF;
                          color: #fff;
                          text-align: center;
                          padding: 20px;
                      }
              
                      .header h1 {
                          font-size: 24px;
                      }
              
                      .content {
                          padding: 20px;
                      }
              
                      .content p {
                          font-size: 16px;
                      }
              
                      .otp-code {
                          font-size: 28px;
                          text-align: center;
                          padding: 10px;
                          background-color: #007BFF;
                          color: #fff;
                          border-radius: 5px;
                      }
              
                      .footer {
                          text-align: center;
                          margin-top: 20px;
                      }
              
                      .footer p {
                          font-size: 14px;
                      }
                  </style>
              </head>
              <body>
                  <div class="container">
                      <div class="header">
                          <h1>OTP Verification</h1>
                      </div>
                      <div class="content">
                          <p>Dear User,</p>
                          <p>Your OTP code for verification is:</p>
                          <div class="otp-code">${otpvalue}</div>
                      </div>
                      <div class="footer">
                          <p>This is an automated message, please do not reply.</p>
                      </div>
                  </div>
              </body>
              </html>
              `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.json({ message: "Failed", error: "Error in sending email" });
      } else {
        console.log("Email sent: " + info.response);
        return res.json({ msg: "SUCCESS" });
      }
    });
  } catch (error) {
    res.status(500).send({ err: "internal server error" });
  }
});

router.post("/verifyOtp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const otpValue = otpmap.get(email);
    if (!otp || !email) {
      return res.send({ msg: "otp not valid" });
    }
    if (!otpValue) {
      return res.send({ msg: "OTP expired or invalid" });
    } else if (otpValue.code == otp && otpValue.exptime > Date.now()) {
      console.log(otpValue);
      return res.json({ msg: "SUCCESS", verifyotp: otpValue.code });
    } else if (otpValue.code != otp) {
      return res.json({ msg: "Failed", error: "invalid otp" });
    }
  } catch (error) {
    res.status(500).send({ msg: "internal server error", err: error });
  }
});

router.post("/setpwd", async (req, res) => {
  try {
    console.log(otpmap);
    const { otp, password, emailId } = req.body;
    const data = {
      name: req.body.name,
      email: req.body.emailId,
      password: req.body.password,
      otp: req.body.otp,
    };
    const db = {
      name: req.body.name,
      email: req.body.emailId,
    };
    const otpValue = otpmap.get(emailId);
    const { error } = validate(data);
    if (error)
      return res.status(400).send({ message: error.details[0].message });

    if (!otp || !emailId) {
      return res.send({ msg: "otp not valid" });
    }
    if (!otpValue) {
      return res.send({ msg: "FAILED", info: "OTP expired or invalid" });
    } else if (otpValue.code == otp && otpValue.exptime > Date.now()) {
      console.log(otpValue);

      const user = await userModel.findOne({ email: req.body.emailId });

      if (user)
        return res.status(409).send({
          msg: "FAILED",
          info: "user with given email is already exist",
        });

      const salt = await bcrypt.genSalt(Number(process.env.SALT));
      const hashpassword = await bcrypt.hash(req.body.password, salt);
      const status = await new userModel({
        ...db,
        password: hashpassword,
      }).save();
      if (status._id) {
        return res.status(201).send({ msg: "SUCCESS", info: "User Created" });
      }
      res.status(201).send({ msg: "FAILED", info: "User Creation Failed" });
    } else if (otpValue.code != otp) {
      return res.json({ msg: "FAILED", info: "invalid otp" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "internal server error", err: error });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { error } = check(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });

    const user = await userModel.findOne({ email: req.body.email });
    if (!user)
      return res.status(401).send({ message: " Invalid Email or password" });

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!validPassword)
      return res.status(401).send({ message: "Invalid email or password" });
    const updateToken = await userModel.findOne({ email: req.body.email });

    var token = jwt.sign(
      { user: req.body.email, id: updateToken?._id },
      process.env.JWTPRIVATEKEY,
      {
        expiresIn: "30m",
      }
    );
    updateToken.token = token;
    await updateToken.save();
    res.status(200).send({ token: token, message: "Logged in successfully" });

    console.log(validPassword);
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "internal server error", err: error });
  }
});

const check = (data) => {
  const schema = Joi.object({
    email: Joi.string().required().label("Email"),
    password: Joi.string().required().label("Password"),
  });
  return schema.validate(data);
};

module.exports = router;
