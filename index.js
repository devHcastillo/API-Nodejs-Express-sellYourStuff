const express = require("express");
const bodyParser = require("body-parser");

const ProductsRouter = require('./Api/Resources/Products/Products.route')

const app = express();
app.use(bodyParser.json());

app.use('/products',ProductsRouter);


app.get("/", (req, res) => {
  res.send("Inicio");
});

app.listen(3000, () => {
  console.log("Desde el puerto 3000");
});
