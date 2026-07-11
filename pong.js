/* ==================================================
   ARCADE WEB SYSTEM
   JOGO: PONG (Versão com Suporte a Touch)
================================================== */

let pongInterval = null; // Guarda o loop do jogo para podermos parar depois

function iniciarPong() {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    // Configurações do Jogo
    const paddleWidth = 10;
    const paddleHeight = 80;
    const ballRadius = 7;

    // Posições Iniciais
    let playerY = (canvas.height - paddleHeight) / 2;
    let computerY = (canvas.height - paddleHeight) / 2;
    let ballX = canvas.width / 2;
    let ballY = canvas.height / 2;

    // Velocidades
    let ballSpeedX = 5;
    let ballSpeedY = 5;
    const playerSpeed = 7;
    const computerSpeed = 4.5; // Ajuste para mudar a dificuldade

    // Pontuação
    let playerScore = 0;
    let computerScore = 0;

    // Controles do Jogador (Teclado)
    let upPressed = false;
    let downPressed = false;

    // --- ESCUTAR EVENTOS ---

    // Teclado (Desktop)
    window.addEventListener("keydown", moverRaquete);
    window.addEventListener("keyup", pararRaquete);

    // Touchscreen (Celular)
    canvas.addEventListener("touchstart", tratarTouch, { passive: false });
    canvas.addEventListener("touchmove", tratarTouch, { passive: false });

    function moverRaquete(e) {
        if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") upPressed = true;
        if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") downPressed = true;
    }

    function pararRaquete(e) {
        if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") upPressed = false;
        if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") downPressed = false;
    }

    // Função que calcula a posição do touch proporcional ao tamanho do Canvas
    function tratarTouch(e) {
        e.preventDefault(); // Impede o celular de rolar a página enquanto joga
        
        const rect = canvas.getBoundingClientRect();
        // Pega o primeiro ponto de toque
        const touchY = e.touches[0].clientY - rect.top;
        
        // Escala a posição caso o canvas esteja redimensionado pelo CSS
        const escalaY = canvas.height / rect.height;
        const canvasTouchY = touchY * escalaY;

        // Centraliza a raquete no dedo do jogador
        playerY = canvasTouchY - paddleHeight / 2;

        // Limita a raquete dentro das bordas do jogo
        if (playerY < 0) playerY = 0;
        if (playerY > canvas.height - paddleHeight) playerY = canvas.height - paddleHeight;
    }

    function resetBola() {
        ballX = canvas.width / 2;
        ballY = canvas.height / 2;
        ballSpeedX = -ballSpeedX; // Inverte quem começa sacando
        ballSpeedY = (Math.random() > 0.5 ? 1 : -1) * 4;
    }

    // Loop Principal
    function atualizarJogo() {
        // 1. Movimento do Jogador (Apenas via Teclado, pois o Touch atualiza direto)
        if (upPressed && playerY > 0) playerY -= playerSpeed;
        if (downPressed && playerY < canvas.height - paddleHeight) playerY += playerSpeed;

        // 2. Movimento da Inteligência Artificial (Computador)
        const centroRaqueteComputador = computerY + paddleHeight / 2;
        if (centroRaqueteComputador < ballY - 10 && computerY < canvas.height - paddleHeight) {
            computerY += computerSpeed;
        } else if (centroRaqueteComputador > ballY + 10 && computerY > 0) {
            computerY -= computerSpeed;
        }

        // 3. Movimento da Bola
        ballX += ballSpeedX;
        ballY += ballSpeedY;

        // Colisão com as paredes superiores/inferiores (Ricochete)
        if (ballY - ballRadius < 0 || ballY + ballRadius > canvas.height) {
            ballSpeedY = -ballSpeedY;
            if (typeof AudioArcade !== 'undefined') AudioArcade.playBip(550, 0.05, "triangle");
        }

        // Colisão com a raquete do Player (Esquerda)
        if (ballX - ballRadius < paddleWidth + 20) {
            if (ballY > playerY && ballY < playerY + paddleHeight) {
                ballSpeedX = -ballSpeedX;
                let deltaY = ballY - (playerY + paddleHeight / 2);
                ballSpeedY = deltaY * 0.3;
                if (typeof AudioArcade !== 'undefined') AudioArcade.playBip(440, 0.08, "square");
            } else if (ballX < 0) {
                computerScore++;
                if (typeof AudioArcade !== 'undefined') AudioArcade.playErro();
                resetBola();
            }
        }

        // Colisão com a raquete do Computador (Direita)
        if (ballX + ballRadius > canvas.width - paddleWidth - 20) {
            if (ballY > computerY && ballY < computerY + paddleHeight) {
                ballSpeedX = -ballSpeedX;
                let deltaY = ballY - (computerY + paddleHeight / 2);
                ballSpeedY = deltaY * 0.3;
                if (typeof AudioArcade !== 'undefined') AudioArcade.playBip(440, 0.08, "square");
            } else if (ballX > canvas.width) {
                playerScore++;
                if (typeof AudioArcade !== 'undefined') AudioArcade.playSucesso();
                resetBola();
            }
        }

        // 4. RENDERIZAÇÃO NA TELA
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Fundo Preto
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Linha Divisória Central
        ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.stroke();
        ctx.setLineDash([]);

        // Cores dos elementos do jogo
        ctx.fillStyle = "#fff";

        // Raquete Jogador (Esquerda)
        ctx.fillRect(20, playerY, paddleWidth, paddleHeight);

        // Raquete Computador (Direita)
        ctx.fillRect(canvas.width - paddleWidth - 20, computerY, paddleWidth, paddleHeight);

        // Bola
        ctx.beginPath();
        ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
        ctx.fill();

        // Placar
        ctx.font = "45px 'Courier New'";
        ctx.fillText(playerScore, canvas.width / 4, 60);
        ctx.fillText(computerScore, (canvas.width / 4) * 3, 60);
    }

    if (pongInterval) clearInterval(pongInterval);
    pongInterval = setInterval(atualizarJogo, 1000 / 60);

    // Salva uma função de limpeza global (Atualizada para remover os eventos de touch também)
    window.limparEventosPong = () => {
        window.removeEventListener("keydown", moverRaquete);
        window.removeEventListener("keyup", pararRaquete);
        canvas.removeEventListener("touchstart", tratarTouch);
        canvas.removeEventListener("touchmove", tratarTouch);
    };
}