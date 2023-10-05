require("dotenv").config();
const express = require("express");
const app = express();
const port = 3000;

const cors = require("cors");

// Middleware

app.use(cors());
app.use(express.json());
app.listen(port, () => console.log("listening on port " + port));

module.exports = { app, express };
