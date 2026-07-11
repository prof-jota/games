/* ==================================================
   ARCADE WEB SYSTEM
   JOGO: QUIZ (Versão com Suporte a Touch)
================================================== */

function iniciarQuiz() {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    const perguntas = [
        { q: "O que significa a sigla HTML?", r: ["Hyper Links Text Mark", "Hyper Text Markup Language", "Home Tool Markup Language", "Hyper Tech Metric Language"], correta: 1 },
        { q: "Qual destes não é um banco de dados?", r: ["MySQL", "MongoDB", "PostgreSQL", "JavaScript"], correta: 3 },
        { q: "No CSS, qual propriedade altera a cor de fundo?", r: ["color", "font-weight", "background-color", "border-style"], correta: 2 },
        { q: "Qual empresa criou o sistema Java?", r: ["Microsoft", "Sun Microsystems", "Apple", "Google"], correta: 1 }
    ];

    let indiceAtual = 0;
    let score = 0;
    let quizFinalizado = false;
    let feedbackTexto = "";
    let feedbackCor = "#fff";

    // Definições de posicionamento das alternativas para cálculo de clique/toque
    const itemStartX = 150;
    const itemStartY = 180;
    const itemSpacing = 45;
    const itemHeight = 30; // Altura aproximada da área de toque de cada opção
    const itemWidth = canvas.width - (itemStartX * 2); // Largura aproximada

    desenharPergunta();

    // --- ESCUTAR EVENTOS ---

    // Teclado (Desktop)
    window.addEventListener("keydown", capturarRespostaTeclado);

    // Mouse e Touch (Desktop e Celular)
    canvas.addEventListener("mousedown", tratarCliqueMousedown);
    canvas.addEventListener("touchstart", tratarCliqueTouch, { passive: false });

    function verificarEscolha(numeroEscolhido) {
        if (quizFinalizado) return;

        const escolhaUsuario = numeroEscolhido - 1;
        const correta = perguntas[indiceAtual].correta;

        if (escolhaUsuario === correta) {
            score += 25;
            feedbackTexto = "CORRETO!";
            feedbackCor = "#00ff66";
            if (typeof AudioArcade !== 'undefined') AudioArcade.playBip(700, 0.1, 'sine');
        } else {
            feedbackTexto = "INCORRETO!";
            feedbackCor = "#ff3366";
            if (typeof AudioArcade !== 'undefined') AudioArcade.playBip(150, 0.15, 'sawtooth');
        }

        // Bloqueia respostas temporariamente para dar tempo de ler o feedback
        quizFinalizado = true; 
        desenharPergunta();

        setTimeout(() => {
            indiceAtual++;
            feedbackTexto = "";
            if (indiceAtual >= perguntas.length) {
                desenharFimDeJogo();
            } else {
                quizFinalizado = false;
                desenharPergunta();
            }
        }, 1200);
    }

    function capturarRespostaTeclado(e) {
        if (["1", "2", "3", "4"].includes(e.key)) {
            verificarEscolha(parseInt(e.key));
        }
    }

    function tratarCliqueMousedown(e) {
        obterCoordenadasEProcessar(e.clientX, e.clientY);
    }

    function tratarCliqueTouch(e) {
        e.preventDefault(); // Evita scroll ao tentar tocar na alternativa
        if (e.touches.length > 0) {
            obterCoordenadasEProcessar(e.touches[0].clientX, e.touches[0].clientY);
        }
    }

    function obterCoordenadasEProcessar(clientX, clientY) {
        if (quizFinalizado) return;

        const rect = canvas.getBoundingClientRect();
        const escalaX = canvas.width / rect.width;
        const escalaY = canvas.height / rect.height;

        const cliqueX = (clientX - rect.left) * escalaX;
        const cliqueY = (clientY - rect.top) * escalaY;

        // Verifica se o clique ocorreu sobre alguma das 4 alternativas
        for (let i = 0; i < 4; i++) {
            const yMin = itemStartY + (i * itemSpacing) - 15; // Margem para cima do texto
            const yMax = yMin + itemHeight;

            if (cliqueX >= itemStartX && cliqueX <= itemStartX + itemWidth &&
                cliqueY >= yMin && cliqueY <= yMax) {
                verificarEscolha(i + 1);
                break;
            }
        }
    }

    function desenharPergunta() {
        ctx.fillStyle = "#0c1020";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const item = perguntas[indiceAtual];

        // Título/Pergunta
        ctx.font = "24px 'Courier New'";
        ctx.fillStyle = "#00ffaa";
        ctx.textAlign = "center";
        ctx.fillText(item.q, canvas.width / 2, 100);

        // Alternativas
        ctx.font = "18px 'Courier New'";
        ctx.textAlign = "left";
        
        item.r.forEach((opcap, i) => {
            ctx.fillStyle = "#ffffff";
            ctx.fillText(`[ ${i + 1} ] ${opcap}`, itemStartX, itemStartY + i * itemSpacing);
        });

        // Rodapé de ajuda adaptado
        ctx.font = "14px 'Courier New'";
        ctx.fillStyle = "#888";
        ctx.textAlign = "center";
        ctx.fillText("Toque na alternativa desejada ou use as teclas [1, 2, 3, 4]", canvas.width / 2, canvas.height - 40);

        // Feedback visual
        if (feedbackTexto !== "") {
            ctx.font = "bold 30px 'Courier New'";
            ctx.fillStyle = feedbackCor;
            ctx.fillText(feedbackTexto, canvas.width / 2, canvas.height - 100);
        }
    }

    function desenharFimDeJogo() {
        quizFinalizado = true;
        ctx.fillStyle = "#0c1020";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = "40px 'Courier New'";
        ctx.fillStyle = "#00ffaa";
        ctx.textAlign = "center";
        ctx.fillText("QUIZ COMPLETADO!", canvas.width / 2, canvas.height / 2 - 20);

        ctx.font = "24px 'Courier New'";
        ctx.fillStyle = "#fff";
        ctx.fillText(`Sua Pontuação Final: ${score}%`, canvas.width / 2, canvas.height / 2 + 30);

        if (score >= 75) {
            if (typeof AudioArcade !== 'undefined') AudioArcade.playSucesso();
        } else {
            if (typeof AudioArcade !== 'undefined') AudioArcade.playErro();
        }
    }

    // Limpeza global dos novos eventos
    window.limparEventosQuiz = () => {
        window.removeEventListener("keydown", capturarRespostaTeclado);
        canvas.removeEventListener("mousedown", tratarCliqueMousedown);
        canvas.removeEventListener("touchstart", tratarCliqueTouch);
    };
}