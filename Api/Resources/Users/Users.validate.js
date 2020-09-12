const Joi = require("@hapi/joi");
const Logger = require("../../../Utils/Logger");

const blueprintUser = Joi.object({
  username: Joi.string().alphanum().required(),
  password: Joi.string().min(6).max(200).required(),
  email: Joi.string().email().required(),
});

let validarUsuario = (req, res, next) => {
  const resultValidate = blueprintUser.validate(req.body, {
    abortEarly: false,
    convert: false,
  });

  if (resultValidate.error === undefined) {
    next();
  } else {
    Logger.info("Usuario no fue validado", resultValidate.error.details);
    res.status(400).send("Los campos no cumplen con los requerimientos");
  }
};

const blueprintUserLogin = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

let validarPedidoLogin = (req, res, next) => {
  let resultValidate = blueprintUserLogin.validate(req.body, {
    abortEarly: false,
    convert: false,
  });

  if(resultValidate.error === undefined){
    next();
  }else{
      res.status(400).send("Login fallo. Verificar credenciales")
  }
};

module.exports = {
    validarUsuario,
    validarPedidoLogin
}