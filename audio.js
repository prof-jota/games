/* ==================================================
   SISTEMA DE SOM RETRÔ (WEB AUDIO API)
================================================== */
const AudioArcade = {
    ctx: null,

    init() {
        // Inicializa o contexto de áudio apenas na primeira interatividade
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    },

    playBip(frequencia = 300, duracao = 0.1, tipo = "square") {
        this.init();
        if (!this.ctx) return;

        // Cria os nós de oscilação e volume
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc.type = tipo; // 'square' (8-bit), 'sawtooth', 'triangle', ou 'sine'
        osc.frequency.setValueAtTime(frequencia, this.ctx.currentTime);

        // Suaviza o volume para não dar estalos no autofalante
        gainNode.gain.setValueAtTime(0.1, this.ctx.currentTime); // Volume em 10%
        gainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duracao);

        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duracao);
    },

    playSucesso() {
        // Som de acerto (dois bips ascendentes rápidos)
        this.playBip(400, 0.08, "triangle");
        setTimeout(() => this.playBip(600, 0.15, "triangle"), 80);
    },

    playErro() {
        // Som de erro/desvirar carta (som grave caindo)
        this.playBip(180, 0.25, "sawtooth");
    }
};