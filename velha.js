/* ==================================================
   ARCADE WEB SYSTEM
   JOGO: JOGO DA VELHA (IA Inteligente + Suporte Touch)
================================================== */

function iniciarVelha() {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    let tabuleiro = ["", "", "", "", "", "", "", "", ""];
    let jogoAtivo = true;
    let mensagemStatus = "SEU TURNO (X)";

    const tamanhoQuadrado = 120;
    const offsetX = (canvas.width - tamanhoQuadrado * 3) / 2;
    const offsetY = (canvas.height - tamanhoQuadrado * 3) / 2;

    renderizar();

    // Eventos para Desktop (Click) e Mobile (Touch)
    canvas.addEventListener("click", gerirCliqueTabuleiro);
    canvas.addEventListener("touchstart", gerirTouchTabuleiro, { passive: false });

    function gerirTouchTabuleiro(e) {
        e.preventDefault(); // Evita duplo clique de zoom no mobile
        if (e.touches.length > 0) {
            processarCliqueOuToque(e.touches[0].clientX, e.touches[0].clientY);
        }
    }

    function gerirCliqueTabuleiro(e) {
        processarCliqueOuToque(e.clientX, e.clientY);
    }

    function processarCliqueOuToque(clientX, clientY) {
        if (!jogoAtivo || mensagemStatus.includes("PENSANDO")) return;

        const rect = canvas.getBoundingClientRect();
        
        // Correção de escala caso o canvas esteja redimensionado na tela (essencial para mobile)
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
                    if (typeof AudioArcade !== 'undefined') AudioArcade.playBip(400, 0.08, 'sine');
                    
                    if (verificarVencedor("X")) {
                        finalizarJogo("VOCÊ VENCEU!");
                        return;
                    }

                    if (tabuleiro.every(q => q !== "")) {
                        finalizarJogo("EMPATE!");
                        return;
                    }

                    // Turno da IA
                    mensagemStatus = "IA PENSANDO...";
                    renderizar();
                    setTimeout(jogadaIA, 500);
                }
            }
        }
    }

    // --- MOTOR DE INTELIGÊNCIA ARTIFICIAL (IA) ---
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
            // Prioridade 1: Centro (posição mais forte)
            if (tabuleiro[4] === "") {
                escolha = 4;
            } 
            // Prioridade 2: Cantos estratégicos
            else {
                const cantos = [0, 2, 6, 8].filter(i => tabuleiro[i] === "");
                if (cantos.length > 0) {
                    escolha = cantos[Math.floor(Math.random() * cantos.length)];
                }
            }
        }

        // 4. Se ainda assim não decidiu, pega qualquer espaço restante por segurança
        if (escolha === -1) {
            let vazios = [];
            tabuleiro.forEach((q, i) => { if (q === "") vazios.push(i); });
            if (vazios.length > 0) {
                escolha = vazios[Math.floor(Math.random() * vazios.length)];
            }
        }

        // Executa a jogada da IA
        if (escolha !== -1) {
            tabuleiro[escolha] = "O";
            if (typeof AudioArcade !== 'undefined') AudioArcade.playBip(300, 0.08, 'triangle');

            if (verificarVencedor("O")) {
                finalizarJogo("A IA VENCEU!");
                return;
            }

            if (tabuleiro.every(q => q !== "")) {
                finalizarJogo("EMPATE!");
                return;
            }

            mensagemStatus = "SEU TURNO (X)";
        }
        renderizar();
    }

    // Função auxiliar que detecta se há uma combinação prestes a fechar (com 2 preenchidos e 1 vazio)
    function encontrarMelhorEspaco(player) {
        const condicoes = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Horizontais
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Verticais
            [0, 4, 8], [2, 4, 6]             // Diagonais
        ];

        for (let comb of condicoes) {
            const marcados = comb.filter(i => tabuleiro[i] === player);
            const vazios = comb.filter(i => tabuleiro[i] === "");

            // Se tem 2 do mesmo jogador e o 3º está livre, essa é a jogada crítica!
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

    function finalizarJogo(resultado) {
        jogoAtivo = false;
        mensagemStatus = resultado;
        renderizar();

        if (resultado === "VOCÊ VENCEU!") {
            if (typeof AudioArcade !== 'undefined') AudioArcade.playSucesso();
        } else {
            if (typeof AudioArcade !== 'undefined') AudioArcade.playErro();
        }
    }

    function renderizar() {
        ctx.fillStyle = "#151520";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Desenhar Grelha
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

        // Desenhar Simbolos X e O
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

        // Banner Superior de Estado
        ctx.font = "24px 'Courier New'";
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.fillText(mensagemStatus, canvas.width / 2, offsetY - 40);
    }

    // Limpeza completa dos eventos (incluindo touch)
    window.limparEventosVelha = () => {
        canvas.removeEventListener("click", gerirCliqueTabuleiro);
        canvas.removeEventListener("touchstart", gerirTouchTabuleiro);
    };
}