const express = require("express");
const validateProduct = require("./Products.validate");
const productsRouter = express.Router();
const Logger = require("../../../Utils/Logger");
const Passport = require("passport");
const jwtAuthenticate = Passport.authenticate("jwt", { session: false });
const ProductController = require("./Products.controller");
const { error } = require("../../../Utils/Logger");
const processErrors = require("../../Libs/errorHandler").processErrors;
const { ProductoNoExiste, UsuarioNoEsDueno } = require("./Product.error");

const checkId = (req, res, next) => {
  let id = req.params.id;

  if (id.match(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i) === null) {
    res.status(400).send(`El id [${id}]  suministrado no es valido`);
    return;
  }
  next();
};

productsRouter.get(
  "/",
  processErrors((req, res) => {
    return ProductController.getProducts().then((products) => {
      res.json(products);
    });
  })
);

productsRouter.post(
  "/",
  [jwtAuthenticate, validateProduct],
  processErrors((req, res) => {
    return ProductController.createProduct(req.body, req.user.username).then(
      (product) => {
        Logger.info(
          "Producto agregado a la coleccion productos",
          product.toObject()
        );
        res.status(201).json(product);
      }
    );
  })
);

productsRouter.get(
  "/:id",
  checkId,
  processErrors((req, res) => {
    const id = req.params.id;

    return ProductController.getProduct(id).then((product) => {
      if (!product) {
        throw new ProductoNoExiste(`Producto con id [${id}] no existe`);
      }
      res.json(product);
    });
  })
);

productsRouter.put(
  "/:id",
  [jwtAuthenticate, validateProduct],
  processErrors(async (req, res) => {
    let id = req.params.id;
    let requestUser = req.user.username;
    let productToReplace;

    productToReplace = await ProductController.getProduct(id);

    if (!productToReplace) {
      throw new ProductoNoExiste(`Producto con id [${id}] no existe`);
    }

    if (productToReplace.dueno !== requestUser) {
      Logger.warn(
        `Usario ${requestUser} trato de actualizar el producto con id [${id}]. No es dueno`
      );
      throw new UsuarioNoEsDueno();
    }

    ProductController.updateProduct(id, req.body, requestUser).then(
      (product) => {
        res.json(product);
        Logger.info(
          `Producto con id [${id}] reemplazado con nuevo producto`,
          product.toObject()
        );
      }
    );
  })
);

productsRouter.delete("/:id",[jwtAuthenticate, checkId],processErrors(async (req, res) => {
    let id = req.params.id;
    let productToDelete;
    console.log("ANTES DE BUSCAR")

    productToDelete = await ProductController.getProduct(id);
    console.log(productToDelete)


    if (!productToDelete) {
      Logger.info(
        `Product with id[${req.params.id}] dont exist. Nothing to delete`
      );
      throw new ProductoNoExiste(
        `Producto con id [${id}] no existe. Nada que borrar`
      );
    }

    let userAuthenticate = req.user.username;

    if (productToDelete.dueno !== userAuthenticate) {
      Logger.info(
        `Usuerio [${userAuthenticate}] no es dueno del producto, por esta razon no lo puedes borrar`
      );
      throw new UsuarioNoEsDueno();
    }

    let dleteProduct = await ProductController.deleteProduct(id);
    Logger.info(`Producto ${dleteProduct} fue borrado`);
    res.json(dleteProduct);
  })
);

module.exports = productsRouter;
