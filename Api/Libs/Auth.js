const _ = require('underscore');
const logger = require('../../Utils/Logger');
const users = require('../../Database').users
const bcrypt = require('bcrypt');
const { error } = require('winston');
const passportJWT = require('passport-jwt')
const config = require('../../Config')
let jwtOptions = {
    secretOrKey: config.jwt.secreto,
    jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken()
}

module.exports = new passportJWT.Strategy(jwtOptions,(jwtPayLoad, next) =>{
     
    let indice =_.findIndex(users, (user) => {
        return user.id == jwtPayLoad.id
    })

    if(indice === -1){
        logger.info(`Username con id ${jwtPayLoad.id} no existe.JWT NO VALIDO`)
        next(null,false);
     }else{
         logger.info(`El usuario ${users[indice].username} sumistrito un token valido`)
         next(null,{
             username: users[indice].username,
             id: users[indice].id 
         })
     }
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