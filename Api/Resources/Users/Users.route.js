const express = require("express");
const Logger = require("../../../Utils/Logger");
const userValidate = require("./Users.validate").validarUsuario;
const loginValidate = require("./Users.validate").validarPedidoLogin;
const usersRouter = express.Router();
const bcrytp = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../../../Config");
const UserController = require("./Users.controller");
const processErrors = require("../../Libs/errorHandler").processErrors;
const {
  DatosDeUsuarioYaEnUso,
  CredencialesIncorrectas,
} = require("./Users.error");

const transformarAlowercase = (req, res, next) => {
  req.body.username && (req.body.username = req.body.username.toLowerCase());
  req.body.email && (req.body.email = req.body.email.toLowerCase());
  next();
};

usersRouter.get(
  "/",
  processErrors((req, res) => {
    return UserController.getUsers().then((users) => {
      res.json(users);
    });
  })
);

usersRouter.post(
  "/",
  [userValidate, transformarAlowercase],
  processErrors((req, res) => {
    let newUser = req.body;

    return UserController.userExist(newUser.username, newUser.email)
      .then((userexist) => {
        if (userexist) {
          Logger.warn(
            `Email [${newUser.email}] o username [${newUser.username}] ya existe`
          );
          throw new DatosDeUsuarioYaEnUso();
        }
        return bcrytp.hash(newUser.password, 10);
      })
      .then((hashed) => {
        return UserController.createUser(newUser, hashed).then((user) => {
          res.status(201).send("Creacion exitosa");
        });
      });
  })
);

usersRouter.post(
  "/login",
  [loginValidate, transformarAlowercase],
  processErrors(async (req, res) => {
    let userNotAuteticate = req.body;
    let userRegister;

    userRegister = await UserController.getUser({
      username: userNotAuteticate.username,
    });

    if (!userRegister) {
      Logger.error(`usuario [${userNotAuteticate.username}] no registrado `);
      throw new CredencialesIncorrectas();
    }

    let constrasenaCorrecta;

    constrasenaCorrecta = await bcrytp.compare(
      userNotAuteticate.password,
      userRegister.password
    );

    if (constrasenaCorrecta) {
      //generar token
      let token = jwt.sign({ id: userRegister.id }, config.jwt.secreto, {
        expiresIn: config.jwt.tiempoDeExpiracion,
      });
      Logger.info(`Usuario ${userNotAuteticate.username} completo `);
      res.status(200).json({ token });
    } else {
      Logger.info(
        `Usuario ${userNotAuteticate.username} no completo autenticacion. contrasena incorrecta`
      );
      throw new CredencialesIncorrectas();
    }
  })
);

module.exports = usersRouter;
