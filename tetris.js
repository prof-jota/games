/* ==================================================
   ARCADE WEB SYSTEM
   JOGO: TETRIS
================================================== */

let tetrisInterval = null;

function iniciarTetris() {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    const BLOCK_SIZE = 22;
    const COLS = 10;
    const ROWS = 20;

    let tabuleiro = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    let score = 0;
    let gameOver = false;

    // Cores dos blocos
    const CORES = [
        null,
        "#ff3333", // Z
        "#33ff33", // S
        "#3333ff", // J
        "#ffff33", // O
        "#ff33ff", // T
        33,        // I (ciano manipulado manualmente)
        "#ff9933"  // L
    ];

    // Formatos dos Tetraminos
    const PECAS = [
        [],
        [[1, 1, 0], [0, 1, 1], [0, 0, 0]], // Z
        [[0, 2, 2], [2, 2, 0], [0, 0, 0]], // S
        [[3, 0, 0], [3, 3, 3], [0, 0, 0]], // J
        [[4, 4], [4, 4]],                  // O
        [[0, 5, 0], [5, 5, 5], [0, 0, 0]], // T
        [[0, 0, 0, 0], [6, 6, 6, 6], [0, 0, 0, 0], [0, 0, 0, 0]], // I
        [[0, 0, 7], [7, 7, 7], [0, 0, 0]]  // L
    ];

    let pecaAtual = criarPeca();

    function criarPeca() {
        const id = Math.floor(Math.random() * 7) + 1;
        return {
            matrix: PECAS[id],
            x: Math.floor(COLS / 2) - 1,
            y: 0,
            id: id
        };
    }

    // Controles do Teclado
    window.addEventListener("keydown", controlarTetris);

    function controlarTetris(e) {
        if (gameOver) return;
        if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") mover(-1);
        if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") mover(1);
        if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") cair();
        if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") rotacionar();
    }

    function mover(dir) {
        pecaAtual.x += dir;
        if (verificarColisao()) pecaAtual.x -= dir;
    }

    function cair() {
        pecaAtual.y++;
        if (verificarColisao()) {
            pecaAtual.y--;
            fundirPeca();
            limparLinhas();
            pecaAtual = criarPeca();
            if (verificarColisao()) {
                gameOver = true;
            }
        }
    }

    function rotacionar() {
        const m = pecaAtual.matrix;
        const n = m.length;
        // Transpor e inverter linhas para rodar 90 graus
        let novaMatrix = Array.from({ length: n }, () => Array(n).fill(0));
        for (let r = 0; r < n; r++) {
            for (let c = 0; c < n; c++) {
                novaMatrix[c][n - 1 - r] = m[r][c];
            }
        }
        const antigaMatrix = pecaAtual.matrix;
        pecaAtual.matrix = novaMatrix;
        if (verificarColisao()) pecaAtual.matrix = antigaMatrix;
    }

    function verificarColisao() {
        const m = pecaAtual.matrix;
        for (let r = 0; r < m.length; r++) {
            for (let c = 0; c < m[r].length; c++) {
                if (m[r][c] !== 0) {
                    let nextX = pecaAtual.x + c;
                    let nextY = pecaAtual.y + r;
                    if (nextX < 0 || nextX >= COLS || nextY >= ROWS) return true;
                    if (nextY >= 0 && tabuleiro[nextY][nextX] !== 0) return true;
                }
            }
        }
        return false;
    }

    function fundirPeca() {
        pecaAtual.matrix.forEach((row, r) => {
            row.forEach((val, c) => {
                if (val !== 0) {
                    if (pecaAtual.y + r >= 0) {
                        tabuleiro[pecaAtual.y + r][pecaAtual.x + c] = pecaAtual.id;
                    }
                }
            });
        });
    }

    function limparLinhas() {
        let linhasEliminadas = 0;
        for (let r = ROWS - 1; r >= 0; r--) {
            if (tabuleiro[r].every(val => val !== 0)) {
                tabuleiro.splice(r, 1);
                tabuleiro.unshift(Array(COLS).fill(0));
                linhasEliminadas++;
                r++; // Reavalia a mesma linha que desceu
            }
        }
        if (linhasEliminadas > 0) {
            score += [0, 40, 100, 300, 1200][linhasEliminadas];
        }
    }

    // Desenhar Tela
    function desenhar() {
        ctx.fillStyle = "#111";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Centralizar área do Tetris (Grid vertical)
        const boardWidth = COLS * BLOCK_SIZE;
        const boardHeight = ROWS * BLOCK_SIZE;
        const offsetX = (canvas.width - boardWidth) / 2;
        const offsetY = (canvas.height - boardHeight) / 2;

        // Fundo do Grid Ativo
        ctx.fillStyle = "#000";
        ctx.fillRect(offsetX, offsetY, boardWidth, boardHeight);
        ctx.strokeStyle = "#333";
        ctx.strokeRect(offsetX, offsetY, boardWidth, boardHeight);

        // Desenhar Tabuleiro fixo
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (tabuleiro[r][c] !== 0) {
                    ctx.fillStyle = tabuleiro[r][c] === 6 ? "#33ffff" : CORES[tabuleiro[r][c]];
                    ctx.fillRect(offsetX + c * BLOCK_SIZE + 1, offsetY + r * BLOCK_SIZE + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
                }
            }
        }

        // Desenhar Peça Ativa caindo
        if (!gameOver) {
            pecaAtual.matrix.forEach((row, r) => {
                row.forEach((val, c) => {
                    if (val !== 0) {
                        ctx.fillStyle = pecaAtual.id === 6 ? "#33ffff" : CORES[pecaAtual.id];
                        ctx.fillRect(offsetX + (pecaAtual.x + c) * BLOCK_SIZE + 1, offsetY + (pecaAtual.y + r) * BLOCK_SIZE + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
                    }
                });
            });
        }

        // Interface Lateral
        ctx.font = "20px 'Courier New'";
        ctx.fillStyle = "#fff";
        ctx.textAlign = "left";
        ctx.fillText(`PONTOS: ${score}`, offsetX + boardWidth + 30, offsetY + 50);

        ctx.font = "14px 'Courier New'";
        ctx.fillStyle = "#888";
        ctx.fillText("CONTROLES:", offsetX - 150, offsetY + 50);
        ctx.fillText("← / → : Mover", offsetX - 150, offsetY + 80);
        ctx.fillText("↑ : Rotacionar", offsetX - 150, offsetY + 110);
        ctx.fillText("↓ : Cair rápido", offsetX - 150, offsetY + 140);

        if (gameOver) {
            clearInterval(tetrisInterval);
            ctx.fillStyle = "rgba(0,0,0,0.85)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.font = "40px 'Courier New'";
            ctx.fillStyle = "#ff3333";
            ctx.textAlign = "center";
            ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
        }
    }

    // Loop de queda (gravidade a cada 500ms)
    let dropCounter = 0;
    function updateLoop() {
        dropCounter += 33; // ~33ms por frame do render
        if (dropCounter >= 500) {
            cair();
            dropCounter = 0;
        }
        desenhar();
    }

    if (tetrisInterval) clearInterval(tetrisInterval);
    tetrisInterval = setInterval(updateLoop, 33);

    window.limparEventosTetris = () => {
        window.removeEventListener("keydown", controlarTetris);
    };
}