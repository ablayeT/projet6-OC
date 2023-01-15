const { ServerResponse } = require("http");
const mongoose = require("mongoose");
const { userInfo } = require("os");
const { isErrored } = require("stream");
const { unlink } = require("fs").promises; // supprime quelque chose

const itemSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  manufacturer: { type: String, required: true },
  description: { type: String, required: true },
  mainPepper: { type: String, required: true },
  imageUrl: { type: String, required: true },
  heat: { type: Number, required: true },
  likes: { type: Number, required: false, default: 0 },
  dislikes: { type: Number, required: false, default: 0 },
  usersLiked: { type: [String], required: false },
  usersDisliked: { type: [String], required: false },
});
// fabrication du model
const Item = mongoose.model("Item", itemSchema);

function getSauces(req, res) {
  //pourt tout supprimer dans la base de donnée.
  // Item.deleteMany({}).then(console.log).catch(console.error);
  console.log("le token a été validé nous sommes dans getSauces");
  //identifierUser(req, res);
  //console.log("le token a l'aire bon", decoded);
  Item.find({})
    .then((items) => {
      res.status(200).json(items);
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
}
function getItemSauce(req, res) {
  const { id } = req.params;
  return Item.findById(id);
}
function getSaucesById(req, res) {
  getItemSauce(req, res)
    .then((product) => checkClientResponse(product, res))
    .catch((err) => res.status(500).send(err));
  /*try {
    const { id } = req.params; // recupere l'id dans l'url
    const item = await Item.findById(id);
    res.send(item);
  } catch (error) {
    res.status(500).send(error);
  }*/
}
/**
 * 
 function getSaucesById(req, res) {
  const {id} = req.params.id
}
 */

function deleteSauces(req, res) {
  const { id } = req.params;
  // suppression envoyée mongo
  Item.findByIdAndDelete(id)

    // notification de succés au client
    .then((product) => checkClientResponse(product, res))
    .then((item) => deleteImage(item))
    .then((res) => console.log("FILE DELETED", res))
    .catch((error) => res.status(500).send({ message: error }));
}

function modifySauces(req, res) {
  const {
    params: { id },
  } = req;

  const isNewImage = req.file != null;
  const payload = makePayload(isNewImage, req);

  // Mettre à jour la base de donnée
  Item.findByIdAndUpdate(id, payload)
    .then((dbResponse) => checkClientResponse(dbResponse, res))
    .then((product) => deleteImage(product))
    .then((res) => console.log("FILE DELETED", res))
    .catch((err) => console.error("Probème lors de la modification", err));
}
function deleteImage(product) {
  if (product == null) return;
  console.log("DELETE IMAGE", product);
  const imageToDelete = product.imageUrl.split("/").at(-1);
  //.....split("/").at(-1) = supprime le dernier élément
  return unlink("images/" + imageToDelete);
}
/*function  deleteImage(product) {
  if (product == null) return;
  console.log("DEKET IMAGE", product);
}*/

function makePayload(isNewImage, req) {
  console.log("isNewImage:", isNewImage);
  if (!isNewImage) return req.body;
  const payload = JSON.parse(req.body.sauce);
  payload.imageUrl = makeImageUrl(req, req.file.fileName);
  console.log("NOUVELLE IMAGE A GERER");
  console.log("Voici le payload:", payload);
  return payload;
}

function checkClientResponse(product, res) {
  if (product == null) {
    console.log("RIEN A MODIFIER");
    return res
      .status(404)
      .send({ message: "Produit non trouvé dans la base de donnée" });
  }
  console.log("All GOOD, UPDATING;", product);
  return Promise.resolve(res.status(200).send(product)).then(() => product);
}

async function creerSauce(req, res) {
  const { body, file } = req;
  const { fileName } = file;
  const sauce = JSON.parse(body.sauce);
  const { name, manufacturer, description, mainPepper, heat, userId } = sauce;

  const item = new Item({
    userId: userId,
    name: name,
    manufacturer: manufacturer,
    description: description,
    mainPepper: mainPepper,
    imageUrl: makeImageUrl(req, fileName),
    heat: heat,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: [],
  });
  await item
    .save()
    .then((response) => {
      //response = message
      res.status(201).send(response);
    })
    .catch((err) => console.log(err));
}

function makeImageUrl(req, fileName) {
  return req.protocol + "://" + req.get("host") + "/images/" + fileName;
}

function likeSauce(req, res) {
  const { like, userId } = req.body;
  if (![0, -1, 1].includes(like))
    return res.status(403).send({ message: "Invalid like value" });

  getItemSauce(req, res)
    .then((product) => updateLike(product, like, userId, res))
    .then((prod) => prod.save())
    .then((itemLikes) => checkClientResponse(itemLikes, res))
    .catch((err) => res.status(500).send(err));
}
function updateLike(product, like, userId, res) {
  if (like === 1 || like === -1) return incrementLike(product, userId, like);
  return resetLike(product, userId, res);
}
function resetLike(product, userId, res) {
  const { usersLiked, usersDisliked } = product;
  if ([usersLiked, usersDisliked].every((arr) => arr.includes(userId)))
    return Promise.reject("User seems to have liked both ways");

  if (![usersLiked, usersDisliked].some((arr) => arr.includes(userId)))
    return Promise.reject("users seems to have not voted");

  if (usersLiked.includes(userId)) {
    --product.likes;
    product.usersLiked = product.usersLiked.filter((id) => id !== userId);
  } else {
    --product.dislikes;
    product.usersDisliked = product.usersDisliked.filter((id) => id !== userId);
  }
  console.log("RESET AFTER:", product);
  return product;
}

function incrementLike(product, userId, like) {
  const { usersLiked, usersDisliked } = product;

  const likesArray = like === 1 ? usersLiked : usersDisliked;
  if (likesArray.includes(userId)) return product;
  likesArray.push(userId);

  like === 1 ? ++product.likes : ++product.dislikes;
  return product;
}

/*function decrementLlike(product, userId) {
  const { usersDisliked } = product;
  if (usersDisliked.includes(userId)) return;
  usersDisliked.push(userId);
  product.dislikes++;
  console.log("product after dislikes", product);
}*/

module.exports = {
  getSauces,
  creerSauce,
  getSaucesById,
  deleteSauces,
  modifySauces,
  likeSauce,
};
//getSaucesById
// fs signifit : file system: permet de supprimer localement et de la base de donnée un element avec node
