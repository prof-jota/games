/* ==================================================
   ARCADE WEB SYSTEM
   JOGO: JOGO DA VELHA
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

    canvas.addEventListener("click", gerirCliqueTabuleiro);

    function gerirCliqueTabuleiro(e) {
        if (!jogoAtivo || mensagemStatus.includes("PENSANDO")) return;

        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

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
                    setTimeout(jogadaIA, 600);
                }
            }
        }
    }

    function jogadaIA() {
        if (!jogoAtivo) return;

        // Procura quadrado vazio aleatório
        let vazios = [];
        tabuleiro.forEach((q, i) => { if (q === "") vazios.push(i); });

        if (vazios.length > 0) {
            const escolha = vazios[Math.floor(Math.random() * vazios.length)];
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

    function verificarVencedor(player) {
        const condicoes = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Horizontais
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Verticais
            [0, 4, 8], [2, 4, 6]             // Diagonais
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
            // Linhas verticais
            ctx.beginPath();
            ctx.moveTo(offsetX + i * tamanhoQuadrado, offsetY);
            ctx.lineTo(offsetX + i * tamanhoQuadrado, offsetY + tamanhoQuadrado * 3);
            ctx.stroke();

            // Linhas horizontais
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

    window.limparEventosVelha = () => {
        canvas.removeEventListener("click", gerirCliqueTabuleiro);
    };
}