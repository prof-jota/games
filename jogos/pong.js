/*
====================================
 PONG.EXE
 ARCADE WEB SYSTEM
====================================
*/


const canvas =
document.getElementById("pongCanvas");


const ctx =
canvas.getContext("2d");



let playerY = 150;

let enemyY = 150;


let ballX = 400;

let ballY = 200;


let ballSpeedX = 5;

let ballSpeedY = 5;



let scorePlayer = 0;

let scoreEnemy = 0;



// CONTROLES


document.addEventListener("keydown",(e)=>{


    if(e.key === "w"){

        playerY -= 20;

    }


    if(e.key === "s"){

        playerY += 20;

    }


});




// LOOP DO JOGO


function update(){


    ballX += ballSpeedX;

    ballY += ballSpeedY;



    // parede superior

    if(ballY <=0 ||
       ballY >= canvas.height){

        ballSpeedY *= -1;

    }



    // IA inimigo


    if(enemyY < ballY){

        enemyY +=4;

    }

    else{

        enemyY -=4;

    }



    // colisão jogador


    if(

        ballX < 30 &&

        ballY > playerY &&

        ballY < playerY+100

    ){

        ballSpeedX *= -1;

    }



    // colisão inimigo


    if(

        ballX > 770 &&

        ballY > enemyY &&

        ballY < enemyY+100

    ){

        ballSpeedX *= -1;

    }



    // pontos


    if(ballX < 0){

        scoreEnemy++;

        resetBall();

    }



    if(ballX > canvas.width){

        scorePlayer++;

        resetBall();

    }



}





function resetBall(){


    ballX=400;

    ballY=200;


    ballSpeedX*=-1;


}





function draw(){


    ctx.fillStyle="black";

    ctx.fillRect(

        0,

        0,

        canvas.width,

        canvas.height

    );



    ctx.strokeStyle="#00ff66";


    ctx.beginPath();

    ctx.moveTo(400,0);

    ctx.lineTo(400,400);

    ctx.stroke();



    // jogador


    ctx.fillStyle="#00ff66";

    ctx.fillRect(

        10,

        playerY,

        15,

        100

    );



    // inimigo


    ctx.fillRect(

        775,

        enemyY,

        15,

        100

    );



    // bola


    ctx.beginPath();

    ctx.arc(

        ballX,

        ballY,

        10,

        0,

        Math.PI*2

    );


    ctx.fill();



    // placar


    ctx.font="25px Courier";


    ctx.fillText(

        scorePlayer,

        350,

        40

    );


    ctx.fillText(

        scoreEnemy,

        430,

        40

    );

}



function gameLoop(){


    update();

    draw();


    requestAnimationFrame(gameLoop);


}



gameLoop();