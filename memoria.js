/*
==================================================
 MEMORY.EXE
 SISTEMA DE MEMÓRIA DO ARCADE
==================================================
*/


// BANCO DE DADOS LOCAL


let dadosArcade = {

    jogador:"PLAYER",

    pontos:0,

    jogosExecutados:0,

    recordes:{


        "PONG.EXE":0,

        "SNAKE.EXE":0,

        "TETRIS.EXE":0,

        "MEMORIA.EXE":0


    }

};





// CARREGAR MEMÓRIA


function carregarMemoria(){



    let memoria =

    localStorage.getItem(
        "arcadeMemory"
    );



    if(memoria){


        dadosArcade =

        JSON.parse(memoria);


        console.log(

            "MEMÓRIA RESTAURADA"

        );


    }

    else{


        salvarMemoria();


    }


}






// SALVAR


function salvarMemoria(){


    localStorage.setItem(

        "arcadeMemory",

        JSON.stringify(
            dadosArcade
        )

    );


}






// ALTERAR JOGADOR


function alterarJogador(nome){



    dadosArcade.jogador = nome;


    salvarMemoria();


}







// REGISTRAR JOGO


function registrarJogo(nome){



    dadosArcade.jogosExecutados++;


    console.log(

        "Executado:",
        nome

    );


    salvarMemoria();


}








// NOVO RECORDE


function novoRecorde(

jogo,

pontuacao

){



    if(

    pontuacao >

    dadosArcade.recordes[jogo]

    ){


        dadosArcade.recordes[jogo]

        = pontuacao;


        salvarMemoria();


        console.log(

            "NOVO RECORDE!"

        );


    }


}







// MOSTRAR STATUS


function mostrarMemoria(){



console.table(

dadosArcade

);



}





carregarMemoria();



console.log(

"MEMORY SYSTEM ONLINE"

);