/*
==================================================
 MEMORIA.EXE
 ARCADE WEB SYSTEM
==================================================
*/


const canvas = document.getElementById("gameCanvas");

const ctx = canvas.getContext("2d");



// CARTAS

let cartas = [

    "A","A",

    "B","B",

    "C","C",

    "D","D"

];



// EMBARALHAR


cartas.sort(

()=>Math.random()-0.5

);





let selecionadas=[];


let encontradas=[];


let pontos=0;



// POSIÇÃO DAS CARTAS


const largura=100;

const altura=100;


const espacamento=20;







function desenhar(){



ctx.fillStyle="black";


ctx.fillRect(

0,

0,

canvas.width,

canvas.height

);




for(let i=0;i<cartas.length;i++){



let x =

(i%4)*(largura+espacamento)+50;



let y =

Math.floor(i/4)*(altura+espacamento)+80;





ctx.strokeStyle="#00ff66";

ctx.strokeRect(

x,

y,

largura,

altura

);





ctx.fillStyle="#00ff66";

ctx.font="40px Courier";

ctx.textAlign="center";





if(

selecionadas.includes(i)

||

encontradas.includes(i)

){


ctx.fillText(

cartas[i],

x+50,

y+60

);


}

else{


ctx.fillText(

"?",

x+50,

y+60

);



}


}



ctx.font="20px Courier";

ctx.fillText(

"SCORE: "+pontos,

100,

40

);


}








// CLIQUE NAS CARTAS



canvas.addEventListener(

"click",

function(e){



let rect=

canvas.getBoundingClientRect();



let mouseX=

e.clientX-rect.left;



let mouseY=

e.clientY-rect.top;





for(let i=0;i<cartas.length;i++){



let x =

(i%4)*(largura+espacamento)+50;



let y =

Math.floor(i/4)*(altura+espacamento)+80;





if(

mouseX>x &&

mouseX<x+largura &&

mouseY>y &&

mouseY<y+altura

){



selecionarCarta(i);



}



}



});







function selecionarCarta(i){



if(

selecionadas.length<2

&&

!selecionadas.includes(i)

){


selecionadas.push(i);



desenhar();



}





if(

selecionadas.length===2

){



setTimeout(

verificar,

800

);


}



}







function verificar(){



let primeira=

selecionadas[0];


let segunda=

selecionadas[1];





if(

cartas[primeira]===

cartas[segunda]

){


encontradas.push(

primeira,

segunda

);


pontos+=100;



}



selecionadas=[];



if(

encontradas.length===cartas.length

){



alert(

"MEMORIA.EXE CONCLUÍDO! PONTOS: "

+pontos

);



}



desenhar();



}






desenhar();



console.log(

"MEMORIA.EXE ONLINE"

);
