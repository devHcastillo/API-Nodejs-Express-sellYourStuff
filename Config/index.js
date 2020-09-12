const ambiente = process.env.NODE_EN || "development ";

const configuracionBase = {
  jwt: {},
  port: 3000,
};

let configuracionDeAmbiente = {};

switch (ambiente) {
  case "desarrollo":
  case "dev":
  case "development":
    configuracionDeAmbiente = require("./dev");
    break;

  case "produccion":
  case "prod":
    configuracionDeAmbiente = require("./prod");
    break;

  default: 
    configuracionDeAmbiente = require("./dev");
    break;
}

module.exports = {
    ...configuracionBase,
    ...configuracionDeAmbiente
}
