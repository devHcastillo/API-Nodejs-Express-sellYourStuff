const express = require("express");
const validateProduct = require("./Products.validate");
const productsRouter = express.Router();
const Logger = require("../../../Utils/Logger");
const Passport = require("passport");
const jwtAuthenticate = Passport.authenticate("jwt", { session: false });
const ProductController = require("./Products.controller");
const { error } = require("../../../Utils/Logger");

const checkId = (req, res, next) => {
  let id = req.params.id;

  if (id.match(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i) === null) {
    res.status(400).send(`El id [${id}]  suministrado no es valido`);
    return;
  }
  next();
};

productsRouter.get("/", (req, res) => {
  ProductController.getProducts()
    .then((products) => {
      res.json(products);
    })
    .catch((err) => {
      Logger.error(`Error al tratar de los productos`);
      res.status(500).send("Ocurrio un error al obtener los productos");
    });
});

productsRouter.post("/", [jwtAuthenticate, validateProduct], (req, res) => {
  ProductController.createProduct(req.body, req.user.username)
    .then((product) => {
      Logger.info("Producto agregado a la coleccion productos", product.toObject());
      res.status(201).json(product);
    })
    .catch((err) => {
      Logger.error(`Error al tratar de insertar el producto ${req.body.title}`);
      res.status(500).send("Ocurrio un error, intetelo otra vez");
    });
});

productsRouter.get("/:id", checkId, (req, res) => {
  const id = req.params.id;

  ProductController.getProduct(id)
    .then((product) => {
      if (!product) {
        res.status(404).send(`El producto con id ${req.params.id}, no existe`);
      }
      res.json(product);
    })
    .catch((err) => {
      Logger.error(`Error al tratar de obtener el producto con id ${id}`);
      res.status(500).send("Ocurrio un error, intetelo otra vez");
    });
});

productsRouter.put("/:id", [jwtAuthenticate, validateProduct], async (req, res) => {

  let id = req.params.id;
  let requestUser = req.user.username;
  let productToReplace;
  
  try {
    productToReplace = await ProductController.getProduct(id);
  } catch (error) {
    Logger.warn(`Excepcion ocurrio al procesar la modificacion del producto con id [${id}]`, err)
    res.status(500).send(`Error ocurrio modificando producto con id [${id}]`)
  }


  if(!productToReplace){
    res.status(404).send(`el producto con id [${id}] no existe`)
  }

  if(productToReplace.dueno !== requestUser){
    Logger.warn(`Usario ${requestUser} trato de actualizar el producto con id [${id}]. No es dueno`)
    res.status(401).send(`NO eres dueno del producto con id [${id}], no lo puede borrar`);
    return; 
  }

  ProductController.updateProduct(id,req.body, requestUser)
  .then(product => {
    res.json(product)
    Logger.info(`Producto con id [${id}] reemplazado con nuevo producto`, product.toObject())
  })
  .catch(err => {
    Logger.error(`Error al tratar de actualizar el producto con id [${id}]`)
    res.status(500).send("Error al tratar de actualizar el producto")
  })



});

productsRouter.delete("/:id", [jwtAuthenticate, checkId], async (req, res) => {
  let id = req.params.id;
  let productToDelete;

  try {
    productToDelete = await ProductController.getProduct(id);
  } catch (err) {
    Logger.error(
      `Error al tratar de eliminar el producto con id [${id}]`,
      error
    );
    res.status(500).send("Ocurrio un error, intetelo otra vez");
    return;
  }

  if (!productToDelete) {
    Logger.info(
      `Product with id[${req.params.id}] dont exist. Nothing to delete`
    );
    res.status(404).send("No existe ese producto, no se puede borrar");
    return;
  }

  let userAuthenticate = req.user.username;

  if(productToDelete.dueno !== userAuthenticate){
    Logger.info(`Usuerio [${userAuthenticate}] no es dueno del producto, por esta razon no lo puedes borrar`)
    res.status(401).send('No eres dueno del producto, por eso no lo puedes eliminar')
  }

  try {
      let dleteProduct = await ProductController.deleteProduct(id);
      Logger.info(`Producto ${dleteProduct} fue borrado`)
      res.json(dleteProduct);
  } catch (err){
    Logger.error(`Error`,err)
    res.status(500).send(`Error borrando el producto`)
  }
});

module.exports = productsRouter;
