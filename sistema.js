/*
==================================================
 ARCADE WEB SYSTEM
 SISTEMA CENTRAL
==================================================
*/


// LISTA DE PROGRAMAS INSTALADOS

const programas = {

    "PONG.EXE":{

        arquivo:"jogos/pong.js",

        categoria:"ARCADE",

        status:"ONLINE"

    },


    "SNAKE.EXE":{

        arquivo:"jogos/snake.js",

        categoria:"ARCADE",

        status:"DISPONÍVEL"

    },


    "TETRIS.EXE":{

        arquivo:"jogos/tetris.js",

        categoria:"PUZZLE",

        status:"DISPONÍVEL"

    },


    "MEMORIA.EXE":{

        arquivo:"jogos/memoria.js",

        categoria:"EDUCATIVO",

        status:"DISPONÍVEL"

    }


};





// ===============================================
// EXECUTAR PROGRAMA
// ===============================================


function executarPrograma(nome){



    if(!programas[nome]){


        terminalMensagem(
            "ERRO: PROGRAMA NÃO ENCONTRADO"
        );


        return;


    }



    terminalMensagem(

        "CARREGANDO " + nome

    );



    let barra = 0;



    let carregamento = setInterval(()=>{


        barra +=10;


        console.log(

            "LOADING:",
            barra+"%"

        );



        if(barra>=100){


            clearInterval(carregamento);



            abrirPrograma(nome);



        }


    },100);



}







// ===============================================
// ABRIR JOGO
// ===============================================


function abrirPrograma(nome){



    const jogo = programas[nome];



    console.log(

        "EXECUTANDO:",
        nome

    );



    const script = 
    document.createElement("script");



    script.src = jogo.arquivo;



    script.onload = ()=>{


        console.log(

            nome,
            "CARREGADO COM SUCESSO"

        );


    };



    document.body.appendChild(script);



}








// ===============================================
// TERMINAL
// ===============================================


function terminalMensagem(texto){



    console.log(

        ">",
        texto

    );



}








// ===============================================
// FECHAR PROGRAMA
// ===============================================


function fecharPrograma(){



    console.log(

        "RETORNANDO AO ARCADE..."

    );



}








// ===============================================
// REGISTRO DE JOGADORES
// ===============================================


let jogador = {


    nome:"PLAYER",

    pontos:0,

    jogos:0


};





function adicionarPontos(valor){


    jogador.pontos += valor;


    jogador.jogos++;


}





console.log(

    "ARCADE WEB SYSTEM ONLINE"

);