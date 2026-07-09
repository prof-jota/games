/* ==================================================
   ARCADE WEB SYSTEM
   CATÁLOGO DE JOGOS
   V0.2 (Atualizado com Jogos Disponíveis)
================================================== */

const jogos = [
    {
        id: "pong",
        nome: "Pong",
        icone: "🏓",
        categoria: "Arcade",
        status: "DISPONÍVEL"
    },
    {
        id: "snake",
        nome: "Snake",
        icone: "🐍",
        categoria: "Arcade",
        status: "DISPONÍVEL"
    },
    {
        id: "memoria",
        nome: "Memória",
        icone: "🧠",
        categoria: "Educativo",
        status: "DISPONÍVEL"
    },
    {
        id: "tetris",
        nome: "Tetris",
        icone: "🧱",
        categoria: "Puzzle",
        status: "DISPONÍVEL"
    },
    {
        id: "invaders",
        nome: "Invaders",
        icone: "👾",
        categoria: "Arcade",
        status: "EM BREVE"
    },
    {
        id: "flappy",
        nome: "Flappy",
        icone: "🐤",
        categoria: "Arcade",
        status: "EM BREVE"
    },
    {
        id: "velha",
        nome: "Jogo da Velha",
        icone: "❌",
        categoria: "Estratégia",
        status: "EM BREVE"
    },
    {
        id: "quiz",
        nome: "Quiz",
        icone: "❓",
        categoria: "Educativo",
        status: "EM BREVE"
    }
];

/* ==================================================
   GERAR CARDS AUTOMATICAMENTE
================================================== */
function carregarJogos(){
    const lista = document.getElementById("listaJogos");
    if (!lista) return;
    
    lista.innerHTML = "";

    jogos.forEach(jogo => {
        // Define a classe CSS correta com base no status do jogo
        let statusClass = "breve";
        if (jogo.status === "ONLINE") statusClass = "online";
        if (jogo.status === "DISPONÍVEL") statusClass = "disponivel";

        lista.innerHTML += `
            <div class="game" data-game="${jogo.id}">
                <div class="emoji">${jogo.icone}</div>
                <h3>${jogo.nome}</h3>
                <span class="status ${statusClass}">${jogo.status}</span>
            </div>
        `;
    });
}