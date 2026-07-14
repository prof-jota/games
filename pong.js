/* ==================================================
   ARCADE WEB SYSTEM
   JOGO: PONG (Campanha por Fases com Dificuldade Progressiva)
================================================== */

let pongAnimFrame = null;

function iniciarPong() {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    // Configurações Básicas do Jogo
    const paddleWidth = 10;
    const paddleHeight = 80;
    const ballRadius = 7;
    const maxScore = 5; // Mantém a pontuação necessária para vencer a rodada/partida
    const maxFases = 5; // Fase final do jogo

    // Posições Iniciais
    let playerY = (canvas.height - paddleHeight) / 2;
    let computerY = (canvas.height - paddleHeight) / 2;
    let ballX = canvas.width / 2;
    let ballY = canvas.height / 2;

    // Sistema de Fases e Pontuação (Estrutura idêntica à original)
    let faseAtual = 1;
    let playerScore = 0;      // Mantém o playerScore puro para o envio final
    let computerScore = 0;    

    // Velocidades Iniciais (Fase 1)
    let baseBallSpeed = 5;
    let ballSpeedX = baseBallSpeed;
    let ballSpeedY = baseBallSpeed;
    const playerSpeed = 7;
    let currentComputerSpeed = 4.2; // Velocidade inicial da IA

    // Estados de Jogo
    let emTransicao = false;  // Controla a tela entre uma fase e outra
    let gameOver = false;     
    let venceuJogo = false;   
    let fimDeJogoEnviado = false;

    // Controles do Jogador
    let upPressed = false;
    let downPressed = false;

    // --- ESCUTAR EVENTOS ---
    window.addEventListener("keydown", moverRaquete);
    window.addEventListener("keyup", pararRaquete);
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

    function tratarTouch(e) {
        e.preventDefault();
        if (gameOver || venceuJogo || emTransicao) return;
        
        const rect = canvas.getBoundingClientRect();
        const touchY = e.touches[0].clientY - rect.top;
        const escalaY = canvas.height / rect.height;
        const canvasTouchY = touchY * escalaY;

        playerY = canvasTouchY - paddleHeight / 2;

        if (playerY < 0) playerY = 0;
        if (playerY > canvas.height - paddleHeight) playerY = canvas.height - paddleHeight;
    }

    function resetBola() {
        ballX = canvas.width / 2;
        ballY = canvas.height / 2;
        ballSpeedX = (ballSpeedX > 0 ? -1 : 1) * baseBallSpeed;
        ballSpeedY = (Math.random() > 0.5 ? 1 : -1) * (baseBallSpeed - 1);
    }

    // Função para subir de fase com efeitos de transição
    function irParaProximaFase() {
        emTransicao = true;

        if (typeof AudioArcade !== 'undefined') AudioArcade.playSucesso();

        setTimeout(() => {
            faseAtual++;
            // Zeramos apenas o score da IA na nova fase para dar chance ao jogador.
            // O playerScore NÃO é resetado para que no final ele some o valor correto!
            computerScore = 0; 

            // Dificuldade aumenta: Bola 15% mais rápida por fase
            baseBallSpeed = 5 * (1 + (faseAtual - 1) * 0.15);
            // IA ganha mais velocidade de reação
            currentComputerSpeed = 4.2 + (faseAtual - 1) * 0.8;

            resetBola();
            emTransicao = false;
        }, 3000); 
    }

    // Loop Principal
    function atualizarJogo() {
        if (gameOver || venceuJogo) return;

        // Se estivermos na tela de transição de fase, apenas desenhamos o aviso
        if (emTransicao) {
            renderizarTransicao();
            pongAnimFrame = requestAnimationFrame(atualizarJogo);
            return;
        }

        // 1. Movimento do Jogador (Teclado)
        if (upPressed && playerY > 0) playerY -= playerSpeed;
        if (downPressed && playerY < canvas.height - paddleHeight) playerY += playerSpeed;

        // 2. Movimento da IA
        const centroRaqueteComputador = computerY + paddleHeight / 2;
        if (centroRaqueteComputador < ballY - 10 && computerY < canvas.height - paddleHeight) {
            computerY += currentComputerSpeed;
        } else if (centroRaqueteComputador > ballY + 10 && computerY > 0) {
            computerY -= currentComputerSpeed;
        }

        // 3. Movimento da Bola
        ballX += ballSpeedX;
        ballY += ballSpeedY;

        // Colisão Parede Superior / Inferior
        if (ballY - ballRadius < 0) {
            ballY = ballRadius;
            ballSpeedY = -ballSpeedY;
            if (typeof AudioArcade !== 'undefined') AudioArcade.playBip(550, 0.05, "triangle");
        } else if (ballY + ballRadius > canvas.height) {
            ballY = canvas.height - ballRadius;
            ballSpeedY = -ballSpeedY;
            if (typeof AudioArcade !== 'undefined') AudioArcade.playBip(550, 0.05, "triangle");
        }

        // Colisão Raquete Jogador (Esquerda)
        if (ballX - ballRadius < paddleWidth + 20) {
            if (ballY > playerY && ballY < playerY + paddleHeight) {
                ballSpeedX = Math.abs(ballSpeedX); 
                let deltaY = ballY - (playerY + paddleHeight / 2);
                ballSpeedY = deltaY * 0.35;
                if (typeof AudioArcade !== 'undefined') AudioArcade.playBip(440, 0.08, "square");
            } else if (ballX < 0) {
                computerScore++;
                if (computerScore >= maxScore) {
                    gameOver = true; // Se a IA ganhar a rodada, acaba o jogo
                } else {
                    if (typeof AudioArcade !== 'undefined') AudioArcade.playErro();
                    resetBola();
                }
            }
        }

        // Colisão Raquete Computador (Direita)
        if (ballX + ballRadius > canvas.width - paddleWidth - 20) {
            if (ballY > computerY && ballY < computerY + paddleHeight) {
                ballSpeedX = -Math.abs(ballSpeedX); 
                let deltaY = ballY - (computerY + paddleHeight / 2);
                ballSpeedY = deltaY * 0.35;
                if (typeof AudioArcade !== 'undefined') AudioArcade.playBip(440, 0.08, "square");
            } else if (ballX > canvas.width) {
                playerScore++; // O playerScore sobe continuamente ao longo das fases
                
                // Verifica se o jogador atingiu a pontuação para passar de fase
                // (Exemplo: 5 pontos para Fase 2, 10 para Fase 3, 15 para Fase 4...)
                if (playerScore >= faseAtual * maxScore) {
                    if (faseAtual >= maxFases) {
                        venceuJogo = true; // Venceu a última fase!
                    } else {
                        irParaProximaFase(); 
                    }
                } else {
                    if (typeof AudioArcade !== 'undefined') AudioArcade.playSucesso();
                    resetBola();
                }
            }
        }

        // 4. RENDERIZAÇÃO PADRÃO DO JOGO
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Fundo
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Rede Central
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.stroke();
        ctx.setLineDash([]);

        // Desenhar Raquetes e Bola
        ctx.fillStyle = "#fff";
        ctx.fillRect(20, playerY, paddleWidth, paddleHeight);
        ctx.fillRect(canvas.width - paddleWidth - 20, computerY, paddleWidth, paddleHeight);
        
        ctx.beginPath();
        ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
        ctx.fill();

        // Placar da rodada atual de forma visual amigável
        // Exibe o progresso do jogador dentro da fase atual
        let scoreExibidoPlayer = playerScore - ((faseAtual - 1) * maxScore);
        ctx.font = "45px 'Courier New'";
        ctx.textAlign = "center";
        ctx.fillText(scoreExibidoPlayer, canvas.width / 4, 60);
        ctx.fillText(computerScore, (canvas.width / 4) * 3, 60);

        // Indicadores no topo do Canvas
        ctx.font = "16px 'Courier New'";
        ctx.fillStyle = "#00ff66";
        ctx.fillText(`FASE ${faseAtual}/${maxFases}`, canvas.width / 2, 30);
        ctx.fillStyle = "#aaa";
        ctx.fillText(`SCORE TOTAL: ${playerScore}`, canvas.width / 2, 55);

        // Telas de Fim de Jogo (Vitória ou Derrota total)
        if (gameOver || venceuJogo) {
            if (pongAnimFrame) cancelAnimationFrame(pongAnimFrame);

            // ENVIO SEGURO DO SCORE ORIGINAL
            if (!fimDeJogoEnviado) {
                fimDeJogoEnviado = true;

                // Envia exatamente a variável 'playerScore' sem alterações estruturais
                if (typeof window.ScoreArcade !== 'undefined') {
                    window.ScoreArcade.atualizarPontuacao("pong", playerScore);
                }

                if (typeof AudioArcade !== 'undefined') {
                    if (venceuJogo) {
                        AudioArcade.playSucesso();
                    } else {
                        AudioArcade.playErro();
                    }
                }
            }

            ctx.fillStyle = "rgba(0,0,0,0.85)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.font = "40px 'Courier New'";
            ctx.textAlign = "center";

            if (venceuJogo) {
                ctx.fillStyle = "#00ff66";
                ctx.fillText("CAMPEÃO DO PONG!", canvas.width / 2, canvas.height / 2 - 20);
                ctx.font = "20px 'Courier New'";
                ctx.fillStyle = "#fff";
                ctx.fillText(`Você venceu todas as ${maxFases} fases!`, canvas.width / 2, canvas.height / 2 + 25);
                ctx.fillText(`Pontuação Enviada: ${playerScore}`, canvas.width / 2, canvas.height / 2 + 60);
            } else {
                ctx.fillStyle = "#ff3333";
                ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 20);
                ctx.font = "20px 'Courier New'";
                ctx.fillStyle = "#fff";
                ctx.fillText(`Você parou na Fase ${faseAtual}`, canvas.width / 2, canvas.height / 2 + 25);
                ctx.fillText(`Pontuação Final: ${playerScore}`, canvas.width / 2, canvas.height / 2 + 60);
            }
            return;
        }

        pongAnimFrame = requestAnimationFrame(atualizarJogo);
    }

    // Renderiza a transição de fase
    function renderizarTransicao() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.textAlign = "center";
        ctx.font = "35px 'Courier New'";
        ctx.fillStyle = "#00ff66";
        ctx.fillText(`FASE ${faseAtual} CONCLUÍDA!`, canvas.width / 2, canvas.height / 2 - 30);

        ctx.font = "20px 'Courier New'";
        ctx.fillStyle = "#fff";
        ctx.fillText(`Prepare-se para a FASE ${faseAtual + 1}`, canvas.width / 2, canvas.height / 2 + 20);
        ctx.fillStyle = "#ffcc00";
        ctx.fillText(`A velocidade do jogo vai aumentar!`, canvas.width / 2, canvas.height / 2 + 55);
    }

    // Inicialização
    if (pongAnimFrame) cancelAnimationFrame(pongAnimFrame);
    pongAnimFrame = requestAnimationFrame(atualizarJogo);

    // Função de Limpeza
    window.limparEventosPong = () => {
        if (pongAnimFrame) { 
            cancelAnimationFrame(pongAnimFrame); 
            pongAnimFrame = null; 
        }
        window.removeEventListener("keydown", moverRaquete);
        window.removeEventListener("keyup", pararRaquete);
        canvas.removeEventListener("touchstart", tratarTouch);
        canvas.removeEventListener("touchmove", tratarTouch);
    };
}
