/* ==================================================
   ARCADE WEB SYSTEM - CORE ENGINE v1.0
================================================== */

let jogoAtivoAtual = null;

function abrirJogo(idJogo) {
    fecharJogoAnterior();
    jogoAtivoAtual = idJogo;

    // Alternância de Telas
    document.getElementById("menu").style.display = "none";
    document.getElementById("gameScreen").style.display = "flex";

    // Define Título amigável no cabeçalho do jogo
    const titulosFormatados = {
        "pong": "PONG",
        "quiz": "QUIZ",
        "snake": "SNAKE",
        "tetris": "TETRIS",
        "velha": "JOGO DA VELHA",
        "memoria": "JOGO DA MEMÓRIA",
        "flappy": "FLAPPY BIRD",
        "invaders": "SPACE INVADERS"
    };
    document.getElementById("tituloJogo").innerText = titulosFormatados[idJogo] || idJogo.toUpperCase();

    const canvas = document.getElementById("gameCanvas");
    if (canvas) {
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#112211";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = "24px 'Courier New'";
        ctx.fillStyle = "#00ff66";
        ctx.textAlign = "center";
        ctx.fillText("CARREGANDO NO ARCADE...", canvas.width / 2, canvas.height / 2);
    }

    setTimeout(() => {
        try {
            switch(idJogo) {
                case "pong": if (typeof iniciarPong === "function") iniciarPong(); break;
                case "quiz": if (typeof iniciarQuiz === "function") iniciarQuiz(); break;
                case "snake": if (typeof iniciarSnake === "function") iniciarSnake(); break;
                case "tetris": if (typeof iniciarTetris === "function") iniciarTetris(); break;
                case "velha": if (typeof iniciarVelha === "function") iniciarVelha(); break;
                case "memoria": if (typeof iniciarMemoria === "function") iniciarMemoria(); break;
                case "flappy": if (typeof iniciarFlappy === "function") iniciarFlappy(); break;
                case "invaders": if (typeof iniciarInvaders === "function") iniciarInvaders(); break;
            }
        } catch (erro) {
            console.error(`Erro ao inicializar [${idJogo}]:`, erro);
        }
    }, 300);
}

function fecharJogoAnterior() {
    // Para todos os loops/intervals possíveis de background dos 8 jogos
    if (typeof snakeInterval !== "undefined" && snakeInterval) { clearInterval(snakeInterval); snakeInterval = null; }
    if (typeof pongInterval !== "undefined" && pongInterval) { clearInterval(pongInterval); pongInterval = null; }
    if (typeof tetrisInterval !== "undefined" && tetrisInterval) { clearInterval(tetrisInterval); tetrisInterval = null; }
    if (typeof flappyInterval !== "undefined" && flappyInterval) { clearInterval(flappyInterval); flappyInterval = null; }
    if (typeof invadersInterval !== "undefined" && invadersInterval) { clearInterval(invadersInterval); invadersInterval = null; }
    
    // CORREÇÃO: Limpa o loop específico do Jogo da Memória para evitar o efeito "zumbi" na troca de jogos
    if (typeof memoriaRenderInterval !== "undefined" && memoriaRenderInterval) { clearInterval(memoriaRenderInterval); memoriaRenderInterval = null; }

    // Executa a limpeza fina de listeners (evita cliques cruzados e bugs de teclado)
    if (typeof window.limparEventosPong === "function") window.limparEventosPong();
    if (typeof window.limparEventosQuiz === "function") window.limparEventosQuiz();
    if (typeof window.limparEventosSnake === "function") window.limparEventosSnake();
    if (typeof window.limparEventosTetris === "function") window.limparEventosTetris();
    if (typeof window.limparEventosVelha === "function") window.limparEventosVelha();
    if (typeof window.limparEventosMemoria === "function") window.limparEventosMemoria();
    if (typeof window.limparEventosFlappy === "function") window.limparEventosFlappy();
    if (typeof window.limparEventosInvaders === "function") window.limparEventosInvaders();
    
    jogoAtivoAtual = null;
}

// Configuração do botão global de reiniciar jogo
document.addEventListener("DOMContentLoaded", () => {
    const btnRestart = document.getElementById("btnRestart");
    if (btnRestart) {
        btnRestart.addEventListener("click", () => {
            if (jogoAtivoAtual) {
                const jogoParaReiniciar = jogoAtivoAtual; 
                
                fecharJogoAnterior(); 
                jogoAtivoAtual = jogoParaReiniciar; 

                const canvas = document.getElementById("gameCanvas");
                if (canvas) {
                    const ctx = canvas.getContext("2d");
                    ctx.fillStyle = "rgba(17, 34, 17, 0.7)";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.font = "24px 'Courier New'";
                    ctx.fillStyle = "#00ffaa";
                    ctx.textAlign = "center";
                    ctx.fillText("REINICIANDO...", canvas.width / 2, canvas.height / 2);
                }

                setTimeout(() => {
                    switch(jogoParaReiniciar) {
                        case "pong": if (typeof iniciarPong === "function") iniciarPong(); break;
                        case "quiz": if (typeof iniciarQuiz === "function") iniciarQuiz(); break;
                        case "snake": if (typeof iniciarSnake === "function") iniciarSnake(); break;
                        case "tetris": if (typeof iniciarTetris === "function") iniciarTetris(); break;
                        case "velha": if (typeof iniciarVelha === "function") iniciarVelha(); break;
                        case "memoria": if (typeof iniciarMemoria === "function") iniciarMemoria(); break;
                        case "flappy": if (typeof iniciarFlappy === "function") iniciarFlappy(); break;
                        case "invaders": if (typeof iniciarInvaders === "function") iniciarInvaders(); break;
                    }
                }, 150);
            }
        });
    }
});