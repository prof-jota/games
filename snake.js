/* ==================================================
   ARCADE WEB SYSTEM
   JOGO: SNAKE (COBRINHA - Versão com Suporte a Touch/Swipe)
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
    let gameOverEnviado = false; // Garante que o score e efeitos de fim rodem apenas uma vez

    // Variáveis para registrar o início e fim do toque na tela (Mobile)
    let touchStartX = 0;
    let touchStartY = 0;

    // --- ESCUTAR EVENTOS ---

    // Teclado (Desktop)
    window.addEventListener("keydown", mudarDirecaoTeclado);

    // Touchscreen (Celular)
    canvas.addEventListener("touchstart", tratarTouchStart, { passive: false });
    canvas.addEventListener("touchmove", tratarTouchMove, { passive: false });
    canvas.addEventListener("touchend", tratarTouchEnd, { passive: false });

    function mudarDirecaoTeclado(e) {
        if (mudouDirecao) return;

        const pressionouEsquerda = e.key === "ArrowLeft" || e.key === "a" || e.key === "A";
        const pressionouDireita = e.key === "ArrowRight" || e.key === "d" || e.key === "D";
        const pressionouCima = e.key === "ArrowUp" || e.key === "w" || e.key === "W";
        const pressionouBaixo = e.key === "ArrowDown" || e.key === "s" || e.key === "S";

        processarMudancaDirecao(pressionouEsquerda, pressionouDireita, pressionouCima, pressionouBaixo);
    }

    function tratarTouchStart(e) {
        e.preventDefault(); // Impede que o navegador arraste ou atualize a página no mobile
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }

    function tratarTouchMove(e) {
        e.preventDefault(); // Garante o bloqueio de scroll vertical do celular durante o jogo
    }

    function tratarTouchEnd(e) {
        e.preventDefault();
        if (mudouDirecao) return;

        // Calcula a distância do arrasto do dedo
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;

        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;

        // Limiar mínimo para considerar um movimento intencional (evita toques acidentais)
        const limiar = 30; 

        let pressEsquerda = false;
        let pressDireita = false;
        let pressCima = false;
        let pressBaixo = false;

        // Determina se o movimento predominante foi Horizontal ou Vertical
        if (Math.abs(diffX) > Math.abs(diffY)) {
            // Movimento Horizontal
            if (Math.abs(diffX) > limiar) {
                if (diffX > 0) pressDireita = true;
                else pressEsquerda = true;
            }
        } else {
            // Movimento Vertical
            if (Math.abs(diffY) > limiar) {
                if (diffY > 0) pressBaixo = true;
                else pressCima = true;
            }
        }

        processarMudancaDirecao(pressEsquerda, pressDireita, pressCima, pressBaixo);
    }

    function processarMudancaDirecao(esquerda, direita, cima, baixo) {
        let direcaoAlterada = false;

        // Impede a cobra de voltar na direção oposta instantaneamente
        if (esquerda && dx === 0) { dx = -1; dy = 0; mudouDirecao = true; direcaoAlterada = true; }
        if (direita && dx === 0) { dx = 1; dy = 0; mudouDirecao = true; direcaoAlterada = true; }
        if (cima && dy === 0) { dx = 0; dy = -1; mudouDirecao = true; direcaoAlterada = true; }
        if (baixo && dy === 0) { dx = 0; dy = 1; mudouDirecao = true; direcaoAlterada = true; }

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
        
        // Garante o envio do score final e efeitos sonoros apenas uma única vez
        if (!gameOverEnviado) {
            gameOverEnviado = true;

            if (typeof window.ScoreArcade !== 'undefined') {
                window.ScoreArcade.atualizarPontuacao("snake", score);
            }

            if (typeof AudioArcade !== 'undefined') {
                AudioArcade.playErro();
            }
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

        // 3. RENDERIZAÇÃO
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Fundo Verde Escuro Retrô
        ctx.fillStyle = "#112211";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Desenhar a Comida (Maçã Vermelha)
        ctx.fillStyle = "#ff3333";
        ctx.fillRect(comida.x * gridSize + 2, comida.y * gridSize + 2, gridSize - 4, gridSize - 4);

        // Desenhar a Cobra
        snake.forEach((pedaco, index) => {
            // A cabeça tem uma cor levemente diferente do corpo
            ctx.fillStyle = index === 0 ? "#00ff66" : "#00aa44";
            ctx.fillRect(pedaco.x * gridSize + 1, pedaco.y * gridSize + 1, gridSize - 2, gridSize - 2);
        });

        // Desenhar Placar
        ctx.font = "20px 'Courier New'";
        ctx.fillStyle = "#ebf1ee";
        ctx.textAlign = "left";
        ctx.fillText(`SCORE: ${score}`, 20, 35);
    }

    // Cancela loops antigos antes de iniciar
    if (snakeInterval) clearInterval(snakeInterval);
    
    // Inicia o loop (Aproximadamente 100ms por frame para dar velocidade de jogo retrô)
    snakeInterval = setInterval(atualizarJogo, 100);

    // Função de limpeza global atualizada para desvincular loops e eventos
    window.limparEventosSnake = () => {
        if (snakeInterval) { clearInterval(snakeInterval); snakeInterval = null; }
        window.removeEventListener("keydown", mudarDirecaoTeclado);
        canvas.removeEventListener("touchstart", tratarTouchStart);
        canvas.removeEventListener("touchmove", tratarTouchMove);
        canvas.removeEventListener("touchend", tratarTouchEnd);
    };
}