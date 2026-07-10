/* ==================================================
   ARCADE WEB SYSTEM
   CATÁLOGO DE JOGOS
   V0.3 (Todos os Jogos Disponibilizados)
================================================== */

const jogos = [
    { id: "pong", nome: "Pong", icone: "🏓", categoria: "Arcade", status: "DISPONÍVEL" },
    { id: "snake", nome: "Snake", icone: "🐍", categoria: "Arcade", status: "DISPONÍVEL" },
    { id: "memoria", nome: "Memória", icone: "🧠", categoria: "Educativo", status: "DISPONÍVEL" },
    { id: "tetris", nome: "Tetris", icone: "🧱", categoria: "Puzzle", status: "DISPONÍVEL" },
    { id: "invaders", nome: "Invaders", icone: "👾", categoria: "Arcade", status: "DISPONÍVEL" },
    { id: "flappy", nome: "Flappy", icone: "🐤", categoria: "Arcade", status: "DISPONÍVEL" },
    { id: "velha", nome: "Jogo da Velha", icone: "❌", categoria: "Estratégia", status: "DISPONÍVEL" },
    { id: "quiz", nome: "Quiz", icone: "❓", categoria: "Educativo", status: "DISPONÍVEL" }
];

function carregarJogos(){
    const lista = document.getElementById("listaJogos");
    if (!lista) return;
    
    lista.innerHTML = "";

    jogos.forEach(jogo => {
        let statusClass = "breve";
        if (jogo.status === "DISPONÍVEL") statusClass = "online";

        const card = document.createElement("div");
        card.className = `game ${statusClass}`;
        card.dataset.game = jogo.id;

        card.innerHTML = `
            <div class="emoji">${jogo.icone}</div>
            <h3>${jogo.nome}</h3>
            <p>${jogo.categoria}</p>
            <div class="barra"></div>
        `;
        lista.appendChild(card);
    });
}