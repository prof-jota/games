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
    let somGameOverTocado = false; // Evita repetição do áudio de derrota

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

        // EFEITO SONORO: Clique sutil e rápido ao mudar de direção[cite: 6]
        if (direcaoAlterada && typeof AudioArcade !== 'undefined') {
            AudioArcade.playBip(450, 0.02, 'sine'); //[cite: 6]
        }
    }

    function gerarComida() {
        comida.x = Math.floor(Math.random() * tileCountX); //[cite: 6]
        comida.y = Math.floor(Math.random() * tileCountY); //[cite: 6]

        // Garante que a comida não apareça em cima da cobra[cite: 6]
        snake.forEach(pedaco => {
            if (pedaco.x === comida.x && pedaco.y === comida.y) {
                gerarComida(); //[cite: 6]
            }
        });
    }

    function fimDeJogo() {
        clearInterval(snakeInterval); //[cite: 6]
        
        // EFEITO SONORO: Som de erro/derrota ao perder (com trava de segurança)[cite: 6]
        if (!somGameOverTocado && typeof AudioArcade !== 'undefined') {
            somGameOverTocado = true; //[cite: 6]
            AudioArcade.playErro(); //[cite: 6]
        }

        // Tela de Game Over estilizada[cite: 6]
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)"; //[cite: 6]
        ctx.fillRect(0, 0, canvas.width, canvas.height); //[cite: 6]
        
        ctx.font = "40px 'Courier New'"; //[cite: 6]
        ctx.fillStyle = "#ff3333"; //[cite: 6]
        ctx.textAlign = "center"; //[cite: 6]
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 20); //[cite: 6]
        
        ctx.font = "20px 'Courier New'"; //[cite: 6]
        ctx.fillStyle = "#fff"; //[cite: 6]
        ctx.fillText(`Pontuação Final: ${score}`, canvas.width / 2, canvas.height / 2 + 20); //[cite: 6]
    }

    // Loop Principal
    function atualizarJogo() {
        mudouDirecao = false; //[cite: 6]

        // 1. Mover a Cabeça da Cobra[cite: 6]
        const cabeca = { x: snake[0].x + dx, y: snake[0].y + dy }; //[cite: 6]
        
        // Colisão com as Paredes[cite: 6]
        if (cabeca.x < 0 || cabeca.x >= tileCountX || cabeca.y < 0 || cabeca.y >= tileCountY) {
            fimDeJogo(); //[cite: 6]
            return;
        }

        // Colisão com o próprio corpo[cite: 6]
        for (let i = 0; i < snake.length; i++) {
            if (snake[i].x === cabeca.x && snake[i].y === cabeca.y) {
                fimDeJogo(); //[cite: 6]
                return;
            }
        }

        // Adiciona a nova cabeça no início do array[cite: 6]
        snake.unshift(cabeca); //[cite: 6]

        // 2. Verificar se comeu a comida[cite: 6]
        if (cabeca.x === comida.x && cabeca.y === comida.y) {
            score += 10; //[cite: 6]

            // EFEITO SONORO: Som agradável e agudo de comer fruta (Ré agudo)[cite: 6]
            if (typeof AudioArcade !== 'undefined') {
                AudioArcade.playBip(587.33, 0.08, "triangle"); //[cite: 6]
            }

            gerarComida(); //[cite: 6]
        } else {
            // Se não comeu, remove o último pedaço (mantém o tamanho estável)[cite: 6]
            snake.pop(); //[cite: 6]
        }

        // 3. RENDERIZAÇÃO[cite: 6]
        ctx.clearRect(0, 0, canvas.width, canvas.height); //[cite: 6]

        // Fundo Verde Escuro Retrô[cite: 6]
        ctx.fillStyle = "#112211"; //[cite: 6]
        ctx.fillRect(0, 0, canvas.width, canvas.height); //[cite: 6]

        // Desenhar a Comida (Maçã Vermelha)[cite: 6]
        ctx.fillStyle = "#ff3333"; //[cite: 6]
        ctx.fillRect(comida.x * gridSize + 2, comida.y * gridSize + 2, gridSize - 4, gridSize - 4); //[cite: 6]

        // Desenhar a Cobra[cite: 6]
        snake.forEach((pedaco, index) => {
            // A cabeça tem uma cor levemente diferente do corpo[cite: 6]
            ctx.fillStyle = index === 0 ? "#00ff66" : "#00aa44"; //[cite: 6]
            ctx.fillRect(pedaco.x * gridSize + 1, pedaco.y * gridSize + 1, gridSize - 2, gridSize - 2); //[cite: 6]
        });

        // Desenhar Placar[cite: 6]
        ctx.font = "20px 'Courier New'"; //[cite: 6]
        ctx.fillStyle = "#ebf1ee"; //[cite: 6]
        ctx.textAlign = "left"; //[cite: 6]
        ctx.fillText(`SCORE: ${score}`, 20, 35); //[cite: 6]
    }

    // Cancela loops antigos antes de iniciar[cite: 6]
    if (snakeInterval) clearInterval(snakeInterval); //[cite: 6]
    
    // Inicia o loop (Aproximadamente 100ms por frame para dar velocidade de jogo retrô)[cite: 6]
    snakeInterval = setInterval(atualizarJogo, 100); //[cite: 6]

    // Função de limpeza global atualizada para remover os listeners de touch
    window.limparEventosSnake = () => {
        window.removeEventListener("keydown", mudarDirecaoTeclado); //[cite: 6]
        canvas.removeEventListener("touchstart", tratarTouchStart);
        canvas.removeEventListener("touchmove", tratarTouchMove);
        canvas.removeEventListener("touchend", tratarTouchEnd);
    };
}