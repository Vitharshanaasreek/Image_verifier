const router = require("express").Router();
const jwt = require("jsonwebtoken");
const { hashModel } = require("../schema/hash");
const multer = require("multer");
const exiftool = require("exiftool-vendored").exiftool;
const crypto = require("crypto");
const upload = multer({ dest: "uploads/" });
const fs = require("fs");
const { userModel } = require("../schema/user");

router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const [bearer, token] = authHeader.split(" ");

    if (!token) {
      return res.status(401).send({ err: "Illegal access" });
    }

    const decodedToken = jwt.verify(token, process.env.JWTPRIVATEKEY);

    console.log("token", decodedToken);
    const imagePath = req.file.path;
    const imageData = fs.readFileSync(imagePath);

    const status = await new hashModel({
      id: decodedToken.id,
    }).save();

    if (status) {
      await exiftool.write(
        imagePath,
        {
          UserComment: `ID: ${status._id}`,
        },
        ["-UserComment"]
      );
      const modifiedImageData = fs.readFileSync(imagePath);
      const hashMD5 = crypto
        .createHash("md5")
        .update(modifiedImageData)
        .digest("hex");
      const hashSHA1 = crypto
        .createHash("sha1")
        .update(modifiedImageData)
        .digest("hex");
      const hashSHA256 = crypto
        .createHash("sha256")
        .update(modifiedImageData)
        .digest("hex");

      const updateStatus = await hashModel.findByIdAndUpdate(status._id, {
        $set: {
          SHA_1: hashSHA1,
          SHA_256: hashSHA256,
          MD5: hashMD5,
        },
      });
      return res
        .set({
          "Content-Type": "image/jpeg",
        })
        .send(modifiedImageData);
    }

    res.send({ msg: "SUCCESS" });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyValue) {
      // Duplicate key error
      const duplicatedKey = Object.keys(error.keyPattern)[0];
      const duplicatedValue = error.keyValue[duplicatedKey];
      const errorMessage = `The data  already exists.`;

      // Send error response
      return res.status(400).json({ error: errorMessage });
    }
    console.log("error", error);
    return res.status(500).send({ message: "Internal server error" });
  }
});

router.post("/verify", upload.single("image"), async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const [bearer, token] = authHeader.split(" ");

    if (!token) {
      return res.status(401).send({ err: "Illegal access" });
    }

    const decodedToken = jwt.verify(token, process.env.JWTPRIVATEKEY);

    const imagePath = req.file.path;
    const { UserComment } = await exiftool.read(imagePath, { json: true });
    if (!UserComment) {
      return res.send({ msg: "Image not autenticated" });
    }

    const ID = UserComment.split(" ")[1];
    if (!ID) {
      return res.send({ msg: "Image not autenticated" });
    }
    console.log(ID);

    const data = await hashModel.findById(ID);
    if (data == null) {
      return res.send({ msg: "Image not valid" });
    }

    const imageData = fs.readFileSync(imagePath);
    const hashMD5 = crypto.createHash("md5").update(imageData).digest("hex");
    const hashSHA1 = crypto.createHash("sha1").update(imageData).digest("hex");
    const hashSHA256 = crypto
      .createHash("sha256")
      .update(imageData)
      .digest("hex");

    console.log(hashSHA1, " ", data.SHA_1);

    if (
      hashSHA1 != data.SHA_1 ||
      hashSHA256 != data.SHA_256 ||
      hashMD5 != data.MD5
    ) {
      return res.send({ msg: "edited" });
    } else {
      return res.send(await userModel.findById(data.id, "name email -_id"));
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Internal server error" });
  }
});

module.exports = router;
