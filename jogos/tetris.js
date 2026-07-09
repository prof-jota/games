/*
==================================================
 TETRIS.EXE
 ARCADE WEB SYSTEM
==================================================
*/


const canvas = document.getElementById("gameCanvas");

const ctx = canvas.getContext("2d");



const COLUNAS = 10;

const LINHAS = 20;

const TAMANHO = 20;



let tabuleiro = [];



let pontos = 0;



let peca;



let posicao;




// CRIAR TABULEIRO


function criarTabuleiro(){


    tabuleiro=[];


    for(let y=0;y<LINHAS;y++){


        tabuleiro[y]=[];


        for(let x=0;x<COLUNAS;x++){


            tabuleiro[y][x]=0;


        }


    }

}


criarTabuleiro();






// PEÇAS


const pecas = [


[

[1,1,1,1]

],



[

[1,1],

[1,1]

],



[

[0,1,0],

[1,1,1]

],



[

[1,0,0],

[1,1,1]

]



];






function novaPeca(){



    peca =

    pecas[

        Math.floor(

            Math.random()*pecas.length

        )

    ];



    posicao={

        x:3,

        y:0

    };


}







novaPeca();






// CONTROLES


document.addEventListener(

"keydown",

(e)=>{


    if(e.key==="ArrowLeft"){

        posicao.x--;

    }


    if(e.key==="ArrowRight"){

        posicao.x++;

    }


    if(e.key==="ArrowDown"){

        moverBaixo();

    }



});








// MOVIMENTO


function moverBaixo(){


    posicao.y++;



    if(colidiu()){


        posicao.y--;


        fixarPeca();


        novaPeca();



    }


}







// COLISÃO


function colidiu(){


    for(let y=0;y<peca.length;y++){


        for(let x=0;x<peca[y].length;x++){



            if(

                peca[y][x] &&

                (

                !tabuleiro[posicao.y+y] ||

                !tabuleiro[posicao.y+y][posicao.x+x] ||

                tabuleiro[posicao.y+y][posicao.x+x]

                )

            ){

                return true;

            }


        }


    }


    return false;


}








// FIXAR


function fixarPeca(){



    peca.forEach(

    (linha,y)=>{


        linha.forEach(

        (valor,x)=>{


            if(valor){


                tabuleiro[

                    posicao.y+y

                ][

                    posicao.x+x

                ]=1;


            }


        });


    });



    pontos+=100;


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




tabuleiro.forEach(

(linha,y)=>{


linha.forEach(

(valor,x)=>{


if(valor){


ctx.fillStyle="#00ff66";


ctx.fillRect(

x*TAMANHO,

y*TAMANHO,

TAMANHO-1,

TAMANHO-1

);


}


});


});





peca.forEach(

(linha,y)=>{


linha.forEach(

(valor,x)=>{


if(valor){


ctx.fillStyle="#ffff00";


ctx.fillRect(

(posicao.x+x)*TAMANHO,

(posicao.y+y)*TAMANHO,

TAMANHO-1,

TAMANHO-1

);


}


});


});





ctx.fillStyle="#00ff66";


ctx.font="20px Courier";


ctx.fillText(

"SCORE: "+pontos,

20,

30

);



}








setInterval(()=>{


moverBaixo();


desenhar();



},500);
