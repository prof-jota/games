/* ==================================================
   ARCADE WEB SYSTEM
   CONTROLE DA INTERFACE
   V0.1.2 (Correção de Inicialização)
================================================== */

// ================================================
// INICIALIZAÇÃO
// ================================================
document.addEventListener("DOMContentLoaded", () => {
    console.log("ARCADE INTERFACE ONLINE");

    carregarJogos();
    
    // Um leve delay garante que o HTML dos jogos já foi totalmente renderizado na tela
    setTimeout(() => {
        ativarBotoes();
        configurarPesquisa();
    }, 50);
});

// ================================================
// ATIVAR BOTÕES DOS JOGOS
// ================================================
function ativarBotoes(){
    const cards = document.querySelectorAll(".game");
    console.log(`Encontrados ${cards.length} jogos para ativar.`);

    cards.forEach(card => {
        card.addEventListener("click", () => {
            const jogo = card.dataset.game;
            abrirJogo(jogo);
        });
    });

    // Botão destaque PONG
    const destaque = document.querySelector(".btn-jogar");
    if (destaque) {
        destaque.addEventListener("click", () => {
            abrirJogo("pong");
        });
    }
}

// ================================================
// SISTEMA DE FILTRO / PESQUISA
// ================================================
function configurarPesquisa() {
    const campoPesquisa = document.getElementById("campoPesquisa");
    
    if (!campoPesquisa) return;

    campoPesquisa.addEventListener("input", (evento) => {
        const cards = document.querySelectorAll(".game");
        const termoBusca = evento.target.value.toLowerCase().trim();

        cards.forEach(card => {
            const nomeJogo = card.querySelector("h3").textContent.toLowerCase();

            if (nomeJogo.includes(termoBusca)) {
                card.style.display = "flex";
            } else {
                card.style.display = "none";
            }
        });
    });
}