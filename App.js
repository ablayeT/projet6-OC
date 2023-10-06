const express = require("express");
const app = express();
const cors = require("cors");

// Middleware et configuration ici

app.use(cors());
app.use(express.json());

// Routes
const { sauceRouter } = require("./routers/sauce.router");
const { authRouter } = require("./routers/auth.router");
const path = require("path");

app.use("/api/sauces", sauceRouter);
app.use("/api/auth", authRouter);

// Gestionnaire de route de base pour la page d'accueil
app.get("/", (req, res) => {
  res.send("Hello World");
});

//gestion des fichiers statiques (images)
app.use("/images", express.static(path.join(__dirname, "/images")));

module.exports = { app, express };
