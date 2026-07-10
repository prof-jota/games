/* ==================================================
   ARCADE WEB SYSTEM
   JOGO: PONG
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

    // Controles do Jogador
    let upPressed = false;
    let downPressed = false;

    // Escutar Teclado
    window.addEventListener("keydown", moverRaquete);
    window.addEventListener("keyup", pararRaquete);

    function moverRaquete(e) {
        if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") upPressed = true;
        if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") downPressed = true;
    }

    function pararRaquete(e) {
        if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") upPressed = false;
        if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") downPressed = false;
    }

    function resetBola() {
        ballX = canvas.width / 2;
        ballY = canvas.height / 2;
        ballSpeedX = -ballSpeedX; // Inverte quem começa sacando
        ballSpeedY = (Math.random() > 0.5 ? 1 : -1) * 4;
    }

    // Loop Principal
    function atualizarJogo() {
        // 1. Movimento do Jogador
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
            // EFEITO SONORO: Bip rápido e agudo de parede
            if (typeof AudioArcade !== 'undefined') AudioArcade.playBip(550, 0.05, "triangle");
        }

        // Colisão com a raquete do Player (Esquerda)
        if (ballX - ballRadius < paddleWidth + 20) { // 20 é o recuo da raquete na tela
            if (ballY > playerY && ballY < playerY + paddleHeight) {
                ballSpeedX = -ballSpeedX;
                // Efeito baseado em onde a bola bateu na raquete
                let deltaY = ballY - (playerY + paddleHeight / 2);
                ballSpeedY = deltaY * 0.3;
                
                // EFEITO SONORO: Rebate clássico de Arcade 8-bit
                if (typeof AudioArcade !== 'undefined') AudioArcade.playBip(440, 0.08, "square");
            } else if (ballX < 0) {
                computerScore++;
                // EFEITO SONORO: Computador pontuou (som de erro)
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
                
                // EFEITO SONORO: Rebate clássico de Arcade 8-bit
                if (typeof AudioArcade !== 'undefined') AudioArcade.playBip(440, 0.08, "square");
            } else if (ballX > canvas.width) {
                playerScore++;
                // EFEITO SONORO: Você pontuou (som de sucesso!)
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
        ctx.setLineDash([]); // Reseta o tracejado

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

    // Cancela qualquer loop anterior para não duplicar velocidade
    if (pongInterval) clearInterval(pongInterval);
    
    // Inicia o loop a ~60 frames por segundo
    pongInterval = setInterval(atualizarJogo, 1000 / 60);

    // Salva uma função de limpeza global para remover os escutadores quando o jogo fechar
    window.limparEventosPong = () => {
        window.removeEventListener("keydown", moverRaquete);
        window.removeEventListener("keyup", pararRaquete);
    };
}
