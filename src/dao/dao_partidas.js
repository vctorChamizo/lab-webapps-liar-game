"use strict";

class DAOPartidas {

    /**
     * Inicializa el DAO de partidas.
     * 
     * @param {Pool} pool Pool de conexiones MySQL. Todas las operaciones
     *                    sobre la BD se realizarán sobre este pool.
     */
    constructor(pool) {
        this.pool = pool;
    }

//******************************************************************************************************* */

getPartidasUsuario(nameUser, callback){

    this.pool.getConnection((err, connection) =>{
            
        if(err)
            callback(err);
        
        connection.query("SELECT p.id, p.nombre, p.estado FROM partidas p " +
                        "JOIN juega_en j ON (p.id = j.idPartida) " +
                        "JOIN usuarios u ON (j.idUsuario = u.id) WHERE u.login = ?",
        [nameUser],
        (err, rows)=>{

            connection.release();

            if(err)
                callback(err);
            
            if(rows.length === 0)
                callback(null, undefined);

            else
                callback(null, rows);
        });
    });
}//getPartidasUsuario

//******************************************************************************************************* */

nuevaPartida(nombreUsuario, nombrePartida, callback){

    this.pool.getConnection((err,connection) => {

        if(err)
            callback(err);
        
        connection.query("INSERT INTO partidas (nombre, estado) VALUES (?, ?)",
        [nombrePartida, "Sin comenzar"],
        (err, result) =>{
                
            if(err){
                
                connection.release();
                callback(err);
            }
            
            let idPartida = result.insertId;

            connection.query("INSERT INTO juega_en (idUsuario, idPartida) " +
                            "VALUES ((SELECT id FROM usuarios WHERE login = ?), ?)",
            [nombreUsuario, idPartida],
            (err,result2)=>{

                connection.release();

                if(err)
                    callback(err);
                
                callback(null, idPartida);
            });
        });
    });
}//Nueva partida

//******************************************************************************************************* */

getPartida(idPartida, callback){

    this.pool.getConnection((err,connection) => {

        if(err)
            callback(err);
        
        connection.query("SELECT * FROM partidas WHERE id = ?",
        [idPartida],
        (err, rows) =>{
                
            connection.release();

            if(err)
                callback(err);

            if(rows.length === 0)
                callback(null, undefined);
            else
                callback(null, rows[0]);
        });
    });
}//getPartida

//******************************************************************************************************* */

unirsePartida(usuario, idPartida, callback){

    this.pool.getConnection((err,connection) => {

        if(err)
            callback(err);
        
        connection.query("INSERT INTO juega_en VALUES ((SELECT id FROM usuarios WHERE login = ?), ?)",
        [usuario, idPartida],
        (err,result)=>{

            connection.release();

            if(err)
                callback(err);

            callback(null, result);
        });
    });
}//unirsePartida

//******************************************************************************************************* */

partidaCompleta(idPartida, callback){

    this.pool.getConnection((err,connection) => {

        if(err)
            callback(err);
        
        connection.query("SELECT * FROM juega_en WHERE idPartida = ?",
        [idPartida],
        (err,result)=>{

            connection.release();

            if(err)
                callback(err);

            if(result.length < 4)
                callback(null, false);//La partida no esta completa

            else
                callback(null, true);
        });
    });
}//partidaCompleta

//******************************************************************************************************* */

findPartida(idPartida, callback){

    this.pool.getConnection((err,connection) => {

        if(err)
            callback(err);
        
        connection.query("SELECT * FROM partidas WHERE id = ?",
        [idPartida],
        (err,result)=>{

            connection.release();

            if(err)
                callback(err);

            if(result.length === 0)
                callback(null, false);//la partida no existe

            else
                callback(null, true); 
        });
    });
}//getIncorporacio

//******************************************************************************************************* */

getJugadores(idPartida, callback){

    this.pool.getConnection((err,connection) => {

        if(err)
            callback(err);
        
        connection.query("SELECT u.id, u.login, p.nombre FROM juega_en j " + 
                        "JOIN usuarios u ON j.idUsuario = u.id " + 
                        "JOIN partidas p ON p.id = j.idPartida " +
                        "WHERE j.idPartida = ? ",
        [idPartida],
        (err,rows)=>{

            connection.release();

            if(err)
                callback(err);

            callback(null, rows);
        });
    });
}//getJugadores

//******************************************************************************************************* */

actualizarEstado(idPartida, nuevoEstado, callback){

    this.pool.getConnection((err, connection) => {

        if(err)
            callback(err);

        connection.query("UPDATE partidas SET estado = ? WHERE id = ?",
        [nuevoEstado, idPartida],
        (err, result)=>{

            connection.release();

            if(err)
                callback(err);

            if(result.changedRows === 0)
                callback(null, false);

            else
                callback(null, true);
        });
    });
}//actualizarEstado

//******************************************************************************************************* */

}//DAOPartidas

module.exports = {
    DAOPartidas: DAOPartidas
}