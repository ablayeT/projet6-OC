const { app, express } = require("./server");
const { sauceRouter } = require("./routers/sauce.router");
const { authRouter } = require("./routers/auth.router");
const port = 3000;
const path = require("path");

//conection to database
require("./mongo");

// Middleware
app.use("/api/sauces", sauceRouter);
app.use("/api/auth", authRouter);
// Routes
app.get("/", (req, res) => res.send("hello world"));

//listen
app.use("/images", express.static(path.join(__dirname, "images")));
app.listen(port, () => console.log("listening on port " + port));
