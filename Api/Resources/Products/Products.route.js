const express = require("express");
const _ = require("underscore");
const uuidv4 = require("uuid/v4");
const products = require("../../../Database").products;
const validateProduct = require("./Products.validate");
const productsRouter = express.Router();
const Logger = require("../../../Utils/Logger");
const Passport = require("passport");

const jwtAuthenticate = Passport.authenticate("jwt", { session: false });

productsRouter.get("/", (req, res) => {
  res.json(products);
});

productsRouter.post("/", [jwtAuthenticate, validateProduct], (req, res) => {  
  let newProduct = {
    ...req.body,
    id: uuidv4(),
    dueno: req.user.username
  };

 // newProduct.id = uuidv4();
  products.push(newProduct);
  Logger.info("Producto agregado a la coleccion productos", newProduct);
  res.status(201).json(newProduct);
});

productsRouter.get("/:id", (req, res) => {
  for (let product of products) {
    if (product.id == req.params.id) {
      res.json(product);
      return;
    }
  }
  res.status(404).send(`El producto con id ${req.params.id}, no existe`);
});

productsRouter.put("/:id", [jwtAuthenticate,validateProduct], (req, res) => {
  let reempazoParaProducto = {
    ...req.body,
    id: req.params.id,
    dueno: req.user.username
  }
  
  // let id = req.params.id;
  // let newData = req.body;

  let indice = _.findIndex(products, (product) => {
    return product.id == reempazoParaProducto.id;
  });

  if (indice != -1) {

    if(products[indice].dueno !== reempazoParaProducto.dueno){
      res.status(401).send('No eres dueno del producto con id'+ reempazoParaProducto.id)
      return
    }

    products[indice] = reempazoParaProducto;
    Logger.info(`Product with id [${reempazoParaProducto.id}] has been update with`, reempazoParaProducto);
    res.status(200).json(products[indice]);
    return;
  } else {
    res.status(404).send("No existe ese ID");
    return;
  }
});

productsRouter.delete("/:id", jwtAuthenticate,(req, res) => {
  let toDelete = _.findIndex(products, (product) => {
    return product.id == req.params.id;
  });
  if (toDelete === -1) {
    Logger.warn(
      `Product with id[${req.params.id}] dont exist. Nothing to delete`
    );
    res.status(404).send("No existe ese producto, no se puede borrar");
    return;
  }
  if(products[toDelete].dueno !== req.user.username){
    res.status(401).send('No eres dueno del producto con id'+ products[toDelete].id)
    return
  }
  let borrado = products.splice(toDelete, 1);
  res.json(borrado);
});

module.exports = productsRouter;
