const mongoose = require("mongoose");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  token: { type: String },
});

const userModel = mongoose.model("users", userSchema);

const validate = (data) => {
  const schema = Joi.object({
    name: Joi.string().required().label("Name"),
    email: Joi.string().email().required().label("Email Id"),
    password: passwordComplexity().required().label("Password"),
    otp: Joi.string().length(4).pattern(/^\d+$/).required().label("OTP"),
  });
  return schema.validate(data);
};
module.exports = { userModel, validate };
