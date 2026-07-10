/* ==================================================
   ARCADE WEB SYSTEM
   ENGINE PRINCIPAL
   V0.1.6 (Suporte a Reinício Dinâmico)
================================================== */

// ================================================
// SISTEMA DE ÁUDIO RETRÔ (Web Audio API Nativa)
// ================================================
const AudioArcade = {
    ctx: null,

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    },

    playBip(frequencia = 440, duracao = 0.1, tipo = "square") {
        this.init();
        if (!this.ctx) return;

        const oscilador = this.ctx.createOscillator();
        const ganho = this.ctx.createGain();

        oscilador.type = tipo;
        oscilador.frequency.setValueAtTime(frequencia, this.ctx.currentTime);

        ganho.gain.setValueAtTime(0.15, this.ctx.currentTime);
        ganho.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duracao);

        oscilador.connect(ganho);
        ganho.connect(this.ctx.destination);

        oscilador.start();
        oscilador.stop(this.ctx.currentTime + duracao);
    },

    playSucesso() {
        this.playBip(523.25, 0.08, "square");
        setTimeout(() => this.playBip(659.25, 0.08, "square"), 80);
        setTimeout(() => this.playBip(783.99, 0.15, "square"), 160);
    },

    playErro() {
        this.playBip(293.66, 0.12, "sawtooth");
        setTimeout(() => this.playBip(220.00, 0.25, "sawtooth"), 100);
    }
};

// ================================================
// ELEMENTOS DA INTERFACE
// ================================================
const menu = document.getElementById("menu");
const gameScreen = document.getElementById("gameScreen");
const tituloJogo = document.getElementById("tituloJogo");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const btnRestart = document.getElementById("btnRestart");

// ================================================
// JOGO ATUAL
// ================================================
let jogoAtual = null;

// ================================================
// FUNÇÕES DE CONTROLE DO BOTÃO RESTART
// ================================================
window.mostrarBotaoRestart = function() {
    if (btnRestart) btnRestart.style.display = "inline-block";
};

window.esconderBotaoRestart = function() {
    if (btnRestart) btnRestart.style.display = "none";
};

// Executa a função de inicialização correspondente ao jogo ativo
function rodarScriptJogo(nome) {
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
    else if (nome === "invaders" && typeof iniciarInvaders === "function") {
        iniciarInvaders();
    }
    else if (nome === "flappy" && typeof iniciarFlappy === "function") {
        iniciarFlappy();
    }
    else if (nome === "velha" && typeof iniciarVelha === "function") {
        iniciarVelha();
    }
    else if (nome === "quiz" && typeof iniciarQuiz === "function") {
        iniciarQuiz();
    }
    else {
        exibirErroEngine("ERRO: ARQUIVO DO JOGO NÃO ENCONTRADO.");
    }
}

// ================================================
// ABRIR JOGO
// ================================================
function abrirJogo(nome){
    console.log("Abrindo jogo:", nome);
    AudioArcade.init();

    menu.style.display = "none";
    gameScreen.style.display = "block";

    tituloJogo.innerHTML = nome.toUpperCase();
    limparCanvas();
    jogoAtual = nome;
    
    window.esconderBotaoRestart();
    iniciarTelaJogo(nome);

    setTimeout(() => {
        rodarScriptJogo(nome);
    }, 1000); 
}

// ================================================
// PARAR LOOPS E EVENTOS DO JOGO ATUAL
// ================================================
function interromperJogoAtual() {
    if (jogoAtual === "pong" && typeof window.limparEventosPong === "function") {
        window.limparEventosPong();
        if (typeof pongInterval !== "undefined") clearInterval(pongInterval);
    } 
    else if (jogoAtual === "snake" && typeof window.limparEventosSnake === "function") {
        window.limparEventosSnake();
        if (typeof snakeInterval !== "undefined") clearInterval(snakeInterval);
    } 
    else if (jogoAtual === "memoria" && typeof window.limparEventosMemoria === "function") {
        window.limparEventosMemoria();
        if (typeof memoriaRenderInterval !== "undefined") clearInterval(memoriaRenderInterval);
    } 
    else if (jogoAtual === "tetris" && typeof window.limparEventosTetris === "function") {
        window.limparEventosTetris();
        if (typeof tetrisInterval !== "undefined") clearInterval(tetrisInterval);
    }
    else if (jogoAtual === "invaders" && typeof window.limparEventosInvaders === "function") {
        window.limparEventosInvaders();
        if (typeof invadersInterval !== "undefined") clearInterval(invadersInterval);
    }
    else if (jogoAtual === "flappy" && typeof window.limparEventosFlappy === "function") {
        window.limparEventosFlappy();
        if (typeof flappyInterval !== "undefined") clearInterval(flappyInterval);
    }
    else if (jogoAtual === "velha" && typeof window.limparEventosVelha === "function") {
        window.limparEventosVelha();
    }
    else if (jogoAtual === "quiz" && typeof window.limparEventosQuiz === "function") {
        window.limparEventosQuiz();
    }
}

// ================================================
// CONFIGURAÇÃO DOS BOTÕES SUPERIORES
// ================================================
const btnVoltar = document.getElementById("btnVoltar");
if(btnVoltar){
    btnVoltar.addEventListener("click", fecharJogo);
}

if(btnRestart) {
    btnRestart.addEventListener("click", () => {
        console.log("Reiniciando jogo:", jogoAtual);
        interromperJogoAtual();
        limparCanvas();
        window.esconderBotaoRestart();
        rodarScriptJogo(jogoAtual);
    });
}

function fecharJogo(){
    console.log("Fechando jogo atual...");
    interromperJogoAtual();
    window.esconderBotaoRestart();
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
    ctx.fillText(nome.toUpperCase() + ".EXE", canvas.width / 2, canvas.height / 2);

    ctx.font = "18px Courier New";
    ctx.fillText("CARREGANDO JOGO...", canvas.width / 2, canvas.height / 2 + 40);
}

function exibirErroEngine(mensagem) {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = "20px Courier New";
    ctx.fillStyle = "#ffaa00";
    ctx.textAlign = "center";
    ctx.fillText(mensagem, canvas.width / 2, canvas.height / 2);
}

function limparCanvas(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}