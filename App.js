const { app, express } = require("./server");
const { sauceRouter } = require("./routers/sauce.router");
const { authRouter } = require("./routers/auth.router");
const path = require("path");

//conection to database
require("./models/mongo");

// Middleware
app.use("/api/sauces", sauceRouter);
app.use("/api/auth", authRouter);
// Routes
app.get("/", (req, res) => res.send("hello world"));

//listen
app.use("/images", express.static(path.join(__dirname, "images")));
