const express = require("express");
const router = express.Router();
const { userModel, validate } = require("../schema/user");
const bcrypt = require("bcrypt");

router.post("/", async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });

    const user = await userModel.findOne({ email: req.body.email });

    if (user)
      return res
        .status(409)
        .send({ message: "user with given email is already exist" });

    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashpassword = await bcrypt.hash(req.body.password, salt);
    await new userModel({ ...req.body, password: hashpassword }).save();
    res.status(201).send({ message: "User created" });
  } catch (err) {
    res.status(500).send({ message: "Internal server error", err: err });
  }
});

module.exports = router;
