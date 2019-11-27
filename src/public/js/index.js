"use strict"

//***  VARIABLES GLOBALES  *** */
 let usuario;
 let cadena;

 $(document).ready(() =>{

    $("#game").hide();
    $("#action-tittle").hide();

    $("#entrar").on("click", iniciar_sesion);
    $("#desconectar").on("click", cerrar_sesion);
    $("#nuevo").on("click",registrarse);
    $("#crearPartida").on("click", crear_partida);
    $("#unirsePartida").on("click", unirse_partida);
    $("#listaPartidas").on("click", actualizar_partida);
    $("#actualizar_partida").on("click", actualizar_partida);
    $("#listaCartas").on("click","img", seleccionar_carta);
    $("#boton-seleccionar").on("click", boton_seleccion);
    
    
 });



function iniciar_sesion(event){

    event.preventDefault();

    usuario = $("#usuario").val();
    let contraseña = $("#contraseña").val();
    cadena = btoa(usuario + ":" + contraseña);

    $.ajax({

            type: "POST",
            url:"/iniciarSesion",
            contentType:"application/json",

            data:JSON.stringify({
                usuario: usuario,
                contraseña: contraseña
            }),

            success: (data,textStatus, jqXHR)=>{ 

                if(data.usuario){

                    $("#login").hide();
                    $("#game").show();
                    $("#action-tittle").show();
                    $("#nombre_usuario_titulo").text(usuario);
                    cargar_partidas();
                }
                else
                    alert("Atenticación incorrecta.");
            },

            error: function (jqXHR, textStatus, errorThrown) {

                alert("Se ha producido un error: " + errorThrown);
            }
    });

}//inicar_sesion

function registrarse(event){

    event.preventDefault();

    usuario = $("#usuario").val();
    let contraseña = $("#contraseña").val();
    cadena = btoa(usuario + ":" + contraseña);

    $.ajax({
        
            type: "POST",
            url:"/registrarUsuario",
            contentType:"application/json",

            data:JSON.stringify({
                usuario:usuario,
                contraseña: contraseña
            }),

            success: (data,textStatus, jqXHR)=>{ 
            
                if(data.usuario)
                    alert("Ya hay un usuario con ese nombre.");
                
                else{

                    $("#login").hide();
                    $("#game").show();
                    $("#action-tittle").show();
                    let nameUserElem = $("<p id = nombre_usuario_titulo class = user-tittle>" + usuario + "</p>");
                    $("#action-tittle").prepend(nameUserElem);
                }
            },

            error: function (jqXHR, textStatus, errorThrown) {
                alert("Se ha producido un error: " + errorThrown);
            }
    });  
}//registrarse


function cargar_partidas(){

    $.ajax({
        type:"GET",
        url: "/cargarPartidas",
        beforeSend: function(req){

            req.setRequestHeader("Authorization", "Basic " + cadena);
        },

        success: (data,textStatus, jqXHR)=>{

            if(data.partidas){

                data.partidas.forEach(partida =>{

                    let part = $("<a class = 'nav-item nav-link inventada' id= " + partida.id + " data-toggle=tab href=#contenido role=tab aria-selected= false>" + partida.nombre + "</a>");
                    $("#listaPartidas").append(part);
                });
            }  
        },

        error: function (jqXHR, textStatus, errorThrown) {

            alert("Se ha producido un error: " + errorThrown);
        }
    });
}//cargar_partidas

 
function crear_partida(event){

    event.preventDefault();

    let partida = $("#nombrePartida").val();

    if(partida.length > 0){

        $.ajax({
            type: "POST",
            url:"/crearPartida",
            contentType:"application/json",
            beforeSend: function(req){

                req.setRequestHeader("Authorization", "Basic " + cadena);
            },
            data:JSON.stringify({
                partida:partida
            }),

            success: (data,textStatus, jqXHR)=>{ 

                $("#nombrePartida").val("");
                let part = $("<a class = 'nav-item nav-link inventada' id= " + data.partida.id + " data-toggle=tab href= #contenido role=tab aria-selected= false>" + data.partida.nombre + "</a>");
                $("#listaPartidas").append(part);
            },

            error: function (jqXHR, textStatus, errorThrown) {
                alert("No se ha podido crear la partida");
            }
        });

    }//if
    else
        alert("La partida necesita un nombre.");

}//crear_partida


function unirse_partida(event){

    event.preventDefault();
   
    let idPartida = $("#identPartida").val();
    
    if(idPartida.length > 0){

        $.ajax({
            
            type: "POST",
            url:"/unirsePartida",
            contentType:"application/json",
            beforeSend: function(req){

                req.setRequestHeader("Authorization", "Basic " + cadena);
            },

            data:JSON.stringify({
                idPartida: idPartida
            }),

            success: (data,textStatus, jqXHR)=>{ 

                if(data.partida){

                    $("#identPartida").val("");
                    let part = $("<a class = 'nav-item nav-link inventada' id= " + data.partida.id + " data-toggle=tab href= #contenido role=tab aria-selected= false>" + data.partida.nombre + "</a>");
                    $("#listaPartidas").append(part);
                }
            },

            error: function (jqXHR, textStatus, errorThrown) {

                $("#identPartida").val("");
                alert(jqXHR.responseJSON.msg);
            }
        });
    }
    else
        alert("La partida necesita un nombre.");

}//unirse_partida


function actualizar_partida(event){

    event.preventDefault();

    let idPartida;

    if(event.target.id === "actualizar_partida"){

        idPartida = $("#listaPartidas a.active").prop("id");
    }
    else{

        idPartida = event.target.id;
    }
    
    if(idPartida !== "misPartidas"){

        $.ajax({
            
            type: "GET",
            url: "/actualizarPartida/" + idPartida,
            beforeSend: function(req){
    
                req.setRequestHeader("Authorization", "Basic " + cadena);
            },
    
            success: (data,textStatus, jqXHR)=>{ 
    
                $("#tabla_jugadores tbody tr").remove();
                $("#nombre_partida").text(data.jugadores[0].nombre);

                let identificador;
                let celdaCartas;
                let celdaNombre;

                data.jugadores.forEach(dato =>{
    
                    let fila = $("<tr id = fila" + dato.id + "></tr>");
                    celdaNombre = $("<td>").text(dato.login);

                    if(data.jugadores.length < 4){
                        celdaCartas = $("<td>").text("--");
                    }
                    
                    fila.append(celdaNombre);
                    fila.append(celdaCartas);

                    $("#tabla_jugadores tbody").append(fila);
                });

                if(data.jugadores.length < 4){

                    $("#partida_en_curso").hide();
                    $("#detalle_ident").text("El identificador de esta partida es " + idPartida + ".");
                    $("#detalles_partida").show();
                }
                else{
                    $("#partida_en_curso").show();
                    $("#detalles_partida").hide();
                    $("#listaCartas").children().remove();
                    jugar(idPartida);
                }
                
            },
    
            error: function (jqXHR, textStatus, errorThrown) {
                alert("Se ha producido un error: " + errorThrown);
            }
        });
    }//if

}//actualizar_partida

function jugar(idPartida){

    $.ajax({
            
        type: "GET",
        url: "/jugarPartida/" + idPartida,
        beforeSend: function(req){

            req.setRequestHeader("Authorization", "Basic " + cadena);
        },

        success: (data,textStatus, jqXHR)=>{ 

            $("#fila" + data.estado.turno).addClass("bg-primary text-white");

            //repartimos las cartas del jugador
            let encontrado = false;
            let i = 0;
            let jugador;

            while(i < data.estado.jugadores.length && !encontrado){

                if(data.estado.jugadores[i].nombre === usuario){

                    jugador = data.estado.jugadores[i];
                    encontrado = true;
                }
                else
                    i++;
            }//while

            let carta;
            $("#listaCartas").children().remove();
            jugador.cartas.forEach(c => {

                carta = $("<img src= img/" + c + ".png" + " id=" + c + " class= 'img-fluid img' alt='Responsive image'>");
                $("#listaCartas").append(carta);
            });//forEach

            if(jugador.id !== data.estado.turno)
                $("#action-mentiroso").hide();
            else{
                $("#action-mentiroso").show();

                if(data.estado.mesa.numeroCartasMesa === 0)
                    $("#menu-seleccion").show();
                
                else
                    $("#menu-seleccion").hide();
            }//else
                

            //Indicamos el numero de cartas que tiene cada jugador
            let celdaCartas;
            data.estado.jugadores.forEach( j => {
                $("td #nCartas").remove();
                celdaCartas = $("<td id = nCartas>").text(j.cartas.length);
                $("#fila" + j.id).append(celdaCartas);
            });

            let infoMesa;
            $("#cartas-mesa").children().remove();
            if(data.estado.mesa.numeroCartasMesa === 0){

                infoMesa = $("<p class='bold'>Aún no hay cartas sobre la mesa. Esperando al jugador " + 
                data.estado.turno + "</p>");

                $("#cartas-mesa").append(infoMesa);
            }
            else{

                //Implementaremos los datos de las cartas sobre la mesa.
                $("#cartas-mesa").children().remove();
                $("#info-jugador-mesa").children().remove();
                
                for(let i = 0; i < data.estado.mesa.numeroCartasMesa; i++){

                    $("#cartas-mesa").append("<span class='border'>" + data.estado.mesa.valorCartas + "</span>")
                }//for

                infoMesa =$("<p><span class='bold'>" + data.estado.mesa.jugadorAnterior + 
                                "</span> ha colocado "+ data.estado.mesa.numeroCartasJugador + 
                                " cartas sobre la mesa</p>");

                $("#info-jugador-mesa").append(infoMesa);

            }//else
        },

        error: function (jqXHR, textStatus, errorThrown) {
            alert("Se ha producido un error: " + errorThrown);
        }
    });
}//comenzar_partida


function seleccionar_carta(event){

    event.preventDefault();

    let cartaSel=  event.target.id;

    if($("#" + cartaSel).hasClass("cartaSeleccionada"))
        $("#" + cartaSel).removeClass("cartaSeleccionada");
        
    else
        $("#" + cartaSel).addClass("cartaSeleccionada");
  

}//seleccionar_carta

function boton_seleccion(event){

    event.preventDefault();

    let idPartida = $("#listaPartidas a.active").prop("id");

    let cartas_seleccionadas = [];
    $("#listaCartas .cartaSeleccionada").each(function(){
        
        cartas_seleccionadas.push($(this).prop("id"));
    });

    $.ajax({
            
        type: "GET",
        url: "/accionPartida",
        beforeSend: function(req){

            req.setRequestHeader("Authorization", "Basic " + cadena);
        },
        data:{

            cartas_seleccionadas: cartas_seleccionadas,
            numeroCartas: cartas_seleccionadas.length,
            valorSupuesto: $("#seleccion").val(),
            jugadorAnterior: usuario,
            idPartida: idPartida
        },

        success: (data,textStatus, jqXHR)=>{ 

            jugar(idPartida);
        },

        error: function (jqXHR, textStatus, errorThrown) {
            alert("Se ha producido un error: " + errorThrown);
        }
    });

}//boton_seleccion


function cerrar_sesion(){

    cadena = null;
    usuario = null;

    $("#nombre_usuario_titulo").val("");
    $("#listaPartidas .inventada").remove();
    $("#misPartidas").addClass("active");
    $("#contenido").removeClass("active");
    $("#contenido").removeClass("show");
    $("#vistaMisPartidas").addClass("active");
    $("#vistaMisPartidas").addClass("show");
    $("#usuario").val("");
    $("#contraseña").val("");
    $("#game").hide();
    $("#action-tittle").hide();
    $("#login").show();
    
}//cerrar_desion