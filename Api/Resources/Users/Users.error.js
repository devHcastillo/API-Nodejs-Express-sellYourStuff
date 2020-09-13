class DatosDeUsuarioYaEnUso extends Error {
    constructor(message) {
      super(message);
      this.message =
        message || "El email o usuario ya esta en uso con otra cuenta";
      this.status = 409;
      this.name = "DatosDeUsuarioYaEnUso";
    }
  }

  class CrendencialesIncorrectas extends Error {
    constructor(message) {
        super(message);
        this.message =
          message || "Credenciales incorrectas";
        this.status = 400;
        this.name = "CrendencialesIncorrectas";
      }
  }
  



  module.exports = {
    DatosDeUsuarioYaEnUso,
    CrendencialesIncorrectas
  }