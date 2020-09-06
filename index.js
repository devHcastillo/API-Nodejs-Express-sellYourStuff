const express = require("express");
const bodyParser = require("body-parser");
const ProductsRouter = require("./Api/Resources/Products/Products.route");
const { json } = require("body-parser");
const { Joi } = require("@hapi/joi");
const Morgan = require('morgan');
const Logger = require("./Utils/Logger");

const app = express();
app.use(bodyParser.json());
app.use(Morgan('short', {
  stream: {
    write: message => Logger.info(message.trim()), 
  }
}));

//Routes
app.use("/products", ProductsRouter);

app.get("/", (req, res) => {
  res.send("Inicio");
});

app.listen(3000, () => {
Logger.info("Listening from Port 3000")
});
