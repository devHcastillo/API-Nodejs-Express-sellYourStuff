const express = require("express");
const bodyParser = require("body-parser");
const uuidv4 = require("uuid/v4");
const _ = require("underscore");

const app = express();
app.use(bodyParser.json());
const products = [
  { id: "123123", title: "Bicicleta De Rosa", price: 1500, moneda: "USD" },
  { id: "123124", title: "Acer Predator Helios", price: 1200, moneda: "USD" },
  { id: "123132", title: "Note Pro 8", price: 300, moneda: "USD" },
];

//Routes
app.route("/products")
  .get((req, res) => {
    res.json(products);
  })
  .post((req, res) => {
    let newProduct = req.body;

    if (!newProduct.moneda || !newProduct.price || !newProduct.title) {
      res.status(400).send(`No cumple con los campos necesarios`);
      return;
    }
    newProduct.id = uuidv4();
    products.push(newProduct);
    res.status(201).json(newProduct);
  });

app.route("/products/:id")
    .get((req, res) => {
      for (let product of products) {
        if (product.id == req.params.id) {
          res.json(product);
          return;
        }
      }
      res.status(404).send(`El producto con id ${req.params.id}, no existe`);
    })
    .put((req, res) => {
      let id = req.params.id;
      let newData = req.body;
      if (!newData.moneda || !newData.price || !newData.title) {
        res.status(400).send(`No cumple con los campos necesarios`);
        return;
      }

      let indice = _.findIndex(products, (product) => { return product.id == id});
    
      if (indice != -1) {
        newData.id = id;
        products[indice] = newData;
        res.status(200).json(products[indice]);
        return
      } else {
        res.status(404).send("No existe ese ID");
        return;
      }
    });

    
app.get("/", (req, res) => {
  res.send("Inicio");
});

app.listen(3000, () => {
  console.log("Desde el puerto 3000");
});
