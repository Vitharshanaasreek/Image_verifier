const router = require("express").Router();
const jwt = require("jsonwebtoken");
const { hashModel } = require("../hash");

router.post("/upload", async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (token) {
      const tokenPayload = token.split(" ")[1];
      let id;

      jwt.verify(tokenPayload, process.env.JWTPRIVATEKEY, (err, decoded) => {
        if (err) {
          console.error("Error decoding token:", err);
          return res.status(200).send({ message: "expired" });
        } else {
          id = decoded.id;
        }
      });
      if (id) {
        const { hash } = req.body;
        const status = await new hashModel({
          id: id,
          SHA_1: hash.sha1Hash,
          SHA_256: hash.sha256Hash,
          MD5: hash.md5Hash,
        }).save();
        if (status) {
          return res
            .status(200)
            .send({ message: "hash stored successfully", status: "success" });
        }
      } else {
        return res.status(200).send({ message: "Id not found" });
      }
    }
  } catch (error) {
    console.log("error", error);
    return res.status(500).send({ message: "Internal server error" });
  }
});

router.post("/verify", async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (token) {
      const tokenPayload = token.split(" ")[1];
      let id;
      jwt.verify(tokenPayload, process.env.JWTPRIVATEKEY, (err, decoded) => {
        if (err) {
          console.error("Error decoding token:", err);
          return res.status(200).send({ message: "expired" });
        } else {
          id = decoded.id;
        }
      });
    }
  } catch (error) {
    return res.status(500).send({ message: "Internal server error" });
  }
});

module.exports = router;
