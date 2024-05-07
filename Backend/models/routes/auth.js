require("dotenv").config();
const router = require("express").Router();
const { userModel } = require("../user");
const Joi = require("joi");
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");

router.post("/", async (req, res) => {
  try {
    const { error } = validate(req.body);
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
        expiresIn: "15m",
      }
    );
    updateToken.token = token;
    await updateToken.save();
    res.status(200).send({ token: token, message: "Logged in successfully" });
  } catch (err) {
    res.status(500).send({ message: "Internal server error" });
  }
});

const validate = (data) => {
  const schema = Joi.object({
    email: Joi.string().required().label("Email"),
    password: Joi.string().required().label("Password"),
  });
  return schema.validate(data);
};

module.exports = router;