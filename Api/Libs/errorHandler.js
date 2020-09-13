const logger = require("../../Utils/Logger");
const mongoose = require("mongoose");

exports.processErrors = (fn) => {
  return function (req, res, next) {
    fn(req, res, next).catch(next);
  };
};

exports.processErrorsDB = (err, req, res, next) => {
  if (err instanceof mongoose.Error || err.name === "MongoError") {
    logger.error(`Ocurrio un error relacionado a mongoose.`, err);
    err.message =
      "Error relacionado a la base de datos ocurrio inesperadamente. Para ayuda contacte con dev.hcastillo@gmail.com";
    err.status = 500;
  }
  next(err);
};

exports.processErrorsInProduction = (err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    message: err.message,
  });
};

exports.processErrorsInDevelopment = (err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    message: err.message,
    stack: err.stack || "",
  });
};
