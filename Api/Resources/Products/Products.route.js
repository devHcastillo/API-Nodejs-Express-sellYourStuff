const express = require("express");
const _ = require("underscore");
const uuidv4 = require("uuid/v4");
const products = require("../../../Database").products;
const validateProduct = require("./Products.validate");
const productsRouter = express.Router();
const Logger = require('../../../Utils/Logger')

productsRouter.get("/", (req, res) => {
  res.json(products);
});

productsRouter.post("/", validateProduct, (req, res) => {
  let newProduct = req.body;

  newProduct.id = uuidv4();
  products.push(newProduct);
  Logger.info("Producto agregado a la coleccion productos", newProduct)
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

productsRouter.put("/:id", validateProduct, (req, res) => {
  let id = req.params.id;
  let newData = req.body;

  let indice = _.findIndex(products, (product) => {
    return product.id == id;
  });

  if (indice != -1) {
    newData.id = id;
    products[indice] = newData;
    Logger.info(`Product with id [${id}] has been update with`,newData)
    res.status(200).json(products[indice]);
    return;
  } else {
    res.status(404).send("No existe ese ID");
    return;
  }
});

productsRouter.delete("/:id", (req, res) => {
  let toDelete = _.findIndex(products, (product) => {
    return product.id == req.params.id;
  });
  if (toDelete === -1) {
    Logger.warn(`Product with id[${req.params.id}] dont exist. Nothing to delete`);
    res.status(404).send("No existe ese producto, no se puede borrar");
    return;
  }
  let borrado = products.splice(toDelete, 1);
  res.json(borrado);
});

module.exports = productsRouter;
