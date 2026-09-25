const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreLabel = document.getElementById("score");
const energyLabel = document.getElementById("energy");

const keys = {};
let score = 0;
let totalCrystals = 8;
let gameOver = false;
let win = false;

const player = {
  x: 80,
  y: 80,
  radius: 16,
  speed: 4,
  energy: 100
};

const base = {
  x: canvas.width - 110,
  y: canvas.height - 110,
  radius: 40
};

const crystals = [];
const storms = [];

function createCrystals() {
  for (let i = 0; i < totalCrystals; i++) {
    crystals.push({
      x: 120 + Math.random() * (canvas.width - 220),
      y: 80 + Math.random() * (canvas.height - 200),
      radius: 9,
      color: "#67f3ff",
      collected: false
    });
  }
}

function createStorms() {
  for (let i = 0; i < 5; i++) {
    storms.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: 20 + Math.random() * 18,
      vx: (Math.random() - 0.5) * 1.8,
      vy: (Math.random() - 0.5) * 1.8
    });
  }
}

function updatePlayer() {
  if (keys["ArrowUp"] || keys["w"]) player.y -= player.speed;
  if (keys["ArrowDown"] || keys["s"]) player.y += player.speed;
  if (keys["ArrowLeft"] || keys["a"]) player.x -= player.speed;
  if (keys["ArrowRight"] || keys["d"]) player.x += player.speed;

  player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x));
  player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y));
}

function checkCrystalCollisions() {
  crystals.forEach((crystal) => {
    if (!crystal.collected) {
      const dx = player.x - crystal.x;
      const dy = player.y - crystal.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < player.radius + crystal.radius) {
        crystal.collected = true;
        score++;
        player.energy = Math.min(100, player.energy + 10);
      }
    }
  });
}

function updateStorms() {
  storms.forEach((storm) => {
    storm.x += storm.vx;
    storm.y += storm.vy;

    if (storm.x < 0 || storm.x > canvas.width) storm.vx *= -1;
    if (storm.y < 0 || storm.y > canvas.height) storm.vy *= -1;

    const dx = player.x - storm.x;
    const dy = player.y - storm.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < player.radius + storm.radius) {
      player.energy -= 0.7;
    }
  });

  if (player.energy <= 0) {
    gameOver = true;
  }
}

function checkWin() {
  const dx = player.x - base.x;
  const dy = player.y - base.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (score >= totalCrystals && dist < player.radius + base.radius + 10) {
    win = true;
  }
}

function updateHud() {
  scoreLabel.textContent = `Cristaux: ${score} / ${totalCrystals}`;
  energyLabel.textContent = `Énergie: ${Math.max(0, Math.ceil(player.energy))}`;
}

function drawPlanet() {
  ctx.fillStyle = "#1a2d1d";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Planet surface
  ctx.fillStyle = "#2e5d2f";
  ctx.fillRect(0, canvas.height - 80, canvas.width, 80);

  // Some rocks
  ctx.fillStyle = "#3f6b3f";
  for (let i = 0; i < 25; i++) {
    const x = (i * 67) % canvas.width;
    const y = canvas.height - 80 + (i % 3) * 12;
    ctx.fillRect(x, y, 18, 18);
  }
}

function drawBase() {
  ctx.fillStyle = "#d9d9d9";
  ctx.beginPath();
  ctx.arc(base.x, base.y, base.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#3a7bd5";
  ctx.fillRect(base.x - 18, base.y - 18, 36, 36);
}

function drawPlayer() {
  ctx.fillStyle = "#ffcb77";
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#2b2b2b";
  ctx.fillRect(player.x - 3, player.y - 3, 6, 6);
}

function drawCrystals() {
  crystals.forEach((crystal) => {
    if (crystal.collected) return;

    ctx.fillStyle = crystal.color;
    ctx.beginPath();
    ctx.moveTo(crystal.x, crystal.y - crystal.radius);
    ctx.lineTo(crystal.x + crystal.radius, crystal.y);
    ctx.lineTo(crystal.x, crystal.y + crystal.radius);
    ctx.lineTo(crystal.x - crystal.radius, crystal.y);
    ctx.closePath();
    ctx.fill();
  });
}

function drawStorms() {
  storms.forEach((storm) => {
    ctx.fillStyle = "rgba(120, 130, 255, 0.7)";
    ctx.beginPath();
    ctx.arc(storm.x, storm.y, storm.radius, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawText() {
  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.textAlign = "center";

  if (gameOver) {
    ctx.fillText("Mission échouée !", canvas.width / 2, canvas.height / 2);
    ctx.font = "18px Arial";
    ctx.fillText("Recharge ou rafraîchis la page pour recommencer", canvas.width / 2, canvas.height / 2 + 35);
  } else if (win) {
    ctx.fillText("Mission réussie !", canvas.width / 2, canvas.height / 2);
    ctx.font = "18px Arial";
    ctx.fillText("Tu as récupéré tous les cristaux et regagné la base", canvas.width / 2, canvas.height / 2 + 35);
  }
}

function gameLoop() {
  if (!gameOver && !win) {
    updatePlayer();
    checkCrystalCollisions();
    updateStorms();
    checkWin();
    updateHud();
  }

  drawPlanet();
  drawBase();
  drawCrystals();
  drawStorms();
  drawPlayer();
  drawText();

  requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", (e) => {
  keys[e.key] = true;
  keys[e.key.toLowerCase()] = true;
});

document.addEventListener("keyup", (e) => {
  keys[e.key] = false;
  keys[e.key.toLowerCase()] = false;
});

createCrystals();
createStorms();
gameLoop(); 
