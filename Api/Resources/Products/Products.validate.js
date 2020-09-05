const Joi = require("@hapi/joi");

const blueprintProduct = Joi.object({
  title: Joi.string().max(100).required(),
  price: Joi.number().positive().precision(2).required(),
  moneda: Joi.string().length(3).uppercase().required(),
});

//Midlleware
module.exports = (req, res, next) => {
  let resultValidate = blueprintProduct.validate(req.body, {
    abortEarly: false,
    convert: false,
  });

  console.log(resultValidate);
  if (resultValidate.error === undefined) {
    next();
  } else {
    let errors = resultValidate.error.details.reduce((acu, error) => {
      return acu + `${error.message}`;
    }, "");
    res.status(400).send(errors);
  }
};
