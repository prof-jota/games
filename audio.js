/* ==================================================
   ARCADE WEB SYSTEM - GERENCIADOR DE ÁUDIO GLOBAL
================================================== */

const AudioArcade = {
    ctx: null,

    // Inicializa ou recupera o contexto de áudio
    init() {
        if (!this.ctx) {
            // Cria o contexto de áudio respeitando os diferentes navegadores
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        // Se o contexto estiver suspenso (bloqueio do navegador), tenta reativá-lo
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    // Toca um efeito sonoro customizado (Bip estilo Retro)
    playBip(frequencia = 440, duracao = 0.1, tipo = 'sine') {
        try {
            this.init(); // Garante que o áudio está inicializado e destravado
            
            if (!this.ctx || this.ctx.state === 'suspended') return;

            const osc = this.ctx.createOscillator();
            const gainNode = this.ctx.createGain();

            osc.type = tipo; // 'sine', 'square', 'sawtooth', 'triangle'
            osc.frequency.setValueAtTime(frequencia, this.ctx.currentTime);

            // Suaviza o início e fim do som para não dar estalos horríveis no alto-falante
            gainNode.gain.setValueAtTime(0.15, this.ctx.currentTime); // Volume
            gainNode.gain.exponentialRampToValueAtTime(0.00001, this.ctx.currentTime + duracao);

            osc.connect(gainNode);
            gainNode.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + duracao);
        } catch (e) {
            console.warn("Falha ao reproduzir áudio:", e);
        }
    },

    // Som de vitória / acerto
    playSucesso() {
        this.playBip(523.25, 0.08, 'sine'); // Nota C5
        setTimeout(() => this.playBip(659.25, 0.08, 'sine'), 80); // Nota E5
        setTimeout(() => this.playBip(783.99, 0.15, 'sine'), 160); // Nota G5
    },

    // Som de derrota / erro / game over
    playErro() {
        this.playBip(196.00, 0.15, 'sawtooth'); // Nota G3 (som mais agressivo)
        setTimeout(() => this.playBip(146.83, 0.25, 'sawtooth'), 120); // Nota D3
    }
};

// --- GATILHO DE SEGURANÇA PARA O NAVEGADOR ---
// Assim que o usuário clicar em QUALQUER lugar da página (como ao escolher um jogo),
// nós forçamos o áudio a destravar imediatamente.
const destravarAudioGeral = () => {
    AudioArcade.init();
    // Remove os ouvintes para não gastar processamento à toa depois de destravado
    window.removeEventListener("click", destravarAudioGeral);
    window.removeEventListener("touchstart", destravarAudioGeral);
    window.removeEventListener("keydown", destravarAudioGeral);
};

window.addEventListener("click", destravarAudioGeral);
window.addEventListener("touchstart", destravarAudioGeral);
window.addEventListener("keydown", destravarAudioGeral);