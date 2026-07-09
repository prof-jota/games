/* =====================================================
   ARCADE WEB SYSTEM
   TERMINAL EDITION

   MAIN.JS
===================================================== */


// ==========================================
// ELEMENTOS DO SISTEMA
// ==========================================


const bootScreen = document.getElementById("boot-screen");

const arcade = document.getElementById("arcade");

const progress = document.getElementById("progress");

const bootMessage = document.getElementById("boot-message");




// ==========================================
// PROCESSO DE BOOT
// ==========================================


let carregamento = 0;


const mensagens = [

    "CARREGANDO COMPONENTES...",

    "INICIANDO MOTOR DE JOGOS...",

    "VERIFICANDO ARQUIVOS .EXE...",

    "CARREGANDO BIBLIOTECA...",

    "SISTEMA PRONTO!"

];



let etapa = 0;



const boot = setInterval(()=>{


    carregamento += 10;


    progress.style.width = carregamento + "%";



    if(carregamento % 20 === 0 && etapa < mensagens.length){


        bootMessage.textContent = mensagens[etapa];


        etapa++;

    }



    if(carregamento >=100){


        clearInterval(boot);



        setTimeout(()=>{


            bootScreen.style.display="none";


            arcade.classList.remove("hidden");


        },1000);



    }



},300);





// ==========================================
// MENU
// ==========================================


const itensMenu = document.querySelectorAll("aside li");



itensMenu.forEach(item=>{


    item.addEventListener("click",()=>{


        itensMenu.forEach(i=>{

            i.classList.remove("selected");

        });



        item.classList.add("selected");



        console.log(
            "Executando:",
            item.innerText
        );


    });



});




// ==========================================
// BOTÃO JOGAR
// ==========================================


const botaoJogar = document.querySelector(
".featured button"
);



botaoJogar.addEventListener("click",()=>{


    iniciarPrograma("PONG.EXE");


});





// ==========================================
// ABRIR JOGOS
// ==========================================


const jogos =
document.querySelectorAll(".game");



jogos.forEach(jogo=>{


    jogo.addEventListener("click",()=>{


        const nome =
        jogo.innerText.split("\n")[1];



        iniciarPrograma(nome);



    });



});





// ==========================================
// SIMULAÇÃO DE EXECUÇÃO
// ==========================================


function iniciarPrograma(programa){


    alert(

`ARCADE WEB SYSTEM

Executando:

${programa}

Carregando...

`

    );


    console.log(

        "Executando programa:",
        programa

    );


}





// ==========================================
// EFEITO DE DIGITAÇÃO
// ==========================================


function escreverTexto(elemento,texto){


    elemento.textContent="";


    let contador=0;



    const intervalo=setInterval(()=>{


        elemento.textContent += texto[contador];


        contador++;


        if(contador >= texto.length){

            clearInterval(intervalo);

        }


    },50);


}




// ==========================================
// RELÓGIO DO SISTEMA
// ==========================================


setInterval(()=>{


    const agora = new Date();


    console.log(

        "SYSTEM TIME:",
        agora.toLocaleTimeString()

    );


},1000);

const janelaJogo =
document.getElementById("game-window");


const nomePrograma =
document.getElementById("program-name");



function iniciarPrograma(programa){


    janelaJogo.classList.remove("hidden");


    nomePrograma.textContent = programa;



}



document
.getElementById("close-game")
.addEventListener("click",()=>{


    janelaJogo.classList.add("hidden");


});
