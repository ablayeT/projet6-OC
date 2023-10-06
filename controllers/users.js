const { User } = require("../models/mongo");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function signupUser(req, res) {
  console.log("signup en cours");
  try {
    const { email, password } = req.body;
    const hashedPassword = await hashPassword(password);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    res.status(201).send({ message: "utilisateur enrgistré !" });
  } catch (err) {
    res.status(409).send({ message: "utlisateur non enregistré :" + err });
  }
}
function hashPassword(password) {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

async function loginUser(req, res) {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const user = await User.findOne({ email: email });

    const isPasswordOk = await bcrypt.compare(password, user.password);

    if (!isPasswordOk) {
      res.status(403).send({ message: "Mot de passe incorrect" });
    }
    const token = creerToken(email);
    res.status(200).send({ userId: user?._id, token: token });
  } catch (err) {
    res.status(500).send({ message: "erreur interne" });
  }
}

function creerToken(email) {
  const jwtPassword = process.env.JWT_PASSWORD;
  return jwt.sign({ email: email }, jwtPassword, { expiresIn: "24h" });
}

module.exports = { signupUser, loginUser };
