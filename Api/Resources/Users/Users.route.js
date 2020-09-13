const express = require("express");
const Logger = require("../../../Utils/Logger");
const userValidate = require("./Users.validate").validarUsuario;
const loginValidate = require("./Users.validate").validarPedidoLogin;
const usersRouter = express.Router();
const bcrytp = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../../../Config");
const UserController = require("./Users.controller");

const transformarAlowercase = (req, res, next) => {
  req.body.username && (req.body.username = req.body.username.toLowerCase());
  req.body.email && (req.body.email = req.body.email.toLowerCase());
  next();
};

usersRouter.get("/", (req, res) => {
  UserController.getUsers()
    .then((users) => {
      res.json(users);
    })
    .catch((err) => {
      Logger.error(`Error al obtener todos los usuarios`, err);
      res.sendStatus(500);
    });
});

usersRouter.post("/", [userValidate, transformarAlowercase], (req, res) => {
  let newUser = req.body;

  UserController.userExist(newUser.username, newUser.email)
    .then((userexist) => {
      if (userexist) {
        Logger.warn(
          `Email [${newUser.email}] o username [${newUser.username}] ya existe`
        );
        res.status(409).send("El email o usuario ya estan en eso");
        return;
      }
     // console.log(newUser.password)

      bcrytp.hash(newUser.password, 10, (err, hashed) => {
        if (err) {
          Logger.error(`Error al hacer hash de la contrasena`, err);
          res, status(500).send("Error procesando creacion del usuario");
          return;
        }
        UserController.createUser(newUser, hashed)
          .then((user) => {
            //console.log(hashed)
            res.status(201).send("Creacion exitosa");
          })
          .catch((err) => {
            Logger.error(`Error al crear usuario`, err);
            res, status(500).send("Error procesando creacion del usuario");
          });
      });
    })
    .catch((err) => {
      Logger.error(
        `Ocurrio un error al tratar de verificar el email [${newUser.email}] o username [${newUser.username}]`
      );
      res.status(500).send("Ocurrio un error al crear usuario");
    });
});

usersRouter.post(
  "/login",
  [loginValidate, transformarAlowercase],
  async (req, res) => {
    let userNotAuteticate = req.body;
    let userRegister;

    try {
      userRegister = await UserController.getUser({
        username: userNotAuteticate.username,
      });
    } catch (error) {
      Logger.error(
        `Error al tratar de determinar si el usuario [${userNotAuteticate.username}] ya existe`,
        err
      );
      res.status(500).send("Ocurrio un error al hacer login");
      return;
    }

    if (!userRegister) {
      Logger.error(`usuario [${userNotAuteticate.username}] no registrado `);
      res.status(400).send("Credenciales incorrectas. verificar");
      return;
    }

    let constrasenaCorrecta;

    try {
      constrasenaCorrecta = await bcrytp.compare(userNotAuteticate.password, userRegister.password);
    } catch (error) {
      Logger.error(`Error al tratar de verificar contrasena`,error);
      res.status(500).send("Error ocurrio en el proceso de login");
      return
    }


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
      res.status(400).send("Error en las credenciales del usuario");
    }
  }
);

module.exports = usersRouter;
