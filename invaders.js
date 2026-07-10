/* ==================================================
   ARCADE WEB SYSTEM
   JOGO: INVADERS
================================================== */

let invadersInterval = null;

function iniciarInvaders() {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    let playerX = canvas.width / 2 - 20;
    const playerY = canvas.height - 40;
    const playerWidth = 40;
    const playerHeight = 20;

    let lasers = [];
    let enemies = [];
    let score = 0;
    let gameOver = false;
    let somGameOverTocado = false;

    // Teclas premidas
    let keys = {};

    // Criar horda de inimigos
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 10; col++) {
            enemies.push({
                x: 80 + col * 70,
                y: 50 + row * 40,
                width: 35,
                height: 20,
                alive: true
            });
        }
    }

    let enemyDirection = 1;
    let enemySpeed = 1.5;

    window.addEventListener("keydown", escutarKeyDown);
    window.addEventListener("keyup", escutarKeyUp);

    function escutarKeyDown(e) {
        keys[e.key.toLowerCase()] = true;
        if (e.key === " " || e.key === "Spacebar") {
            e.preventDefault();
            atirar();
        }
    }

    function escutarKeyUp(e) {
        keys[e.key.toLowerCase()] = false;
    }

    function atirar() {
        if (gameOver) return;
        // Limita a 4 tiros simultâneos no ecrã
        if (lasers.length < 4) {
            lasers.push({ x: playerX + playerWidth / 2 - 2, y: playerY, speed: 7 });
            if (typeof AudioArcade !== 'undefined') AudioArcade.playBip(600, 0.05, 'triangle');
        }
    }

    function atualizar() {
        if (gameOver) return;

        // Mover jogador
        if (keys["arrowleft"] || keys["a"]) playerX -= 6;
        if (keys["arrowright"] || keys["d"]) playerX += 6;

        // Limites da tela
        if (playerX < 10) playerX = 10;
        if (playerX > canvas.width - playerWidth - 10) playerX = canvas.width - playerWidth - 10;

        // Mover Lasers
        lasers.forEach((laser, index) => {
            laser.y -= laser.speed;
            if (laser.y < 0) lasers.splice(index, 1);
        });

        // Mover Inimigos
        let mudouDirecao = false;
        enemies.forEach(enemy => {
            if (!enemy.alive) return;
            enemy.x += enemySpeed * enemyDirection;

            if (enemy.x > canvas.width - enemy.width - 20 || enemy.x < 20) {
                mudouDirecao = true;
            }

            // Inimigo chegou à base?
            if (enemy.y + enemy.height >= playerY) {
                gameOver = true;
            }
        });

        if (mudouDirecao) {
            enemyDirection *= -1;
            enemies.forEach(enemy => { enemy.y += 15; });
        }

        // Colisão Laser vs Inimigo
        lasers.forEach((laser, lIndex) => {
            enemies.forEach(enemy => {
                if (!enemy.alive) return;

                if (laser.x > enemy.x && laser.x < enemy.x + enemy.width &&
                    laser.y > enemy.y && laser.y < enemy.y + enemy.height) {
                    
                    enemy.alive = false;
                    lasers.splice(lIndex, 1);
                    score += 20;
                    if (typeof AudioArcade !== 'undefined') AudioArcade.playBip(180, 0.06, 'sawtooth');
                }
            });
        });

        // Verificar vitória (se todos morrerem, cria uma nova vaga mais rápida)
        if (enemies.every(e => !e.alive)) {
            enemySpeed += 0.5;
            enemies.forEach(e => e.alive = true);
            if (typeof AudioArcade !== 'undefined') AudioArcade.playSucesso();
        }
    }

    function desenhar() {
        ctx.fillStyle = "#050510";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Jogador
        ctx.fillStyle = "#00ff66";
        ctx.fillRect(playerX, playerY, playerWidth, playerHeight);

        // Lasers
        ctx.fillStyle = "#ffff33";
        lasers.forEach(laser => ctx.fillRect(laser.x, laser.y, 4, 12));

        // Inimigos
        enemies.forEach(enemy => {
            if (!enemy.alive) return;
            ctx.fillStyle = "#ff3366";
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            
            // Olhinhos retro nos inimigos
            ctx.fillStyle = "#fff";
            ctx.fillRect(enemy.x + 6, enemy.y + 6, 4, 4);
            ctx.fillRect(enemy.x + enemy.width - 10, enemy.y + 6, 4, 4);
        });

        // Pontuação
        ctx.font = "20px 'Courier New'";
        ctx.fillStyle = "#fff";
        ctx.textAlign = "left";
        ctx.fillText(`SCORE: ${score}`, 20, 35);

        if (gameOver) {
            clearInterval(invadersInterval);
            // ONDE ADICIONAR:
    if (typeof window.mostrarBotaoRestart === "function") window.mostrarBotaoRestart();
            ctx.fillStyle = "rgba(0,0,0,0.8)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.font = "40px 'Courier New'";
            ctx.fillStyle = "#ff3333";
            ctx.textAlign = "center";
            ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);

            if (!somGameOverTocado && typeof AudioArcade !== 'undefined') {
                somGameOverTocado = true;
                AudioArcade.playErro();
            }
        }
    }

    if (invadersInterval) clearInterval(invadersInterval);
    invadersInterval = setInterval(() => { atualizar(); desenhar(); }, 1000 / 60);

    window.limparEventosInvaders = () => {
        window.removeEventListener("keydown", escutarKeyDown);
        window.removeEventListener("keyup", escutarKeyUp);
    };
}