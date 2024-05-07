const mongoose = require("mongoose");

const hasheschema = new mongoose.Schema({
  id: { type: String, required: true },
  SHA_1: { type: String, unique: true, required: true },
  SHA_256: { type: String, unique: true, required: true },
  MD5: { type: String, unique: true, required: true },
});

const hashModel = mongoose.model("hashes", hasheschema);

module.exports = { hashModel };
