/* ==================================================
   ARCADE WEB SYSTEM
   JOGO: MEMÓRIA (Campanha Progressiva por Fases com Suporte a Touch/Scores)
================================================== */

let memoriaRenderInterval = null;

function iniciarMemoria() {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    // Pool expandido de emojis para suportar grids maiores
    const todosEmojis = ["🧠", "🕹️", "👾", "🚀", "💎", "👑", "🍀", "🍎", "🛸", "🌟", "🔥", "👻"];
    
    // Controle de Progressão da Campanha
    let faseAtual = 1;
    const maxFases = 4;
    
    // Variáveis de estado mantidas globais à partida
    let score = 0; 
    let movimentos = 0;
    let fimDeJogoEnviado = false;
    let emTransicao = false;
    let gameOverTempo = false;

    // Configurações dinâmicas por fase
    let colunas = 4;
    let linhas = 4;
    let cartas = [];
    let selecionadas = [];
    let travado = false;
    let tempoLimite = 0; // 0 significa sem limite de tempo
    let tempoRestante = 0;
    let ultimoTempoContado = Date.now();
    let tempoEsperaErro = 1000; // Tempo que a carta fica virada ao errar

    const cardWidth = 100;
    const cardHeight = 100;
    const gap = 15; // Reduzido levemente para caber confortavelmente 6 colunas no canvas de 900x500

    // Função interna para gerar o tabuleiro com base na dificuldade da fase
    function gerarTabuleiro() {
        selecionadas = [];
        travado = false;
        
        // Regras de Dificuldade por Fase
        if (faseAtual === 1) {
            colunas = 4; linhas = 4;
            tempoLimite = 0;
            tempoEsperaErro = 1000;
        } else if (faseAtual === 2) {
            colunas = 4; linhas = 4;
            tempoLimite = 0;
            tempoEsperaErro = 550; // Cartas fecham muito mais rápido se errar
        } else if (faseAtual === 3) {
            colunas = 6; linhas = 4; // Grid Expandido (24 cartas)
            tempoLimite = 0;
            tempoEsperaErro = 1000;
        } else if (faseAtual === 4) {
            colunas = 6; linhas = 4;
            tempoLimite = 60; // 60 segundos para vencer a fase final
            tempoRestante = tempoLimite;
            ultimoTempoContado = Date.now();
            tempoEsperaErro = 800;
        }

        const qtdPares = (colunas * linhas) / 2;
        const emojisFase = todosEmojis.slice(0, qtdPares);
        let itens = [...emojisFase, ...emojisFase];

        // Embaralhar Fisher-Yates
        for (let i = itens.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [itens[i], itens[j]] = [itens[j], itens[i]];
        }

        // Centralizar o tabuleiro no Canvas de forma dinâmica
        const totalWidth = colunas * cardWidth + (colunas - 1) * gap;
        const totalHeight = linhas * cardHeight + (linhas - 1) * gap;
        const startX = (canvas.width - totalWidth) / 2;
        const startY = (canvas.height - totalHeight) / 2 + 20; // Espaço extra no topo para a UI

        cartas = [];
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
    }

    function irParaProximaFase() {
        emTransicao = true;
        
        // Toca fanfarra de conclusão de fase
        if (typeof AudioArcade !== 'undefined') {
            AudioArcade.playBip(523.25, 0.1, "triangle");
            setTimeout(() => AudioArcade.playBip(659.25, 0.1, "triangle"), 100);
            setTimeout(() => AudioArcade.playBip(783.99, 0.2, "triangle"), 200);
        }

        setTimeout(() => {
            faseAtual++;
            gerarTabuleiro();
            emTransicao = false;
        }, 3000); // 3 segundos na tela de transição
    }

    // --- ESCUTAR EVENTOS ---
    canvas.addEventListener("mousedown", tratarCliqueMousedown);
    canvas.addEventListener("touchstart", tratarCliqueTouch, { passive: false });

    function tratarCliqueMousedown(e) {
        obterCoordenadasEProcessar(e.clientX, e.clientY);
    }

    function tratarCliqueTouch(e) {
        e.preventDefault();
        if (e.touches.length > 0) {
            obterCoordenadasEProcessar(e.touches[0].clientX, e.touches[0].clientY);
        }
    }

    function obterCoordenadasEProcessar(clientX, clientY) {
        if (travado || emTransicao || gameOverTempo || cartas.every(c => c.revelada && faseAtual === maxFases)) return;

        const rect = canvas.getBoundingClientRect();
        const escalaX = canvas.width / rect.width;
        const escalaY = canvas.height / rect.height;

        const mouseX = (clientX - rect.left) * escalaX;
        const mouseY = (clientY - rect.top) * escalaY;

        processarInteracao(mouseX, mouseY);
    }

    function processarInteracao(mouseX, mouseY) {
        cartas.forEach(carta => {
            if (carta.revelada || carta.virada) return;

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
                        score += 10; // Adiciona pontuação linear pura

                        if (typeof AudioArcade !== 'undefined') AudioArcade.playSucesso();

                        // Verifica se limpou o tabuleiro atual
                        if (cartas.every(c => c.revelada)) {
                            score += 50; // Bônus original por fechar o tabuleiro
                            
                            if (faseAtual < maxFases) {
                                irParaProximaFase();
                            }
                        }
                    } else {
                        if (typeof AudioArcade !== 'undefined') AudioArcade.playErro();

                        setTimeout(() => {
                            selecionadas[0].virada = false;
                            selecionadas[1].virada = false;
                            selecionadas = [];
                            travado = false;
                        }, tempoEsperaErro);
                    }
                }
            }
        });
    }

    // Loop de Renderização e Lógica Temporal
    function render() {
        // Atualização do Cronômetro da Fase Final
        if (tempoLimite > 0 && !emTransicao && !gameOverTempo && !cartas.every(c => c.revelada)) {
            let agora = Date.now();
            let delta = (agora - ultimoTempoContado) / 1000;
            ultimoTempoContado = agora;
            tempoRestante -= delta;
            
            if (tempoRestante <= 0) {
                tempoRestante = 0;
                gameOverTempo = true;
            }
        } else {
            ultimoTempoContado = Date.now(); // Reseta a referência nas telas estáticas
        }

        // Fundo Retro Dark
        ctx.fillStyle = "#1e1e24";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (emTransicao) {
            renderizarTransicao();
            return;
        }

        // Desenhar as Cartas no Grid Atual
        cartas.forEach(carta => {
            if (carta.revelada || carta.virada) {
                ctx.fillStyle = "#fff";
                ctx.fillRect(carta.x, carta.y, cardWidth, cardHeight);
                ctx.strokeStyle = "#00ff66";
                ctx.lineWidth = 3;
                ctx.strokeRect(carta.x, carta.y, cardWidth, cardHeight);

                ctx.font = "40px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(carta.emoji, carta.x + cardWidth / 2, carta.y + cardHeight / 2);
            } else {
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

        // HUD - Interface Superior
        ctx.font = "20px 'Courier New'";
        ctx.fillStyle = "#ebf1ee";
        ctx.textBaseline = "top";
        
        ctx.textAlign = "left";
        ctx.fillText(`SCORE: ${score}`, 30, 25);
        ctx.fillText(`MOVIMENTOS: ${movimentos}`, 30, 55);

        ctx.textAlign = "right";
        ctx.fillStyle = "#ffcc00";
        ctx.fillText(`FASE ${faseAtual}/${maxFases}`, canvas.width - 30, 25);

        // Exibe o tempo restante se a fase possuir cronômetro
        if (tempoLimite > 0) {
            ctx.fillStyle = tempoRestante < 15 ? "#ff3333" : "#00ff66";
            ctx.fillText(`TEMPO: ${Math.ceil(tempoRestante)}s`, canvas.width - 30, 55);
        }

        // Condições Finais da Partida (Vitória Total ou Derrota por Tempo)
        let venceuCampanha = cartas.every(c => c.revelada) && faseAtual === maxFases;
        
        if (venceuCampanha || gameOverTempo) {
            ctx.fillStyle = "rgba(0,0,0,0.85)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.font = "40px 'Courier New'";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            if (!fimDeJogoEnviado) {
                fimDeJogoEnviado = true;

                // Transmissão nativa e protetiva da estrutura de pontuação
                if (typeof window.ScoreArcade !== 'undefined') {
                    window.ScoreArcade.atualizarPontuacao("memoria", score);
                }

                if (typeof AudioArcade !== 'undefined') {
                    if (venceuCampanha) {
                        AudioArcade.playBip(523.25, 0.1, "triangle");
                        setTimeout(() => AudioArcade.playBip(659.25, 0.1, "triangle"), 100);
                        setTimeout(() => AudioArcade.playBip(783.99, 0.1, "triangle"), 200);
                        setTimeout(() => AudioArcade.playBip(1046.50, 0.4, "triangle"), 300);
                    } else {
                        AudioArcade.playErro();
                    }
                }
            }

            if (venceuCampanha) {
                ctx.fillStyle = "#00ff66";
                ctx.fillText("CAMPANHA CONCLUÍDA!", canvas.width / 2, canvas.height / 2 - 20);
                ctx.font = "22px 'Courier New'";
                ctx.fillStyle = "#fff";
                ctx.fillText(`Você dominou a Fase Final com ${movimentos} movimentos!`, canvas.width / 2, canvas.height / 2 + 30);
                ctx.fillText(`Score Final Gravado: ${score}`, canvas.width / 2, canvas.height / 2 + 65);
            } else {
                ctx.fillStyle = "#ff3333";
                ctx.fillText("O TEMPO ACABOU!", canvas.width / 2, canvas.height / 2 - 20);
                ctx.font = "22px 'Courier New'";
                ctx.fillStyle = "#fff";
                ctx.fillText(`Fim de jogo na Fase ${faseAtual}.`, canvas.width / 2, canvas.height / 2 + 30);
                ctx.fillText(`Score Final Gravado: ${score}`, canvas.width / 2, canvas.height / 2 + 65);
            }
        }
    }

    function renderizarTransicao() {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        ctx.font = "35px 'Courier New'";
        ctx.fillStyle = "#00ff66";
        ctx.fillText(`TABULEIRO ${faseAtual} LIMPO!`, canvas.width / 2, canvas.height / 2 - 30);

        ctx.font = "20px 'Courier New'";
        ctx.fillStyle = "#fff";
        ctx.fillText(`Prepare-se para a FASE ${faseAtual + 1}`, canvas.width / 2, canvas.height / 2 + 20);
        
        ctx.fillStyle = "#ffcc00";
        if (faseAtual === 1) {
            ctx.fillText("As cartas erradas vão fechar muito mais rápido!", canvas.width / 2, canvas.height / 2 + 55);
        } else if (faseAtual === 2) {
            ctx.fillText("O tabuleiro vai crescer! Mais cartas adicionadas.", canvas.width / 2, canvas.height / 2 + 55);
        } else if (faseAtual === 3) {
            ctx.fillText("Atenção! Cronômetro de tempo limite ativado!", canvas.width / 2, canvas.height / 2 + 55);
        }
    }

    // Inicializa o primeiro tabuleiro
    gerarTabuleiro();

    if (memoriaRenderInterval) clearInterval(memoriaRenderInterval);
    memoriaRenderInterval = setInterval(render, 1000 / 30);

    // Função robusta de limpeza contra memory leaks
    window.limparEventosMemoria = () => {
        if (memoriaRenderInterval) {
            clearInterval(memoriaRenderInterval);
            memoriaRenderInterval = null;
        }
        canvas.removeEventListener("mousedown", tratarCliqueMousedown);
        canvas.removeEventListener("touchstart", tratarCliqueTouch);
    };
}
