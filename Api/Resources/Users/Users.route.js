const express = require("express");
const _ = require("underscore");
const uuidv4 = require("uuid/v4");
const Logger = require("../../../Utils/Logger");
const users = require("../../../Database.js").users;
const userValidate = require("./Users.validate").validarUsuario;
const loginValidate= require("./Users.validate").validarPedidoLogin;
const usersRouter = express.Router();
const bcrytp = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require('../../../Config')

usersRouter.get("/", (req, res) => {
  res.json(users);
});

usersRouter.post("/", userValidate, (req, res) => { 
  let newUser = req.body;

  let indice = _.findIndex(users, (user) => {
    return (user.username = newUser.username || user.email === newUser.email);
  });

  if (indice !== -1) {
    Logger.info("Email o Username ya escogido");
    res.status(409).send("Ya existe un username o email repetido");
    return;
  }

  bcrytp.hash(newUser.password, 10, (error, hashedPassword) => {
    if (error) {
      Logger.error("ERROR al al tratar de hash la contrasena", error);
      res.status(500).send("server exploto");
      return;
    }
    users.push({
      username: newUser.username,
      password: hashedPassword,
      email: newUser.email,
      id: uuidv4(),
    });

    res.status(201).json("Usuario creado exitosamente");
  });
});

usersRouter.post("/login", loginValidate ,(req, res) => {
  let userNotAuteticate = req.body;

  let indice = _.findIndex(users, (user) => {
    return user.username == userNotAuteticate.username;
  });

  if (indice === -1) {
    Logger.info(`Username no existe ${userNotAuteticate.username}`);
    res.status(400).send("Credenciales incorrectas. El usuario no existe");
    return;
  }

  let hashedpassword = users[indice].password;

  bcrytp.compare(
    userNotAuteticate.password,
    hashedpassword,
    (error, isEqual) => {
      if (isEqual) { 
        //generar token
        let token = jwt.sign({ id: users[indice].id }, config.jwt.secreto, {
          expiresIn: config.jwt.tiempoDeExpiracion,
        });
        Logger.info(`Usuario ${userNotAuteticate.username} completo `)
        res.status(200).json({ token });
      } else {
        Logger.info(
          `Usuario ${userNotAuteticate.username} no completo autenticacion. contrasena incorrecta`
        );
        res.status(400).send("Error en las credenciales del usuario");
      }
    }
  );
});

module.exports = usersRouter;
