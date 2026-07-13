/* ==================================================
   ARCADE WEB SYSTEM
   JOGO: FLAPPY (Versão com Suporte a Touch e Scores)
================================================== */

let flappyInterval = null;

function iniciarFlappy() {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    let birdY = canvas.height / 2;
    let birdX = 150;
    let gravidade = 0.4;
    let velocidade = 0;
    const salto = -7;

    let canos = [];
    const canoLargura = 60;
    const canoEspaco = 140;
    let score = 0;
    let gameOver = false;
    let somGameOverTocado = false;

    function criarCano() {
        let alturaSuperior = Math.floor(Math.random() * (canvas.height - canoEspaco - 100)) + 50;
        canos.push({
            x: canvas.width,
            top: alturaSuperior,
            bottom: canvas.height - (alturaSuperior + canoEspaco),
            passou: false
        });
    }

    // Inicializa com um cano
    criarCano();

    // --- ESCUTAR EVENTOS ---

    // Teclado (Desktop)
    window.addEventListener("keydown", saltarPassaroTeclado);

    // Touchscreen (Celular)
    canvas.addEventListener("touchstart", saltarPassaroTouch, { passive: false });

    function executarSalto() {
        if (gameOver) return;
        velocidade = salto;
        if (typeof AudioArcade !== 'undefined') AudioArcade.playBip(400, 0.04, 'sine');
    }

    function saltarPassaroTeclado(e) {
        if (e.key === " " || e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
            e.preventDefault(); // Impede a barra de espaço de rolar a página
            executarSalto();
        }
    }

    function saltarPassaroTouch(e) {
        e.preventDefault(); // Impede o zoom ou rolagem da página ao tocar na tela repetidamente
        executarSalto();
    }

    function atualizar() {
        if (gameOver) return;

        velocidade += gravidade;
        birdY += velocidade;

        // Limites do teto e chão
        if (birdY > canvas.height - 15 || birdY < 15) {
            gameOver = true;
        }

        // Mover canos
        canos.forEach((cano, index) => {
            cano.x -= 3;

            // Detectar Colisão
            if (birdX + 15 > cano.x && birdX - 15 < cano.x + canoLargura) {
                if (birdY - 15 < cano.top || birdY + 15 > canvas.height - cano.bottom) {
                    gameOver = true;
                }
            }

            // Marcar Ponto
            if (!cano.passou && cano.x + canoLargura < birdX) {
                cano.passou = true;
                score += 1;
                if (typeof AudioArcade !== 'undefined') AudioArcade.playBip(880, 0.08, 'triangle');
            }

            // Remove canos antigos
            if (cano.x + canoLargura < 0) canos.splice(index, 1);
        });

        // Adicionar novos canos periodicamente
        if (canos.length > 0 && canos[canos.length - 1].x < canvas.width - 280) {
            criarCano();
        }
    }

    function desenhar() {
        // Fundo azul claro céu
        ctx.fillStyle = "#4ec0ca";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Desenhar Canos
        canos.forEach(cano => {
            ctx.fillStyle = "#73bf2f";
            // Cano superior
            ctx.fillRect(cano.x, 0, canoLargura, cano.top);
            ctx.strokeStyle = "#53801b";
            ctx.strokeRect(cano.x, 0, canoLargura, cano.top);

            // Cano inferior
            ctx.fillRect(cano.x, canvas.height - cano.bottom, canoLargura, cano.bottom);
            ctx.strokeRect(cano.x, canvas.height - cano.bottom, canoLargura, cano.bottom);
        });

        // Desenhar Pássaro (Amarelo)
        ctx.fillStyle = "#f8e71c";
        ctx.beginPath();
        ctx.arc(birdX, birdY, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Olho do pássaro
        ctx.fillStyle = "#fff";
        ctx.fillRect(birdX + 4, birdY - 6, 5, 5);

        // Pontuação
        ctx.font = "30px 'Courier New'";
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.fillText(score, canvas.width / 2, 50);

        if (gameOver) {
            clearInterval(flappyInterval);

            if (typeof window.mostrarBotaoRestart === "function") window.mostrarBotaoRestart();

            ctx.fillStyle = "rgba(0,0,0,0.6)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.font = "40px 'Courier New'";
            ctx.fillStyle = "#ff3333";
            ctx.textAlign = "center";
            ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);

            if (!somGameOverTocado) {
                somGameOverTocado = true;
                
                // Toca som de erro
                if (typeof AudioArcade !== 'undefined') {
                    AudioArcade.playErro();
                }

                // Sincroniza e salva o score no banco local
                if (typeof window.ScoreArcade !== 'undefined') {
                    window.ScoreArcade.atualizarPontuacao("flappy", score);
                }
            }
        }
    }

    if (flappyInterval) clearInterval(flappyInterval);
    flappyInterval = setInterval(() => { atualizar(); desenhar(); }, 1000 / 60);

    // Salva uma função de limpeza global (Atualizada para remover o evento de touch também)
    window.limparEventosFlappy = () => {
        window.removeEventListener("keydown", saltarPassaroTeclado);
        canvas.removeEventListener("touchstart", saltarPassaroTouch);
    };
}