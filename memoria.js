/* ==================================================
   ARCADE WEB SYSTEM
   JOGO: MEMÓRIA (Versão com Suporte a Touch e Scores)
================================================== */

let memoriaRenderInterval = null;

function iniciarMemoria() {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    const emojis = ["🧠", "🕹️", "👾", "🚀", "💎", "👑", "🍀", "🍎"];
    // Duplica os emojis para formar os pares
    let itens = [...emojis, ...emojis];
    
    // Embaralhar (Fisher-Yates)
    for (let i = itens.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [itens[i], itens[j]] = [itens[j], itens[i]];
    }

    // Configurações do Grid (4x4)
    const colunas = 4;
    const linhas = 4;
    const cardWidth = 100;
    const cardHeight = 100;
    const gap = 20;

    // Centralizar o tabuleiro no Canvas (900x500)
    const totalWidth = colunas * cardWidth + (colunas - 1) * gap;
    const totalHeight = linhas * cardHeight + (linhas - 1) * gap;
    const startX = (canvas.width - totalWidth) / 2;
    const startY = (canvas.height - totalHeight) / 2;

    // Estrutura das cartas
    let cartas = [];
    let k = 0;
    for (let l = 0; l < linhas; l++) {
        for (let c = 0; c < colunas; c++) {
            cartas.push({
                id: k,
                emoji: itens[k],
                x: startX + c * (cardWidth + gap),
                y: startY + l * (cardHeight + gap),
                virada: false,
                revelada: false
            });
            k++;
        }
    }

    let selecionadas = [];
    let travado = false;
    let score = 0;
    let movimentos = 0;
    let somVitoriaTocado = false; // Evita que o som de vitória e o score fiquem repetindo no loop

    // --- ESCUTAR EVENTOS ---

    // Mouse (Desktop)
    canvas.addEventListener("mousedown", tratarCliqueMousedown);

    // Touchscreen (Celular)
    canvas.addEventListener("touchstart", tratarCliqueTouch, { passive: false });

    function tratarCliqueMousedown(e) {
        obterCoordenadasEProcessar(e.clientX, e.clientY);
    }

    function tratarCliqueTouch(e) {
        e.preventDefault(); // Impede o comportamento de scroll ou zoom da página ao jogar
        if (e.touches.length > 0) {
            obterCoordenadasEProcessar(e.touches[0].clientX, e.touches[0].clientY);
        }
    }

    function obterCoordenadasEProcessar(clientX, clientY) {
        if (travado) return;

        const rect = canvas.getBoundingClientRect();
        const escalaX = canvas.width / rect.width;
        const escalaY = canvas.height / rect.height;

        // Aplica a escala milimetricamente na posição do toque/clique baseada no canvas real
        const mouseX = (clientX - rect.left) * escalaX;
        const mouseY = (clientY - rect.top) * escalaY;

        processarInteracao(mouseX, mouseY);
    }

    function processarInteracao(mouseX, mouseY) {
        cartas.forEach(carta => {
            if (carta.revelada || carta.virada) return;

            // Verifica a colisão perfeita com o card
            if (mouseX >= carta.x && mouseX <= carta.x + cardWidth &&
                mouseY >= carta.y && mouseY <= carta.y + cardHeight) {
                
                if (typeof AudioArcade !== 'undefined') AudioArcade.playBip(350, 0.05, 'sine');

                carta.virada = true;
                selecionadas.push(carta);

                if (selecionadas.length === 2) {
                    movimentos++;
                    travado = true;

                    if (selecionadas[0].emoji === selecionadas[1].emoji) {
                        selecionadas[0].revelada = true;
                        selecionadas[1].revelada = true;
                        selecionadas = [];
                        travado = false;
                        score += 10;

                        if (typeof AudioArcade !== 'undefined') AudioArcade.playSucesso();

                        if (cartas.every(c => c.revelada)) {
                            score += 50;
                        }
                    } else {
                        if (typeof AudioArcade !== 'undefined') AudioArcade.playErro();

                        setTimeout(() => {
                            selecionadas[0].virada = false;
                            selecionadas[1].virada = false;
                            selecionadas = [];
                            travado = false;
                        }, 1000);
                    }
                }
            }
        });
    }

    // Loop de Renderização
    function render() {
        ctx.fillStyle = "#1e1e24";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Desenhar Cartas
        cartas.forEach(carta => {
            if (carta.revelada || carta.virada) {
                // Carta Virada para cima
                ctx.fillStyle = "#fff";
                ctx.fillRect(carta.x, carta.y, cardWidth, cardHeight);
                ctx.strokeStyle = "#00ff66";
                ctx.lineWidth = 3;
                ctx.strokeRect(carta.x, carta.y, cardWidth, cardHeight);

                // Desenhar Emoji
                ctx.font = "40px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(carta.emoji, carta.x + cardWidth / 2, carta.y + cardHeight / 2);
            } else {
                // Carta Virada para baixo (Retro Tech Style)
                ctx.fillStyle = "#333344";
                ctx.fillRect(carta.x, carta.y, cardWidth, cardHeight);
                ctx.strokeStyle = "#555577";
                ctx.lineWidth = 2;
                ctx.strokeRect(carta.x, carta.y, cardWidth, cardHeight);

                ctx.font = "30px Courier New";
                ctx.fillStyle = "#555577";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText("?", carta.x + cardWidth / 2, carta.y + cardHeight / 2);
            }
        });

        // Interface Textual
        ctx.font = "20px 'Courier New'";
        ctx.fillStyle = "#ebf1ee";
        ctx.textAlign = "left";
        ctx.fillText(`SCORE: ${score}`, 30, 40);
        ctx.fillText(`MOVIMENTOS: ${movimentos}`, 30, 70);

        if (cartas.every(c => c.revelada)) {
            ctx.fillStyle = "rgba(0,0,0,0.7)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.font = "40px 'Courier New'";
            ctx.fillStyle = "#00ff66";
            ctx.textAlign = "center";
            ctx.fillText("VOCÊ VENCEU!", canvas.width / 2, canvas.height / 2);

            // Executa apenas uma vez no momento exato da vitória
            if (!somVitoriaTocado) {
                somVitoriaTocado = true;
                
                // Fanfarra de vitória
                if (typeof AudioArcade !== 'undefined') {
                    AudioArcade.playBip(523.25, 0.1, "triangle"); // Dó
                    setTimeout(() => AudioArcade.playBip(659.25, 0.1, "triangle"), 100); // Mi
                    setTimeout(() => AudioArcade.playBip(783.99, 0.1, "triangle"), 200); // Sol
                    setTimeout(() => AudioArcade.playBip(1046.50, 0.4, "triangle"), 300); // Dó oitava acima
                }

                // Sincroniza e salva o score no banco local/ranking
                if (typeof window.ScoreArcade !== 'undefined') {
                    window.ScoreArcade.atualizarPontuacao("memoria", score);
                }
            }
        }
    }

    if (memoriaRenderInterval) clearInterval(memoriaRenderInterval);
    memoriaRenderInterval = setInterval(render, 1000 / 30);

    // Salva uma função de limpeza global corrigida
    window.limparEventosMemoria = () => {
        if (memoriaRenderInterval) clearInterval(memoriaRenderInterval);
        canvas.removeEventListener("mousedown", tratarCliqueMousedown);
        canvas.removeEventListener("touchstart", tratarCliqueTouch);
    };
}