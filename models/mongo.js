//database
const mongoose = require("mongoose");
const uniquevalidator = require("mongoose-unique-validator");

const password = process.env.DB_PASSWORD;
const username = process.env.DB_USERNAME;
const uri = `mongodb+srv://${username}:${password}@cluster0.chuoszx.mongodb.net/?retryWrites=true&w=majority`;
mongoose.set("strictQuery", true);
mongoose
  .connect(uri)
  .then(() => console.log("connected to mongo!"))
  .catch((err) => console.error("Error connecting to Mongo!", err));

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true }, // refuser quelqu'un qui a la meme email
  password: { type: String, required: true },
});
userSchema.plugin(uniquevalidator);

const User = mongoose.model("User", userSchema);

module.exports = { mongoose, User };
