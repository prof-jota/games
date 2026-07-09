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



// VARIÁVEIS DO SISTEMA

let scriptAtual = null;

let intervaloAtual = null;



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
// ABRIR PROGRAMA
// ===============================================


function abrirPrograma(nome){


    fecharPrograma();



    const jogo = programas[nome];



    console.log(
        "EXECUTANDO:",
        nome
    );



    const canvas =
    document.getElementById("gameCanvas");



    if(canvas){


        const ctx =
        canvas.getContext("2d");


        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


    }





    let script =
    document.createElement("script");



    script.src = jogo.arquivo;



    scriptAtual = script;



    script.onload = ()=>{


        console.log(

            nome,

            "CARREGADO"

        );


    };



    document.body.appendChild(script);



}







// ===============================================
// FECHAR PROGRAMA
// ===============================================


function fecharPrograma(){



    console.log(
        "ENCERRANDO PROGRAMA..."
    );



    // limpa temporizadores

    if(intervaloAtual){


        clearInterval(intervaloAtual);


    }




    // remove script anterior


    if(scriptAtual){


        scriptAtual.remove();


        scriptAtual=null;


    }




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
// JOGADOR
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
