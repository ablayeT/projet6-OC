//database
const mongoose = require("mongoose");
const validateurUnique = require("mongoose-unique-validator");

const password = process.env.DB_PASSWORD;
const username = process.env.DB_USERNAME;
const uri = `mongodb+srv://${username}:${password}@cluster0.chuoszx.mongodb.net/?retryWrites=true&w=majority`;

mongoose
  .connect(uri)
  .then(() => console.log("connected to mongo!"))
  .catch((err) => console.error("Error connecti ng to Mongo!", err));

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true }, // refuser quelqu'un qui a la meme email
  password: { type: String, required: true },
});
userSchema.plugin(validateurUnique);

const User = mongoose.model("User", userSchema);

module.exports = { mongoose, User };
