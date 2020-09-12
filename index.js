const express = require("express");
const bodyParser = require("body-parser");
const ProductsRouter = require("./Api/Resources/Products/Products.route");
const usersRouter = require("./Api/Resources/Users/Users.route")
const { json } = require("body-parser");
const { Joi } = require("@hapi/joi");
const Morgan = require("morgan");
const Logger = require("./Utils/Logger");
const Passport = require("passport");
const authJWT = require('./Api/Libs/Auth')
const config = require('./Config')

//Autenticacion de contrasena y usuario
//const BasicStrategy = require("passport-http").BasicStrategy;
Passport.use(authJWT);

const app = express();
app.use(bodyParser.json());
app.use(Morgan("short",
{
  stream: {
    write: ( message) => Logger.info(message.trim()),
  },
}));
app.use(Passport.initialize())
//Routes
app.use("/products", ProductsRouter);
app.use("/users", usersRouter);

console.log(config )

app.listen(config.port , () => {
  Logger.info("Listening from Port 3000");
});
