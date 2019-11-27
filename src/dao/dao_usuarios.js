"use strict";

class DAOUsers {

    /**
     * Inicializa el DAO de usuarios.
     * 
     * @param {Pool} pool Pool de conexiones MySQL. Todas las operaciones
     *                    sobre la BD se realizarán sobre este pool.
     */
    constructor(pool) {
        this.pool = pool;
}

//******************************************************************************************************* */

isUserCorrect(login, password, callback) {
    
    this.pool.getConnection((err,connection) => {

        if(err)
            callback(err);

        connection.query("SELECT * FROM usuarios WHERE login = ? AND password = ?",
        [login, password],
        (err, result) =>{

            connection.release();

            if (err)
                callback(err);

            if(result.length === 0)
                callback(null, undefined);

            else
                callback(null, result[0].login);
        });
    });
}//isUserCorrect

//******************************************************************************************************* */

createUser(usuario, contraseña, callback){
    
    this.pool.getConnection((err, connection) =>{
        
        if(err)
            callback(err);
        
        connection.query("INSERT INTO usuarios (login, password) VALUES (?, ?)",
        [usuario, contraseña],
        (err, result) =>{
            
            connection.release();

            if(err)
                callback(err);
            
            callback(null, result.insertId);
        });
    });
}//createUser

//******************************************************************************************************* */

buscarUsuario(usuario, callback){
    
    this.pool.getConnection((err, connection) =>{
        
        if(err)
            callback(err);
        
        connection.query("SELECT * FROM usuarios WHERE login = ?",
        [usuario],
        (err, result) =>{
            
            connection.release();

            if(err)
                callback(err);
            
            if(result.length === 0)
                callback(null, false);

            else
                callback(null, true);
        });
    });
}//createUser

//******************************************************************************************************* */

getRandomUsuario(idPartida, callback){

    this.pool.getConnection((err, connection) =>{
        
        if(err)
            callback(err);
        
        connection.query("SELECT idUsuario FROM juega_en WHERE idPartida = ? " +
                            "ORDER BY RAND() LIMIT 1",
        [idPartida],
        (err, usuario) =>{
            
            connection.release();

            if(err)
                callback(err);
            
            callback(null, usuario[0]);
            
        });
    });
}//getRandomUsuario

//******************************************************************************************************* */

}//DAOUsers

module.exports = {
    DAOUsers: DAOUsers
}