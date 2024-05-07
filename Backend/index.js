require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const userRoutes = require("./models/routes/users");
const loginRoutes = require("./models/routes/auth");
const upload = require("./models/routes/hash");

app.use(cors());
app.use(express.json());

const connectionParams = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

app.use("/api/users", userRoutes);
app.use("/api/auth", loginRoutes);
app.use("/api", upload);

mongoose.connect(process.env.DB, connectionParams).then(() => {
  console.log("Database connected successfully!!!😀");
  app.listen(process.env.PORT, () =>
    console.log(`Server started on ${process.env.PORT}`)
  );
});
