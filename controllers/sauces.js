const { ServerResponse } = require("http");
const mongoose = require("mongoose");
const { unlink } = require("fs").promises; // supprime quelque checkClientResponse
const Item = require("../models/sauceModels");

function getSauces(req, res) {
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
    .then((product) => {
      if (!product) {
        return res
          .status(404)
          .send({ message: "Produit non trouvé dans la base de données" });
      }
      res.status(200).send(product);
    })
    .catch((err) => {
      console.error(err);
      res
        .status(500)
        .send({ message: "Erreur lors de la récupération du produit" });
    });
}

function deleteSauces(req, res) {
  const { id } = req.params;

  Item.findByIdAndDelete(id)
    .then((product) => {
      if (!product) {
        return res
          .status(404)
          .send({ message: "Produit non trouvé dans la base de données" });
      }
      return deleteImage(product).then(() => {
        res.status(200).send({ message: "Produit supprimé avec succès" });
      });
    })
    .catch((error) => {
      console.error(error);
      res
        .status(500)
        .send({ message: "Erreur lors de la suppression du produit" });
    });
}

function modifySauces(req, res) {
  const { id } = req.params;
  const isNewImage = req.file != null;
  const payload = makePayload(isNewImage, req);

  Item.findByIdAndUpdate(id, payload)
    .then((dbResponse) => {
      if (!dbResponse) {
        return res
          .status(404)
          .send({ message: "Produit non trouvé dans la base de données" });
      }
      return deleteImage(dbResponse).then(() => {
        console.log("FILE DELETED");
        res.status(200).send({ message: "Produit modifié avec succès" });
      });
    })
    .catch((err) => {
      console.error("Problème lors de la modification", err);
      res
        .status(500)
        .send({ message: "Erreur lors de la modification du produit" });
    });
}

async function deleteImage(product) {
  if (product == null) return;

  const imageToDelete = product.imageUrl.split("/").pop(); // Obteneir le nom du fichier à partir de l'URL
  const imagePath = "images/" + imageToDelete;

  try {
    await unlink(imagePath);
    console.log("FILE DELETED");
  } catch (error) {
    console.error("Erreur lors de la suppression du fichier :", error);
  }
}

function makePayload(isNewImage, req) {
  if (!isNewImage) return req.body;
  const payload = JSON.parse(req.body.sauce);
  payload.imageUrl = makeImageUrl(req, req.file.fileName);

  return payload;
}

function checkClientResponse(product, res) {
  if (product == null) {
    return res
      .status(404)
      .send({ message: "Produit non trouvé dans la base de donnée" });
  }
  return Promise.resolve(res.status(200).send(product)).then(() => product);
}

async function createSauce(req, res) {
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

  // Vérifie si l'utilisateur a déjà aimé et disliké la sauce
  if ([usersLiked, usersDisliked].every((arr) => arr.includes(userId)))
    return Promise.reject("User seems to have liked both ways");

  // Vérifie si l'utilisateur n'a pas voté pour la sauce
  if (![usersLiked, usersDisliked].some((arr) => arr.includes(userId)))
    return Promise.reject("users seems to have not voted");

  // Si l'utilisateur a déjà aimé la sauce, réduit le nombre de likes et le retire de la liste des utilisateurs qui ont aimé
  if (usersLiked.includes(userId)) {
    --product.likes;
    product.usersLiked = product.usersLiked.filter((id) => id !== userId);
  } else {
    // Si l'utilisateur a déjà disliké la sauce, réduit le nombre de dislikes et le retire de la liste des utilisateurs qui ont disliké
    --product.dislikes;
    product.usersDisliked = product.usersDisliked.filter((id) => id !== userId);
  }

  return product; // Retourne l'objet modifié (sauce)
}

function incrementLike(product, userId, like) {
  const { usersLiked, usersDisliked } = product;

  const likesArray = like === 1 ? usersLiked : usersDisliked;
  if (likesArray.includes(userId)) return product;
  likesArray.push(userId);

  like === 1 ? ++product.likes : ++product.dislikes;
  return product;
}

module.exports = {
  getSauces,
  createSauce,
  getSaucesById,
  deleteSauces,
  modifySauces,
  likeSauce,
};
//getSaucesById
// fs signifit : file system: permet de supprimer localement et de la base de donnée un element avec node
