/* ==================================================
   ARCADE WEB SYSTEM
   ENGINE PRINCIPAL
   V0.1.3 (Correção do Loop de Loading)
================================================== */

// ================================================
// ELEMENTOS DA INTERFACE
// ================================================
const menu = document.getElementById("menu");
const gameScreen = document.getElementById("gameScreen");
const tituloJogo = document.getElementById("tituloJogo");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ================================================
// JOGO ATUAL
// ================================================
let jogoAtual = null;

// ================================================
// ABRIR JOGO (Atualizado com todos os 4 jogos)
// ================================================
function abrirJogo(nome){
    console.log("Abrindo jogo:", nome);

    menu.style.display = "none";
    gameScreen.style.display = "block";

    tituloJogo.innerHTML = nome.toUpperCase();
    limparCanvas();
    jogoAtual = nome;

    iniciarTelaJogo(nome);

    setTimeout(() => {
        if (nome === "pong" && typeof iniciarPong === "function") {
            iniciarPong();
        } 
        else if (nome === "snake" && typeof iniciarSnake === "function") {
            iniciarSnake();
        } 
        else if (nome === "memoria" && typeof iniciarMemoria === "function") {
            iniciarMemoria();
        } 
        else if (nome === "tetris" && typeof iniciarTetris === "function") {
            iniciarTetris();
        } 
        else {
            exibirErroEngine("EM DESENVOLVIMENTO...");
        }
    }, 1000);
}

// ================================================
// FECHAR JOGO (Atualizado com todas as limpezas)
// ================================================
function fecharJogo(){
    console.log("Voltando ao menu");

    if (jogoAtual === "pong") {
        if (typeof pongInterval !== 'undefined' && pongInterval !== null) clearInterval(pongInterval);
        if (typeof window.limparEventosPong === 'function') window.limparEventosPong();
    } 
    else if (jogoAtual === "snake") {
        if (typeof snakeInterval !== 'undefined' && snakeInterval !== null) clearInterval(snakeInterval);
        if (typeof window.limparEventosSnake === 'function') window.limparEventosSnake();
    }
    else if (jogoAtual === "memoria") {
        if (typeof memoriaRenderInterval !== 'undefined' && memoriaRenderInterval !== null) clearInterval(memoriaRenderInterval);
        if (typeof window.limparEventosMemoria === 'function') window.limparEventosMemoria();
    }
    else if (jogoAtual === "tetris") {
        if (typeof tetrisInterval !== 'undefined' && tetrisInterval !== null) clearInterval(tetrisInterval);
        if (typeof window.limparEventosTetris === 'function') window.limparEventosTetris();
    }

    limparCanvas();
    gameScreen.style.display = "none";
    menu.style.display = "block";
    jogoAtual = null;
}
// ================================================
// TELA DE LOADING/JOGO
// ================================================
function iniciarTelaJogo(nome){
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = "30px Courier New";
    ctx.fillStyle = "#00ff66";
    ctx.textAlign = "center";
    ctx.fillText(
        nome.toUpperCase() + ".EXE",
        canvas.width / 2,
        canvas.height / 2
    );

    ctx.font = "18px Courier New";
    ctx.fillText(
        "CARREGANDO JOGO...",
        canvas.width / 2,
        canvas.height / 2 + 40
    );
}

// Helper para mostrar mensagens de erro ou aviso dentro do canvas
function exibirErroEngine(mensagem) {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.font = "20px Courier New";
    ctx.fillStyle = "#ffaa00";
    ctx.textAlign = "center";
    ctx.fillText(mensagem, canvas.width / 2, canvas.height / 2);
}

// ================================================
// LIMPAR CANVAS
// ================================================
function limparCanvas(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Configura o botão voltar da interface caso ele ainda não tenha sido mapeado aqui
document.getElementById("btnVoltar").addEventListener("click", fecharJogo);