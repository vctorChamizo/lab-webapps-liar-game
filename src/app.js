
"use strict";

//______________________________________ MODULOS _______________________________________

const express = require("express");
const mysql = require("mysql");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const mySql_session = require("express-mysql-session");
const multer = require("multer");
const fs = require("fs");
const moment = require('moment');
const expressValidator = require("express-validator");
const passport = require("passport");
const passportHTTP = require("passport-http");
const https = require("https");

//****************  MODULOS LOCALES  *****************  
//****************************************************
const config = require("./config");
const daoPartidas = require("./DAO/dao_partidas");
const daoUsers = require("./DAO/dao_usuarios");

const app = express();

const baraja = [ "2_C", "2_D", "2_H", "2_S", "3_C", "3_D", "3_H", "3_S", "4_C", 
"4_D", "4_H", "4_S", "5_C", "5_D", "5_H", "5_S", "6_C", "6_D", "6_H", "6_S", 
"7_C", "7_D", "7_H", "7_S", "8_C", "8_D", "8_H", "8_S", "9_C", "9_D", "9_H", 
"9_S", "10_C", "10_D", "10_H", "10_S", "J_C", "J_D", "J_H", "J_S", "Q_C", "Q_D", 
"Q_H", "Q_S", "K_C", "K_D", "K_H", "K_S", "A_C", "A_D", "A_H", "A_S"];

//_______________________________________________________________________________________


//________________________________ MOTORES DE APLICACIÓN ________________________________

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//_______________________________________________________________________________________

//Certificados para HTTPS
var privateKey = fs.readFileSync("./certificados/mi_clave.pem");
var certificate = fs.readFileSync("./certificados/certificado_firmado.crt");


//________________________________ MIDDLEWARE _________________________________


const ficherosEstaticos = path.join(__dirname, "public");

const mySqlStore = mySql_session(session);
const sessionStore = new mySqlStore(config.mysqlConfig);
const middlewareSession = session({
    saveUninitialized: false,
    secret: "foobar34",
    resave: false,
    store: sessionStore
});

app.use(passport.initialize());
passport.use(new passportHTTP.BasicStrategy(

    { realm: 'Autenticacion' },

    (usuario, contraseña, callback) => {

        daoU.isUserCorrect(usuario, contraseña, (err, nameUser) => {

            if (err)
                callback(err);

            if(nameUser === undefined)
                callback(null, false);
            else
                callback(null, {nameUser: nameUser});
        });
    }
));

app.use(bodyParser.json());
app.use(express.static(ficherosEstaticos));
app.use(middlewareSession);
app.use(bodyParser.urlencoded({extended: false}));
app.use(expressValidator())

//__________________________________ CONEXION ___________________________________

let pool = mysql.createPool({
    database: config.mysqlConfig.database,
    host: config.mysqlConfig.host,
    user: config.mysqlConfig.user,
    password: config.mysqlConfig.password
});

let daoU = new daoUsers.DAOUsers(pool);
let daoP = new daoPartidas.DAOPartidas(pool);

//______________________________________________________________________________

app.get("/",(request, response)=>{

    response.redirect("index.html");
});

//************************************************************************************************* */

app.post("/iniciarSesion", (request, response) => {

    let usuario = request.body.usuario;
    let contraseña = request.body.contraseña;

    daoU.isUserCorrect(usuario, contraseña, (err, nameUser) => {

        if (err) {
            response.status(500);
            response.end();
        }
        else {

            if(nameUser === undefined)
                response.json({usuario: false});

            else
                response.json({usuario: true});
        }
    });     
});

//************************************************************************************************* */

app.post("/registrarUsuario", function(request, response){

    let usuario = request.body.usuario;
    let contraseña = request.body.contraseña;

    daoU.buscarUsuario(usuario, (err, resultado)=>{

        if(err){
            response.status(500);
            response.end();
        }
        else{

            //Devolvera true, lo que significa que ya hay un usuario con ese nombre registrado
            if(resultado){
                response.status(400);
                response.end();
            }
            else{

                daoU.createUser(usuario, contraseña, (err, idUser) =>{

                    if(err){
                        response.status(500);
                        response.end();
                    }
                    else{
                        response.status(201);
                        response.json({usuario: resultado});
                    }//else
                });//createUser
            }//else
        }//else
    })//buscarUusario
});//Registrarse

//************************************************************************************************* */

app.get("/cargarPartidas", passport.authenticate('basic', {session: false}), (request, response) =>{

    if(request.user){

        daoP.getPartidasUsuario(request.user.nameUser, (err, partidas) =>{

            if(err){
                response.status(500);
                response.end();
            }
            else
                response.json({partidas: partidas});
        });
    }//if
    else{
        response.status(403);
    }
});//cargarPartidas

//************************************************************************************************* */

app.post("/crearPartida",  passport.authenticate('basic', {session: false}), function(request, response){

    if(request.user){

        daoP.nuevaPartida(request.user.nameUser , request.body.partida, (err, idPartida)=>{

            if(err){
                response.status(500);
                response.end();
            }
            else{
                response.status(201);
                daoP.getPartida(idPartida, (err, partida) => {

                    if(err){

                        response.status(500);
                        response.end();
                    }
                    else
                        response.json({permitido: true, partida: partida});
                });//getartida
            }//else
        });//daoPartida
    }//if
    else{
        response.status(403);
    }
});//crearPartida

//************************************************************************************************* */

app.post("/unirsePartida", passport.authenticate('basic', {session: false}), (request, response) => {

    let idPartida = request.body.idPartida;

    if(request.user){

        daoP.findPartida(idPartida, (err, result) =>{

            if(err){
                response.status(500);
                response.end();
            }
            else{

                if(result){

                    daoP.partidaCompleta(idPartida, (err, partidaCompleta) =>{

                        if(err){
                            response.status(500);
                            response.end();
                        }
                        else{

                            if(partidaCompleta){
                                response.status(400);//La partida esta completa
                                response.json({msg: "La partida ya está completa."})
                            }
                            else{

                                daoP.unirsePartida(request.user.nameUser, idPartida, (err, callback) =>{

                                    if(err){
                                        response.status(500);
                                        response.end();
                                    }
                                    else{
                                        daoP.getPartida(idPartida, (err, partida) => {

                                            if(err){
                        
                                                response.status(500);
                                                response.end();
                                            }
                                            else
                                                response.json({permitido: true, partida: partida});
                                        });//getartida
                                    }
                                })
                            }
                        }
                    })
                }
                else{
                    response.status(404);//la partida no existe
                    response.json({msg: "La partida no existe."});
                }
            }
        });
    }
    else{
        response.status(403);
    }
});

//************************************************************************************************* */

app.get("/actualizarPartida/:idPartida", passport.authenticate('basic', {session: false}), (request, response) =>{

    let idPartida = request.params.idPartida;

    if(request.user){

        daoP.findPartida(idPartida, (err, result) =>{

            if(err){
                response.status(500);
                response.end();
            }
            else{

                if(result){

                    daoP.getJugadores(idPartida, (err, jugadores) =>{

                        if(err){
                            response.status(500);
                            response.end();
                        }
                        else{
                            response.json({jugadores: jugadores});
                        }
                    });//getJugadores

                }
                else{
                    response.status(404);//la partida no existe
                    response.json({msg: "La partida no existe."});
                }
            }
        });//findPartida
    }
    else{
        response.status(403);
    }
});

//************************************************************************************************* */

app.get("/jugarPartida/:idPartida", passport.authenticate('basic', {session: false}), (request, response) => {

    let idPartida = request.params.idPartida;

    if(request.user){

        daoP.getPartida(idPartida, (err, partida) => {

            if(err){
                response.status(500);
                response.end();
            }
            else{

                if(partida.estado === "Sin comenzar"){

                    let cartas = baraja;
                    let state = {};
                    let jugadores = [];
                    
                    daoU.getRandomUsuario(idPartida, (err, usuario) => {

                        if(err){
                            response.status(500);
                            response.end();
                        }
                        else{
                            
                            state.partida = true;
                            state.turno = usuario.idUsuario;

                            daoP.getJugadores(idPartida, (err, rows) => {

                                if(err){
                                    response.status(500);
                                    response.end();
                                }
                                else{

                                    let random;
                                    let select;

                                    rows.forEach(row => {

                                        let jugador = {};
                                        jugador.id = row.id;
                                        jugador.nombre = row.login;
                                        let mano = [];

                                        for (let j = 0; j < 13; j++){

                                            random = Math.floor(Math.random()*(cartas.length));
                                            select= cartas[random];
                                            cartas.splice(random, 1);
                                            mano.push(select);
                                        }//for
        
                                        jugador.cartas = mano;
                                        jugadores.push(jugador);

                                    });//forEach

                                    state.jugadores = jugadores;

                                    let mesa = {

                                        valorCartas: null,
                                        numeroCartasMesa: 0,
                                        jugadorAnterior: null,
                                        numeroCartasJugador: 0,
                                        cartasVerdaderas: null
                                };

                                    state.mesa = mesa;

                                    let cadenaState = JSON.stringify(state);

                                    daoP.actualizarEstado(idPartida, cadenaState, (err, actualizado) =>{

                                        if(err){

                                            response.status(500);
                                            response.end();
                                        }
                                        else{

                                            if(actualizado)
                                                response.json({estado:state});

                                            else
                                                response.status(400);
                                        }//else

                                    });//actualizarEstado
                                }//else
                            });//getJugadores
                        }//else
                    });//getRandomUsuario

                }//if
                else
                    response.json({estado: JSON.parse(partida.estado)});
            }//else
        })//getPartida
    }//if

    else{
        response.status(403);
    }
});//jugarPartida

//************************************************************************************************* */

app.get("/accionPartida", passport.authenticate('basic', {session: false}), (request, response) =>{

    let datos = request.query;
    let estate;

    if(request.user){

        daoP.getPartida(datos.idPartida, (err, partida) => {

            if(err)
                response.status(500);
            else{

                estate = JSON.parse(partida.estado);

                if(estate.mesa.valorCartas === null){
                    estate.mesa.valorCartas = String(datos.valorSupuesto);
                }

                estate.mesa.jugadorAnterior = datos.jugadorAnterior;
                estate.mesa.numeroCartasMesa += Number(datos.numeroCartas);
                estate.mesa.numeroCartasJugador = Number(datos.numeroCartas);
                estate.mesa.cartasVerdaderas = datos.cartas_seleccionadas;

                if((estate.turno + 1) > 4)
                    estate.turno = 1;
                else
                    estate.turno += 1;

                let encontrado = false;
                let i = 0;
                let jugador;
    
                while(i < estate.jugadores.length && !encontrado){
    
                    if(estate.jugadores[i].nombre === datos.jugadorAnterior){
    
                        jugador = estate.jugadores[i];
                        encontrado = true;
                    }
                    else
                        i++;
                }//while

                let position;
                datos.cartas_seleccionadas.forEach( elem => {

                    position = jugador.cartas.lastIndexOf(elem);
                    jugador.cartas.splice(position, 1);
                });

                estate.jugadores[i] = jugador;

                let cadenaState = JSON.stringify(estate);

                daoP.actualizarEstado(datos.idPartida, cadenaState, (err, actualizado) => {

                    if(err)
                        response.status(500);
                    else{
                        if(actualizado)
                            response.end();
                        else
                            response.status(400);
                    }//else

                });//actualizarEstado
            }//else

        });//getPartida
    }//if
    else{
        response.status(403);
    }

});//accionPartida


//____________________________________________________________________________________________________________

//_________________________________________________ MANEJADOR DE ESCUHA ______________________________________


var servidor = https.createServer(
    { key: privateKey, cert: certificate },
 app);


 servidor.listen(config.httpsPort, function(err){
    if(err){
        console.log("No se ha iniciado el servidor");
        console.log(err);
    }else{

        console.log(`Servidor escuchando en puerto ${config.port}.`)
    }

});


app.listen(config.port, function(err) {
    if (err) {
        console.log("No se ha podido iniciar el servidor.")
        console.log(err);
    } else {
        console.log(`Servidor escuchando en puerto ${config.port}.`);
    }
});