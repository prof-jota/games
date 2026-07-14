/* ==================================================
   ARCADE WEB SYSTEM
   JOGO: JOGO DA VELHA (IA Inteligente + Campanha Progressiva)
================================================== */

function iniciarVelha() {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    // Variáveis Globais de Estado da Partida
    let tabuleiro = ["", "", "", "", "", "", "", "", ""];
    let jogoAtivo = true;
    let mensagemStatus = "SEU TURNO (X)";
    let scoreEnviado = false; 

    // Mecânica de Pontuação Progressiva
    let scoreAcumulado = 0;
    let rodadaAtual = 1;
    let jogadasDoJogador = 0; // Quantos cliques válidos o jogador fez nesta rodada

    const tamanhoQuadrado = 120;
    const offsetX = (canvas.width - tamanhoQuadrado * 3) / 2;
    const offsetY = (canvas.height - tamanhoQuadrado * 3) / 2 + 20; // Rebaixado levemente para dar espaço ao HUD

    renderizar();

    // Eventos para Desktop (Click) e Mobile (Touch)
    canvas.addEventListener("click", gerirCliqueTabuleiro);
    canvas.addEventListener("touchstart", gerirTouchTabuleiro, { passive: false });

    function gerirTouchTabuleiro(e) {
        e.preventDefault(); 
        if (e.touches.length > 0) {
            processarCliqueOuToque(e.touches[0].clientX, e.touches[0].clientY);
        }
    }

    function gerirCliqueTabuleiro(e) {
        processarCliqueOuToque(e.clientX, e.clientY);
    }

    function processarCliqueOuToque(clientX, clientY) {
        if (!jogoAtivo || mensagemStatus.includes("PENSANDO") || mensagemStatus.includes("PREPARE-SE")) return;

        const rect = canvas.getBoundingClientRect();
        const escalaX = canvas.width / rect.width;
        const escalaY = canvas.height / rect.height;

        const mouseX = (clientX - rect.left) * escalaX;
        const mouseY = (clientY - rect.top) * escalaY;

        for (let i = 0; i < 9; i++) {
            const linha = Math.floor(i / 3);
            const coluna = i % 3;

            const qX = offsetX + coluna * tamanhoQuadrado;
            const qY = offsetY + linha * tamanhoQuadrado;

            if (mouseX > qX && mouseX < qX + tamanhoQuadrado &&
                mouseY > qY && mouseY < qY + tamanhoQuadrado) {
                
                if (tabuleiro[i] === "") {
                    tabuleiro[i] = "X";
                    jogadasDoJogador++;
                    if (typeof AudioArcade !== 'undefined') AudioArcade.playBip(400, 0.08, 'sine');
                    
                    if (verificarVencedor("X")) {
                        processarFimDaRodada("VOCÊ VENCEU!");
                        return;
                    }

                    if (tabuleiro.every(q => q !== "")) {
                        processarFimDaRodada("EMPATE!");
                        return;
                    }

                    // Turno da IA
                    mensagemStatus = "IA PENSANDO...";
                    renderizar();
                    setTimeout(jogadaIA, 400);
                }
            }
        }
    }

    function jogadaIA() {
        if (!jogoAtivo) return;

        let escolha = -1;

        // 1. REGRA DE VITÓRIA: IA verifica se pode ganhar nesta jogada
        escolha = encontrarMelhorEspaco("O");

        // 2. REGRA DE DEFESA: Se não puder ganhar, verifica se precisa bloquear o jogador
        if (escolha === -1) {
            escolha = encontrarMelhorEspaco("X");
        }

        // 3. REGRA POSICIONAL: Se não houver ameaças, domina as melhores posições do tabuleiro
        if (escolha === -1) {
            if (tabuleiro[4] === "") {
                escolha = 4;
            } else {
                const cantos = [0, 2, 6, 8].filter(i => tabuleiro[i] === "");
                if (cantos.length > 0) {
                    escolha = cantos[Math.floor(Math.random() * cantos.length)];
                }
            }
        }

        // 4. Fallback de segurança
        if (escolha === -1) {
            let vazios = [];
            tabuleiro.forEach((q, i) => { if (q === "") vazios.push(i); });
            if (vazios.length > 0) {
                escolha = vazios[Math.floor(Math.random() * vazios.length)];
            }
        }

        if (escolha !== -1) {
            tabuleiro[escolha] = "O";
            if (typeof AudioArcade !== 'undefined') AudioArcade.playBip(300, 0.08, 'triangle');

            if (verificarVencedor("O")) {
                processarFimDaRodada("A IA VENCEU!");
                return;
            }

            if (tabuleiro.every(q => q !== "")) {
                processarFimDaRodada("EMPATE!");
                return;
            }

            mensagemStatus = "SEU TURNO (X)";
        }
        renderizar();
    }

    function encontrarMelhorEspaco(player) {
        const condicoes = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], 
            [0, 3, 6], [1, 4, 7], [2, 5, 8], 
            [0, 4, 8], [2, 4, 6]             
        ];

        for (let comb of condicoes) {
            const marcados = comb.filter(i => tabuleiro[i] === player);
            const vazios = comb.filter(i => tabuleiro[i] === "");

            if (marcados.length === 2 && vazios.length === 1) {
                return vazios[0];
            }
        }
        return -1;
    }

    function verificarVencedor(player) {
        const condicoes = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], 
            [0, 3, 6], [1, 4, 7], [2, 5, 8], 
            [0, 4, 8], [2, 4, 6]             
        ];
        return condicoes.some(comb => comb.every(i => tabuleiro[i] === player));
    }

    // Gerencia o fluxo dinâmico de pontuação e transição
    function processarFimDaRodada(resultado) {
        if (resultado === "VOCÊ VENCEU!") {
            // Pontuação Base: 100 pontos por vitória
            let pontosGanhos = 100;

            // Bônus de eficiência: quanto menos turnos você levou para travar a IA, mais ganha
            // Exemplo: Se ganhou com 3 jogadas -> 50 - (3 * 10) = +20 extras.
            let bonusEficiencia = 50 - (jogadasDoJogador * 10);
            if (bonusEficiencia > 0) pontosGanhos += bonusEficiencia;

            scoreAcumulado += pontosGanhos;
            mensagemStatus = `VITÓRIA! +${pontosGanhos} PTS`;
            renderizar();

            if (typeof AudioArcade !== 'undefined') AudioArcade.playSucesso();

            // Sincroniza o progresso no backend preventivamente a cada vitória
            if (typeof window.ScoreArcade !== 'undefined') {
                window.ScoreArcade.atualizarPontuacao("velha", scoreAcumulado);
            }

            // Avança para a próxima rodada após um delay sutil
            setTimeout(() => {
                rodadaAtual++;
                tabuleiro = ["", "", "", "", "", "", "", "", ""];
                jogadasDoJogador = 0;
                mensagemStatus = `RODADA ${rodadaAtual} - SEU TURNO`;
                renderizar();
            }, 2000);

        } else if (resultado === "EMPATE!") {
            // Empate concede um prêmio menor de resiliência e avança a rodada
            scoreAcumulado += 15;
            mensagemStatus = "VELHA! +15 PTS";
            renderizar();

            if (typeof AudioArcade !== 'undefined') AudioArcade.playBip(440, 0.15, "square");

            if (typeof window.ScoreArcade !== 'undefined') {
                window.ScoreArcade.atualizarPontuacao("velha", scoreAcumulado);
            }

            setTimeout(() => {
                rodadaAtual++;
                tabuleiro = ["", "", "", "", "", "", "", "", ""];
                jogadasDoJogador = 0;
                mensagemStatus = `RODADA ${rodadaAtual} - SEU TURNO`;
                renderizar();
            }, 2000);

        } else if (resultado === "A IA VENCEU!") {
            // Fim total da linha de vitórias (Game Over)
            jogoAtivo = false;
            mensagemStatus = "FIM DE JOGO!";
            renderizar();

            if (!scoreEnviado) {
                scoreEnviado = true;
                if (typeof window.ScoreArcade !== 'undefined') {
                    window.ScoreArcade.atualizarPontuacao("velha", scoreAcumulado);
                }
                if (typeof AudioArcade !== 'undefined') AudioArcade.playErro();
            }
        }
    }

    function renderizar() {
        ctx.fillStyle = "#151520";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // HUD - Placar Superior Contínuo
        ctx.font = "20px 'Courier New'";
        ctx.fillStyle = "#ebf1ee";
        ctx.textBaseline = "top";

        ctx.textAlign = "left";
        ctx.fillText(`SCORE ACC: ${scoreAcumulado}`, 30, 25);

        ctx.textAlign = "right";
        ctx.fillStyle = "#ffcc00";
        ctx.fillText(`RODADA: ${rodadaAtual}`, canvas.width - 30, 25);

        // Desenhar Linhas do Tabuleiro
        ctx.strokeStyle = "#444466";
        ctx.lineWidth = 5;

        for (let i = 1; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(offsetX + i * tamanhoQuadrado, offsetY);
            ctx.lineTo(offsetX + i * tamanhoQuadrado, offsetY + tamanhoQuadrado * 3);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(offsetX, offsetY + i * tamanhoQuadrado);
            ctx.lineTo(offsetX + tamanhoQuadrado * 3, offsetY + i * tamanhoQuadrado);
            ctx.stroke();
        }

        // Desenhar Símbolos X e O
        ctx.font = "60px 'Courier New'";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        tabuleiro.forEach((simbolo, i) => {
            if (simbolo === "") return;
            const linha = Math.floor(i / 3);
            const coluna = i % 3;

            const cx = offsetX + coluna * tamanhoQuadrado + tamanhoQuadrado / 2;
            const cy = offsetY + linha * tamanhoQuadrado + tamanhoQuadrado / 2;

            ctx.fillStyle = simbolo === "X" ? "#00ff66" : "#ff3366";
            ctx.fillText(simbolo, cx, cy);
        });

        // Banner Centralizado de Turno/Aviso
        ctx.font = "24px 'Courier New'";
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        
        if (mensagemStatus === "FIM DE JOGO!") {
            ctx.fillStyle = "#ff3366";
            ctx.fillText(mensagemStatus, canvas.width / 2, offsetY - 35);
            
            ctx.fillStyle = "#fff";
            ctx.font = "18px 'Courier New'";
            ctx.fillText(`Você caiu na Rodada ${rodadaAtual} com ${scoreAcumulado} pontos.`, canvas.width / 2, offsetY + (tamanhoQuadrado * 3) + 35);
        } else {
            if (mensagemStatus.includes("VITÓRIA")) ctx.fillStyle = "#00ff66";
            else if (mensagemStatus.includes("VELHA")) ctx.fillStyle = "#ffcc00";
            ctx.fillText(mensagemStatus, canvas.width / 2, offsetY - 35);
        }
    }

    window.limparEventosVelha = () => {
        canvas.removeEventListener("click", gerirCliqueTabuleiro);
        canvas.removeEventListener("touchstart", gerirTouchTabuleiro);
    };
}
