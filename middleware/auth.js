const jwt = require("jsonwebtoken");

function userIdentification(req, res, next) {
  try {
    const header = req.header("authorization");
    //si header undefined   if(header==null)
    if (header == null) return res.status(403).send({ message: "invalid" });

    const token = header.split(" ")[1];
    if (token == null)
      return res.status(403).send({ message: "token cannot be null" });

    jwt.verify(token, process.env.JWT_PASSWORD, (err, decoded) => {
      if (err) return res.status(403).send({ message: "Token invalid" + err });
      next(); 
    });
  } catch (error) {
    return res.status(500).json({ erro: "Erreur lors de la requête!" });
  }
}

module.exports = { userIdentification };
