const UserModel = require("./Users.model");

//Just for test
let getUsers = () => {
  return UserModel.find({});
};

let getUser = ({username: username, id:id})=>{

    if (username) return UserModel.findOne({username: username})
    if (id) return UserModel.findById(id)
    throw new Error("Funcion obtener usuario del controller no tiene username ni ID")

    }

let createUser = (user, hashedPassword) => {
  return new UserModel({
    ...user,
    password: hashedPassword
  }).save();
};

const userExist = (username, email) => {
    return new Promise((resolve, reject) => {
        UserModel.find().or([{'username':username},{'email':email}])
        .then(users => {
            resolve(users.length > 0)
        })
        .catch(err =>{
            reject(err)
        })
    })
    
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  userExist
};
