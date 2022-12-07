const { User } = require("../mongo");
const bcrypt = require("bcrypt");

async function createUser(req, res) {
  const { email, password } = req.body;

  const hashedPassword = await hashPassword(password);

  console.log("password:", password);
  console.log("hashedPassword:", hashedPassword);

  const user = new User({ email, password: hashedPassword });
  user
    .save()
    .then(() => res.status(201).send({ message: "utilisateur enrgistré !" }))
    .catch((err) =>
      res.status(409).send({ message: "user pas enregistré :", err })
    );
}
function hashPassword(password) {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

async function loginUser(req, res) {
  const email = req.body.email;
  const password = req.body.password;
  const user = User.findOne({ email: email }).then(console.log);

  const isPasswordOk = await bcrypt.compare(password, user.password);
  if (!isPasswordOk) {
    res.status(403).send({ message: "Mot de passe incorrect" });
  }
  if (isPasswordOk) {
    res.status(200).send({ message: "connexion réussie" });
  }
  console.log("user;", user);
  console.log(("ispasswordOk:", isPasswordOk));
}

module.exports = { createUser, loginUser };
