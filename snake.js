/* ==================================================
   ARCADE WEB SYSTEM
   JOGO: SNAKE (COBRINHA)
================================================== */

let snakeInterval = null; // Guarda o loop do jogo para podermos parar depois

function iniciarSnake() {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    // Configurações do Grid (Tamanho do Canvas: 900x500)
    const gridSize = 20; 
    const tileCountX = canvas.width / gridSize;  // 45 colunas
    const tileCountY = canvas.height / gridSize; // 25 linhas

    // Estado do Jogo
    let snake = [
        { x: 10, y: 12 },
        { x: 9, y: 12 },
        { x: 8, y: 12 }
    ];
    
    let comida = { x: 30, y: 12 };
    
    // Velocidade inicial (movendo para a direita)
    let dx = 1;
    let dy = 0;
    
    let score = 0;
    let mudouDirecao = false; // Evita bugs de duplo clique rápido mudar direção para dentro de si mesma

    // Escutar Teclado
    window.addEventListener("keydown", mudarDirecaoTeclado);

    function mudarDirecaoTeclado(e) {
        if (mudouDirecao) return;

        const pressionouEsquerda = e.key === "ArrowLeft" || e.key === "a" || e.key === "A";
        const pressionouDireita = e.key === "ArrowRight" || e.key === "d" || e.key === "D";
        const pressionouCima = e.key === "ArrowUp" || e.key === "w" || e.key === "W";
        const pressionouBaixo = e.key === "ArrowDown" || e.key === "s" || e.key === "S";

        let direcaoAlterada = false;

        // Impede a cobra de voltar na direção oposta instantaneamente
        if (pressionouEsquerda && dx === 0) { dx = -1; dy = 0; mudouDirecao = true; direcaoAlterada = true; }
        if (pressionouDireita && dx === 0) { dx = 1; dy = 0; mudouDirecao = true; direcaoAlterada = true; }
        if (pressionouCima && dy === 0) { dx = 0; dy = -1; mudouDirecao = true; direcaoAlterada = true; }
        if (pressionouBaixo && dy === 0) { dx = 0; dy = 1; mudouDirecao = true; direcaoAlterada = true; }

        // EFEITO SONORO: Clique sutil e rápido ao mudar de direção
        if (direcaoAlterada && typeof AudioArcade !== 'undefined') {
            AudioArcade.playBip(450, 0.02, 'sine');
        }
    }

    function gerarComida() {
        comida.x = Math.floor(Math.random() * tileCountX);
        comida.y = Math.floor(Math.random() * tileCountY);

        // Garante que a comida não apareça em cima da cobra
        snake.forEach(pedaco => {
            if (pedaco.x === comida.x && pedaco.y === comida.y) {
                gerarComida();
            }
        });
    }

    function fimDeJogo() {
        clearInterval(snakeInterval);
        
        // EFEITO SONORO: Som de erro/derrota ao perder
        if (typeof AudioArcade !== 'undefined') {
            AudioArcade.playErro();
        }

        // Tela de Game Over estilizada
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = "40px 'Courier New'";
        ctx.fillStyle = "#ff3333";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 20);
        
        ctx.font = "20px 'Courier New'";
        ctx.fillStyle = "#fff";
        ctx.fillText(`Pontuação Final: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
    }

    // Loop Principal
    function atualizarJogo() {
        mudouDirecao = false;

        // 1. Mover a Cabeça da Cobra
        const cabeca = { x: snake[0].x + dx, y: snake[0].y + dy };
        
        // Colisão com as Paredes
        if (cabeca.x < 0 || cabeca.x >= tileCountX || cabeca.y < 0 || cabeca.y >= tileCountY) {
            fimDeJogo();
            return;
        }

        // Colisão com o próprio corpo
        for (let i = 0; i < snake.length; i++) {
            if (snake[i].x === cabeca.x && snake[i].y === cabeca.y) {
                fimDeJogo();
                return;
            }
        }

        // Adiciona a nova cabeça no início do array
        snake.unshift(cabeca);

        // 2. Verificar se comeu a comida
        if (cabeca.x === comida.x && cabeca.y === comida.y) {
            score += 10;

            // EFEITO SONORO: Som agradável e agudo de comer fruta (Ré agudo)
            if (typeof AudioArcade !== 'undefined') {
                AudioArcade.playBip(587.33, 0.08, "triangle");
            }

            gerarComida();
        } else {
            // Se não comeu, remove o último pedaço (mantém o tamanho estável)
            snake.pop();
        }
