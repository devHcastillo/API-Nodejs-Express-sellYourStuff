const _ = require('underscore');
const logger = require('../../Utils/Logger');
const bcrypt = require('bcrypt');
const { error } = require('winston');
const passportJWT = require('passport-jwt')
const config = require('../../Config')

const UserController = require('../Resources/Users/Users.controller')
let jwtOptions = {
    secretOrKey: config.jwt.secreto,
    jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken()
}

module.exports = new passportJWT.Strategy(jwtOptions,(jwtPayLoad, next) =>{


    UserController.getUser({id:jwtPayLoad.id})
        .then(user => {
            if(!user){
                logger.info(`Username con id ${jwtPayLoad.id} no existe.JWT NO VALIDO`)
                next(null, false)
                return
            }
            logger.info(`El usuario ${user.username} sumistrito un token valido`)
            next(null,{
                username: user.username,
                id: user.id 
            })
        })
        .catch(error => {
            logger.info(`Ocurrio un error al validar token`,error)
            next(error,false)
        })

})



// module.exports =  (username, password, done) => {
  
//     let indice =_.findIndex(users, (user) => {
//         return user.username == username
//     })

//     if(indice === -1){
//         logger.info(`Username no existe ${username}`)
//         done(null,false);
//         return
//     }

//     let hashedpassword = users[indice].password;

//     bcrypt.compare(password, hashedpassword, (error, isEqual) => {
//    logger.info(isEqual)
//         if(isEqual){
//             logger.info(`Usuario ${username} completo autenticacion`)
//             done(null,true)
//         }else{
//             logger.info(`Usuario ${username} no completo autenticacion. contrasena incorrecta`)
//             done(null,false)
//         }
//     });


//   }