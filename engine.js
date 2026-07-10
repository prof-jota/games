/* ==================================================
   ARCADE WEB SYSTEM
   ENGINE PRINCIPAL
   V0.1.4 (Integração do Sistema de Áudio Retro)
================================================== */

// ================================================
// SISTEMA DE ÁUDIO RETRÔ (Web Audio API Nativa)
// ================================================
const AudioArcade = {
    ctx: null,

    init() {
        if (!this.ctx) {
            // Inicializa o contexto de áudio na primeira interação do usuário
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    },

    playBip(frequencia = 440, duracao = 0.1, tipo = "square") {
        this.init();
        if (!this.ctx) return;

        // Cria os nós de oscilador e ganho (volume)
        const oscilador = this.ctx.createOscillator();
        const ganho = this.ctx.createGain();

        oscilador.type = tipo; // 'sine', 'square', 'sawtooth', 'triangle'
        oscilador.frequency.setValueAtTime(frequencia, this.ctx.currentTime);

        // Configura o volume com um leve fade-out para não dar estalo
        ganho.gain.setValueAtTime(0.15, this.ctx.currentTime); // Volume em 15%
        ganho.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duracao);

        // Conecta tudo aos alto-falantes
        oscilador.connect(ganho);
        ganho.connect(this.ctx.destination);

        // Toca e desliga
        oscilador.start();
        oscilador.stop(this.ctx.currentTime + duracao);
    },

    playSucesso() {
        // Um efeito clássico de subida rápida de notas (Arpejo)
        this.playBip(523.25, 0.08, "square"); // Nota Dó
        setTimeout(() => this.playBip(659.25, 0.08, "square"), 80); // Nota Mi
        setTimeout(() => this.playBip(783.99, 0.15, "square"), 160); // Nota Sol
    },

    playErro() {
        // Um som descendente e mais grave/áspero
        this.playBip(293.66, 0.12, "sawtooth"); // Nota Ré
        setTimeout(() => this.playBip(220.00, 0.25, "sawtooth"), 100); // Nota Lá
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

// ================================================
// JOGO ATUAL
// ================================================
let jogoAtual = null;

// ================================================
// ABRIR JOGO (Atualizado com todos os 4 jogos)
// ================================================
function abrirJogo(nome){
    console.log("Abrindo jogo:", nome);

    // Inicializa o áudio assim que o usuário clica para jogar algo
    AudioArcade.init();

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
            exibirErroEngine("ERRO: ARQUIVO DO JOGO NÃO ENCONTRADO.");
        }
    }, 1000); 
}

// ================================================
// BOTÃO VOLTAR / FECHAR JOGO
// ================================================
const btnVoltar = document.getElementById("btnVoltar");
if(btnVoltar){
    btnVoltar.addEventListener("click", fecharJogo);
}

function fecharJogo(){
    console.log("Fechando jogo atual...");

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

function limparCanvas(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}
