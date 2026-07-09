/*
==================================================
 SNAKE.EXE
 ARCADE WEB SYSTEM
==================================================
*/


// CRIA CANVAS DO JOGO

const canvas = document.getElementById("pongCanvas");

const ctx = canvas.getContext("2d");


// CONFIGURAÇÕES

const tamanho = 20;

let cobra = [

    {
        x:200,
        y:200
    }

];


let comida = {

    x:300,

    y:200

};



let direcao = "RIGHT";


let pontos = 0;



// CONTROLE DO JOGADOR


document.addEventListener(
"keydown",

(event)=>{


    if(event.key==="ArrowUp" &&
       direcao!=="DOWN"){

        direcao="UP";

    }



    if(event.key==="ArrowDown" &&
       direcao!=="UP"){

        direcao="DOWN";

    }



    if(event.key==="ArrowLeft" &&
       direcao!=="RIGHT"){

        direcao="LEFT";

    }



    if(event.key==="ArrowRight" &&
       direcao!=="LEFT"){

        direcao="RIGHT";

    }


});




// MOVIMENTO


function mover(){


    let cabeca={

        x:cobra[0].x,

        y:cobra[0].y

    };



    if(direcao==="UP")
        cabeca.y-=tamanho;



    if(direcao==="DOWN")
        cabeca.y+=tamanho;



    if(direcao==="LEFT")
        cabeca.x-=tamanho;



    if(direcao==="RIGHT")
        cabeca.x+=tamanho;



    cobra.unshift(cabeca);





    // COME COMIDA


    if(

        cabeca.x===comida.x &&
        cabeca.y===comida.y

    ){


        pontos+=10;


        criarComida();



    }

    else{


        cobra.pop();


    }



    verificarColisao();


}







// CRIAR COMIDA


function criarComida(){


    comida.x =
    Math.floor(
        Math.random()*40
    )*tamanho;



    comida.y =
    Math.floor(
        Math.random()*20
    )*tamanho;



}






// COLISÃO


function verificarColisao(){



    let cabeca=cobra[0];



    if(

        cabeca.x<0 ||
        cabeca.y<0 ||
        cabeca.x>=canvas.width ||
        cabeca.y>=canvas.height

    ){


        gameOver();


    }



    for(let i=1;i<cobra.length;i++){


        if(

            cabeca.x===cobra[i].x &&
            cabeca.y===cobra[i].y

        ){


            gameOver();


        }


    }



}







// DESENHO


function desenhar(){



    ctx.fillStyle="black";

    ctx.fillRect(

        0,
        0,
        canvas.width,
        canvas.height

    );





    // COMIDA


    ctx.fillStyle="#ff0000";


    ctx.fillRect(

        comida.x,

        comida.y,

        tamanho,

        tamanho

    );






    // COBRA


    ctx.fillStyle="#00ff66";



    cobra.forEach(parte=>{


        ctx.fillRect(

            parte.x,

            parte.y,

            tamanho,

            tamanho

        );


    });






    // PLACAR


    ctx.fillStyle="#00ff66";


    ctx.font="20px Courier";


    ctx.fillText(

        "SCORE: "+pontos,

        20,

        30

    );


}







function loop(){


    mover();


    desenhar();


}



setInterval(

    loop,

    120

);





function gameOver(){


    alert(

`SNAKE.EXE

GAME OVER

PONTOS:
${pontos}

PRESSIONE OK PARA REINICIAR`

    );



    cobra=[

        {
            x:200,
            y:200
        }

    ];



    pontos=0;



}