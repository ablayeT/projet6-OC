const express = require("express");
const {
  getSauces,
  createSauce,
  getSaucesById,
  deleteSauces,
  modifySauces,
  likeSauce,
} = require("../src/controllers/sauces");

// Middleware
const { upload } = require("../middleware/multer");
const { userIdentification } = require("../middleware/auth");

const sauceRouter = express.Router();
sauceRouter.use(userIdentification);

sauceRouter.get("/", getSauces);
sauceRouter.post("/", upload.single("image"), createSauce);
// les :id indiquent que l'id est variable
sauceRouter.get("/:id", getSaucesById);
sauceRouter.delete("/:id", deleteSauces);
sauceRouter.put("/:id", upload.single("image"), modifySauces);
sauceRouter.post("/:id/like", likeSauce);
module.exports = { sauceRouter };
