const multer = require("multer");

const storage = multer.diskStorage({
  destination: "images/",
  filename: function (req, file, cb) {
    cb(null, creerFilename(req, file));
  },
});

function creerFilename(req, file) {
  const fileName = `${Date.now()}-${file.originalname}`.replace(/\s/g, "-");
  file.fileName = fileName;
  return fileName;
}
const upload = multer({ storage });

module.exports = { upload };
