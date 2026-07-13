/* ==================================================
   ARCADE WEB SYSTEM
   JOGO: PAC-MAN (Retro Style)
================================================== */

let pacmanInterval = null;

function iniciarPacman() {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    // Configurações do Grid (Labirinto adaptado para tela 900x500)
    const tileSize = 25;
    
    // 1 = Parede (Azul), 0 = Pastilha (Pontos), 2 = Caminho Vazio
    const mapa = [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
        [1,0,1,1,0,1,0,1,1,1,1,1,0,0,1,0,1,1,1,1,0,1,0,0,1,1,1,1,1,0,1,0,1,1,0,1],
        [1,0,1,1,0,0,0,0,0,0,0,1,0,0,0,0,1,1,1,1,0,0,0,0,1,0,0,0,0,0,0,0,1,1,0,1],
        [1,0,0,0,0,1,1,1,1,1,0,1,1,1,1,0,1,1,1,1,0,1,1,1,1,0,1,1,1,1,1,0,0,0,0,1],
        [1,1,1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,1,1,1],
        [1,1,1,0,0,1,0,1,0,1,0,1,1,1,1,1,2,2,2,2,1,1,1,1,1,0,1,0,1,0,1,0,0,1,1,1],
        [2,2,2,0,0,0,0,1,0,0,0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0,0,0,1,0,0,0,0,2,2,2],
        [1,1,1,0,0,1,0,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,0,1,0,0,1,1,1],
        [1,1,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,1,1],
        [1,0,0,0,0,1,1,1,1,1,0,1,1,1,1,0,1,1,1,1,0,1,1,1,1,0,1,1,1,1,1,0,0,0,0,1],
        [1,0,1,1,0,0,0,0,0,0,0,1,0,0,0,0,1,1,1,1,0,0,0,0,1,0,0,0,0,0,0,0,1,1,0,1],
        [1,0,1,1,0,1,0,1,1,1,1,1,0,0,1,0,1,1,1,1,0,1,0,0,1,1,1,1,1,0,1,0,1,1,0,1],
        [1,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ];

    // Entidades do jogo
    let pacman = { x: 1, y: 1, dx: 0, dy: 0, proximoDx: 0, proximoDy: 0, bocaAberta: 0.2, bocaVelocidade: 0.02, direcaoRadianos: 0 };
    let fantasma = { x: 17, y: 7, dx: 1, dy: 0, cor: "#ff0000" }; // Blinky

    let score = 0;
    let gameOver = false;
    let venceu = false;
    let somGameOverTocado = false;

    // --- CONTROLES (TECLADO) ---
    window.addEventListener("keydown", mudarDirecaoTeclado);

    function mudarDirecaoTeclado(e) {
        if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") { pacman.proximoDx = 0; pacman.proximoDy = -1; }
        if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") { pacman.proximoDx = 0; pacman.proximoDy = 1; }
        if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") { pacman.proximoDx = -1; pacman.proximoDy = 0; }
        if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") { pacman.proximoDx = 1; pacman.proximoDy = 0; }
    }

    // --- CONTROLES (TOUCHSCREEN / SWIPE GESTURES) ---
    let touchStartX = 0;
    let touchStartY = 0;

    canvas.addEventListener("touchstart", tratarTouchStart, { passive: false });
    canvas.addEventListener("touchend", tratarTouchEnd, { passive: false });

    function tratarTouchStart(e) {
        e.preventDefault(); // Evita o scroll indesejado ao jogar no mobile
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }

    function tratarTouchEnd(e) {
        e.preventDefault();
        if (e.changedTouches.length === 0) return;

        let touchEndX = e.changedTouches[0].clientX;
        let touchEndY = e.changedTouches[0].clientY;

        let diffX = touchEndX - touchStartX;
        let diffY = touchEndY - touchStartY;

        // Sensibilidade mínima para registrar o deslize
        const threshold = 30; 

        if (Math.abs(diffX) > Math.abs(diffY)) {
            // Movimento predominantemente Horizontal
            if (Math.abs(diffX) > threshold) {
                if (diffX > 0) { pacman.proximoDx = 1; pacman.proximoDy = 0; } // Direita
                else { pacman.proximoDx = -1; pacman.proximoDy = 0; } // Esquerda
            }
        } else {
            // Movimento predominantemente Vertical
            if (Math.abs(diffY) > threshold) {
                if (diffY > 0) { pacman.proximoDx = 0; pacman.proximoDy = 1; } // Baixo
                else { pacman.proximoDx = 0; pacman.proximoDy = -1; } // Cima
            }
        }
    }

    function podeMover(x, y, dx, dy) {
        let proximoX = x + dx;
        let proximoY = y + dy;

        // Efeito Túnel (vãos sem colisão nas extremidades laterais)
        if (proximoX < 0 || proximoX >= mapa[0].length) return true;

        return mapa[proximoY] && mapa[proximoY][proximoX] !== 1;
    }

    function atualizar() {
        if (gameOver || venceu) return;

        // Tenta aplicar a rotação se a direção do buffer estiver livre
        if (podeMover(pacman.x, pacman.y, pacman.proximoDx, pacman.proximoDy)) {
            pacman.dx = pacman.proximoDx;
            pacman.dy = pacman.proximoDy;
            
            if (pacman.dx === 1) pacman.direcaoRadianos = 0;
            if (pacman.dx === -1) pacman.direcaoRadianos = Math.PI;
            if (pacman.dy === 1) pacman.direcaoRadianos = Math.PI / 2;
            if (pacman.dy === -1) pacman.direcaoRadianos = Math.PI * 1.5;
        }

        // Movimentação do Pacman
        if (podeMover(pacman.x, pacman.y, pacman.dx, pacman.dy)) {
            pacman.x += pacman.dx;
            pacman.y += pacman.dy;

            // Teletransporte pelas bordas (Túnel)
            if (pacman.x < 0) pacman.x = mapa[0].length - 1;
            else if (pacman.x >= mapa[0].length) pacman.x = 0;
        }

        // Animação da Boca
        pacman.bocaAberta += pacman.bocaVelocidade;
        if (pacman.bocaAberta > 0.4 || pacman.bocaAberta < 0.05) {
            pacman.bocaVelocidade = -pacman.bocaVelocidade;
        }

        // Comer Pastilhas
        if (mapa[pacman.y] && mapa[pacman.y][pacman.x] === 0) {
            mapa[pacman.y][pacman.x] = 2; // Substitui por caminho vazio
            score += 10;
            if (typeof AudioArcade !== 'undefined') AudioArcade.playBip(600, 0.03, 'sine');
        }

        // --- INTELIGÊNCIA ARTIFICIAL DO FANTASMA (Blinky) ---
        let direcoesPossiveis = [];
        if (podeMover(fantasma.x, fantasma.y, 1, 0) && fantasma.dx !== -1) direcoesPossiveis.push({x: 1, y: 0});
        if (podeMover(fantasma.x, fantasma.y, -1, 0) && fantasma.dx !== 1) direcoesPossiveis.push({x: -1, y: 0});
        if (podeMover(fantasma.x, fantasma.y, 0, 1) && fantasma.dy !== -1) direcoesPossiveis.push({x: 0, y: 1});
        if (podeMover(fantasma.x, fantasma.y, 0, -1) && fantasma.dy !== 1) direcoesPossiveis.push({x: 0, y: -1});

        if (direcoesPossiveis.length > 0) {
            // IA de Perseguição: Prioriza o caminho geometricamente mais próximo do Pac-Man
            direcoesPossiveis.sort((a, b) => {
                let distA = Math.abs((fantasma.x + a.x) - pacman.x) + Math.abs((fantasma.y + a.y) - pacman.y);
                let distB = Math.abs((fantasma.x + b.x) - pacman.x) + Math.abs((fantasma.y + b.y) - pacman.y);
                return distA - distB;
            });
            
            // 20% de chance de agir aleatoriamente (evita o encurralamento inevitável)
            let escolha = Math.random() < 0.8 ? direcoesPossiveis[0] : direcoesPossiveis[Math.floor(Math.random() * direcoesPossiveis.length)];
            fantasma.dx = escolha.x;
            fantasma.dy = escolha.y;
        }

        fantasma.x += fantasma.dx;
        fantasma.y += fantasma.dy;

        // Detecção de Derrota (Colisão Pac-Man e Fantasma)
        if (pacman.x === fantasma.x && pacman.y === fantasma.y) {
            gameOver = true;
        }

        // Detecção de Vitória (Fim das Pastilhas)
        let sobrouPastilha = false;
        for (let l = 0; l < mapa.length; l++) {
            if (mapa[l].includes(0)) { sobrouPastilha = true; break; }
        }
        if (!sobrouPastilha) venceu = true;
    }

    function desenhar() {
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Alinhamento centralizado perfeito do mapa no Canvas
        let offsetX = (canvas.width - (mapa[0].length * tileSize)) / 2;
        let offsetY = (canvas.height - (mapa.length * tileSize)) / 2;

        // Renderizar Labirinto e Itens
        for (let l = 0; l < mapa.length; l++) {
            for (let c = 0; c < mapa[l].length; c++) {
                let posX = offsetX + c * tileSize;
                let posY = offsetY + l * tileSize;

                if (mapa[l][c] === 1) {
                    ctx.fillStyle = "#0000d6"; // Azul Clássico
                    ctx.fillRect(posX, posY, tileSize - 2, tileSize - 2);
                } else if (mapa[l][c] === 0) {
                    ctx.fillStyle = "#ffb8ae"; // Pastilhas de pontos
                    ctx.beginPath();
                    ctx.arc(posX + tileSize/2, posY + tileSize/2, 4, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }

        // Desenhar Pac-Man
        let pX = offsetX + pacman.x * tileSize + tileSize / 2;
        let pY = offsetY + pacman.y * tileSize + tileSize / 2;
        
        ctx.fillStyle = "#ffff00";
        ctx.beginPath();
        ctx.arc(pX, pY, tileSize / 2 - 1, pacman.direcaoRadianos + pacman.bocaAberta * Math.PI, pacman.direcaoRadianos + (2 - pacman.bocaAberta) * Math.PI);
        ctx.lineTo(pX, pY);
        ctx.closePath();
        ctx.fill();

        // Desenhar Fantasma
        let fX = offsetX + fantasma.x * tileSize;
        let fY = offsetY + fantasma.y * tileSize;
        ctx.fillStyle = fantasma.cor;
        ctx.beginPath();
        ctx.arc(fX + tileSize/2, fY + tileSize/2, tileSize/2 - 1, Math.PI, 0, false);
        ctx.lineTo(fX + tileSize - 1, fY + tileSize);
        ctx.lineTo(fX, fY + tileSize);
        ctx.closePath();
        ctx.fill();

        // Desenhar Olhos
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(fX + 5, fY + 6, 5, 6);
        ctx.fillRect(fX + 14, fY + 6, 5, 6);
        ctx.fillStyle = "#0000ff"; // Pupila dinâmica mirando direção
        ctx.fillRect(fX + 7 + (fantasma.dx * 2), fY + 8 + (fantasma.dy * 2), 3, 3);
        ctx.fillRect(fX + 16 + (fantasma.dx * 2), fY + 8 + (fantasma.dy * 2), 3, 3);

        // Pontuação Superior
        ctx.font = "20px 'Courier New'";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "left";
        ctx.fillText(`SCORE: ${score}`, 20, 35);

        // Finais de jogo (Encerra o loop e processa dados)
        if (gameOver || venceu) {
            clearInterval(pacmanInterval);

            // Sincroniza o Recorde uma única vez usando o padrão global do Arcade
            if (typeof window.ScoreArcade !== 'undefined') {
                window.ScoreArcade.atualizarPontuacao("pacman", score);
            }

            ctx.fillStyle = "rgba(0,0,0,0.8)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.font = "40px 'Courier New'";
            ctx.textAlign = "center";

            if (gameOver) {
                ctx.fillStyle = "#ff3333";
                ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
                if (!somGameOverTocado && typeof AudioArcade !== 'undefined') {
                    somGameOverTocado = true;
                    AudioArcade.playErro();
                }
            } else {
                ctx.fillStyle = "#00ff66";
                ctx.fillText("VOCÊ VENCEU O LABIRINTO!", canvas.width / 2, canvas.height / 2);
                if (!somGameOverTocado && typeof AudioArcade !== 'undefined') {
                    somGameOverTocado = true;
                    AudioArcade.playSucesso();
                }
            }
        }
    }

    if (pacmanInterval) clearInterval(pacmanInterval);
    // 140ms simula perfeitamente a latência tátil clássica de um hardware de arcade
    pacmanInterval = setInterval(() => { atualizar(); desenhar(); }, 140);

    // Função de limpeza exportada globalmente
    window.limparEventosPacman = () => {
        if (pacmanInterval) { clearInterval(pacmanInterval); pacmanInterval = null; }
        window.removeEventListener("keydown", mudarDirecaoTeclado);
        canvas.removeEventListener("touchstart", tratarTouchStart);
        canvas.removeEventListener("touchend", tratarTouchEnd);
    };
}