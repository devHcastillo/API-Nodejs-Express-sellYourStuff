const app = require("../../../index").app;
const server = require("../../../index").server;

const supertest = require("supertest");
const superTest = require("supertest"); //request
const user = require("./Users.model");
const bcrypt = require("bcrypt");

let dummyUsers = [
  {
    username: "Heraldo",
    email: "dev.hcastillo@gmail.com",
    password: "justtest",
  },
  {
    username: "Juan",
    email: "juan@gmail.com",
    password: "justtest",
  },
  {
    username: "enquirre",
    email: "enquirre12@gmail.com",
    password: "justtest",
  },
];

const usuarioExiteYAtributosSonCorrectos = (userr, done) => {
  user
    .find({ username: userr.username })
    .then((usuarios) => {
      expect(usuarios).toBeInstanceOf(Array);
      expect(usuarios) / toHaveLength(1);
      expect(usuarios[0].username).toEqual(userr.username);
      expect(usuarios[0].email).toEqual(userr.email);

      let iguales = bcrypt.compareSync(userr.password, usuarios[0].password);
      expect(iguales).toBeTruthy();
      done();
    })
    .catch((err) => {
      done(err);
    });
};

describe("Users", () => {
  beforeEach((done) => {
    user.remove({}, (err) => {
      done();
    });
  });

  afterAll(() => {
    server.close();
  });

  describe("GET /users", () => {
    test("si no hay usuarios, deberia ser un array vacio", (done) => {
      superTest(app)
        .get("/users")
        .end((err, res) => {
          expect(res.status).toBe(200);
          expect(res.body).toBeInstanceOf(Array);
          expect(res.body).toHaveLength(0);
          done();
        });
    });

    test("Si existen usuarios, deberia enviar retornarlos en un Array", (done) => {
      Promise.all(dummyUsers.map((userr) => new user(userr).save())).then(
        (users) => {
          superTest(app)
            .get("/users")
            .end((err, res) => {
              expect(res.status).toBe(200);
              expect(res.body).toBeInstanceOf(Array);
              expect(res.body).toHaveLength(3);
              done();
            });
        }
      );
    });
  });

  describe("POST /users", () => {
    test("Crear un usuario nuevo, cumpliendo las condiciones de los parametros ", (done) => {
      superTest(app)
        .post("/users")
        .send(dummyUsers[0])
        .end((err, res) => {
          expect(res.status).toBe(201);
          expect(typeof res.status).toBe("string");
          expect(res.text).toEqual("Usuario creado exitosamente.");
          usuarioExiteYAtributosSonCorrectos(dummyUsers[0], done);
        });
    });
  });
});
