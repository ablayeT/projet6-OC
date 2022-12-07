require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
const port = 3000;

//conection to database
require("./mongo");
const { createUser, loginUser } = require("./controllers/users");
// middleware

app.use(cors());
app.use(express.json());

// Routes

app.post("/api/auth/signup", createUser);
app.post("/api/auth/login", loginUser);
app.get("/", (req, res) => res.send("hello world"));
app.listen(port, () => console.log("listening on port " + port));
