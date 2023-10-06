const { signupUser, loginUser } = require("../controllers/users");

const express = require("express");
const authRouter = express.Router();

authRouter.post("/signup", signupUser);
authRouter.post("/login", loginUser);

module.exports = { authRouter };
