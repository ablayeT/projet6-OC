require("dotenv").config();
const { app, express } = require("./app");
// ...

const port = 3000;

const cors = require("cors");

// Middleware
app.use(cors());
app.use(express.json());

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(port, () => console.log("listening on port " + port));

module.exports = { app, express };
