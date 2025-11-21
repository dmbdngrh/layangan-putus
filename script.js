class GameArea {
  constructor(canvasWidth, canvasHeight) {
    this.screen = document.querySelector(".screen");
    this.startScreen = this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d");
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
  }

  start() {
    this.canvas.width = this.canvasWidth;
    this.canvas.height = this.canvasHeight;
    this.screen.prepend(this.canvas);
  }

  clear() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

class Kite {
  constructor(x, y, img) {
    this.x = x;
    this.y = y;
    this.width = 64; // 48px = 0.5m
    this.height = 64;

    this.gravity = 96;
    this.speedX = 0;
    this.accelerationX = 0;
    this.speedY = 0;
    this.accelerationY = 0;
    this.impulse = 0;

    this.keys = {};
    this.pressTime = null;
    this.isReleased = false;
    this.launchTreshold = 0.2;

    this.color = "rgba(255, 0, 0, 0.5)";
    this.img = img;

    window.addEventListener("keydown", (e) => this.onKeyDown(e));
    window.addEventListener("keyup", (e) => this.onKeyUp(e));
  }

  onKeyDown(e) {
    if (!this.keys[e.key]) {
      if (e.key === " ") {
        this.pressTime = "waiting";
      }
    }
    this.keys[e.key] = true;
  }

  onKeyUp(e) {
    this.keys[e.key] = false;
    if (e.key === " ") {
      this.isReleased = true;
    }
  }

  update() {
    const context = gameArea.context;

    this.collX = this.x;
    this.collY = this.y + this.height / 8;
    this.collWidth = this.width;
    this.collHeight = this.height - this.height / 3;
    context.fillStyle = this.color;
    context.drawImage(this.img, this.x - this.width / 2, this.y - this.height / 2, this.width * 2, this.height * 2);
    // context.fillRect(this.collX, this.collY, this.collWidth, this.collHeight);
  }

  jump() {
    this.speedY = -96;
    this.impulse = -300;
  }

  movement(deltaTime, time) {
    if (this.keys[" "] && this.pressTime === "waiting") {
      this.pressTime = time / 1000;
    }

    if (this.isReleased) {
      const heldTime = time / 1000 - this.pressTime;
      // console.log(heldTime, "PRESS TIME");
      if (heldTime < this.launchTreshold) {
        this.jump();
      } else this.impulse = 200;

      this.pressTime = undefined;
      this.isReleased = false;
    }

    if (this.keys[" "]) {
      this.accelerationY = 300; // slow drag force
    } else {
      this.accelerationY = 0;
    }

    this.speedY += this.impulse * deltaTime;
    this.impulse *= 0.3; // decay impulse

    this.speedY += this.accelerationY * deltaTime;

    // console.log(this.speedY, this.impulse);
    this.speedY += this.gravity * deltaTime;
    // this.speedY += this.accelerationY * deltaTime;

    this.y += this.speedY * deltaTime;
  }

  reset() {
    this.x = canvasWidth / 8;
    this.y = (canvasHeight - 64) / 2;
    this.accelerationX = 0;
    this.speedY = 0;
    this.accelerationY = 0;
    this.impulse = 0;
    this.isReleased = false;
  }

  isOffscreen() {
    return this.y > canvasHeight || this.y < 0 - this.height;
  }
}

class Bird {
  constructor(x, y, speed, size, img) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.width = 68 * size;
    this.height = 38 * size;
    this.size = size;
    this.collX;
    this.collY;
    this.collWidth;
    this.collHeight;
    this.img = img;
  }

  update() {
    const context = gameArea.context;
    // context.drawImage(this.img, this.x);
    this.collX = this.x + this.width / 8;
    this.collY = this.y + this.height / 8;
    this.collWidth = this.width - this.width / 6;
    this.collHeight = this.height - this.height / 3;
    context.drawImage(this.img, this.x, this.y, this.width, this.height);
    // context.fillRect(this.collX, this.collY, this.collWidth, this.collHeight);
  }

  movement(deltaTime) {
    this.x += this.speed * deltaTime;
  }

  isOffscreen() {
    return this.x < -500;
  }
}

let kite;
let obstacles;
let test, test2;

let name;
let score;
let timeStamp;
let previousTime;
let startTime;
const leaderboard = [];

let gameArea;
let gameOver;
const canvasWidth = 720;
const canvasHeight = 480;
const assets = { background: new Image(), kite: new Image(), bird: new Image() };
let assetsLoaded = 0;

function startGame() {
  hideStartMenu();
  assets.background.src = "img/background.png";
  assets.kite.src = "img/ph-kite.png";
  assets.bird.src = "img/bird.png";

  for (const key in assets) {
    assets[key].onload = () => {
      assetsLoaded++;
      if (assetsLoaded === Object.keys(assets).length) {
        init();
        gameArea.start();
      }
    };
  }
}

function init() {
  if (!gameArea) gameArea = new GameArea(canvasWidth, canvasHeight);
  kite = new Kite(canvasWidth / 8, (canvasHeight - 64) / 2, assets.kite);
  // test = new Bird(canvasWidth / 2, canvasHeight / 2, -100, 1, assets.bird);
  // test2 = new Bird(canvasWidth / 3, canvasHeight / 3, -100, 1, assets.bird);
  name = document.getElementById("name").value;
  console.log(name);
  if (!name) {
    name =
      "Kucing" +
      Math.ceil(Math.random() * 10) +
      Math.ceil(Math.random() * 10) +
      Math.ceil(Math.random() * 10) +
      Math.ceil(Math.random() * 10);
  }

  gameOver = false;
  previousTime = null;
  timeStamp = null;

  score = 0;
  obstacles = [];

  gameArea.clear();
  requestAnimationFrame(gameLoop);
}

function spawnBird() {
  const size = Math.random() * 2.3 + 0.7;
  const y = Math.random() * (canvasHeight - size) + size;
  const speed = 40 + Math.random() * 200;
  console.log("BirdSpawnd");

  obstacles.push(new Bird(canvasWidth, y, -speed, size, assets.bird));
  console.log(obstacles);
}

function checkCollision(object1, object2) {
  return (
    object1.collX < object2.collX + object2.collWidth &&
    object1.collX + object1.collHeight > object2.collX &&
    object1.collY < object2.collY + object2.collHeight &&
    object1.collY + object1.collHeight > object2.collY
  );
}

function showScore(score) {
  const context = gameArea.context;
  context.font = "bold 50px 'VT323'";
  context.fillStyle = "#003366";
  context.textAlign = "center";
  context.fillText(score, canvasWidth / 2 + 4, 44);
  context.font = "bold 50px 'VT323'";
  context.fillStyle = "#003366";
  context.textAlign = "center";
  context.fillText(score, canvasWidth / 2 + 2, 44);
  context.font = "bold 50px 'VT323'";
  context.fillStyle = "White";
  context.textAlign = "center";
  context.fillText(score, canvasWidth / 2, 40);
}

function update(time) {
  const deltaTime = (time - previousTime) / 1000;
  previousTime = time;

  gameArea.clear();
  kite.update();
  showScore(score);
  if (time - timeStamp >= 1000) {
    spawnBird();

    score += 100;
    timeStamp = time;
  }

  if (kite.isOffscreen()) {
    gameOverScreen(time);
  }

  for (let i = obstacles.length - 1; i >= 0; i--) {
    const bird = obstacles[i];

    bird.movement(deltaTime);
    bird.update();

    if (checkCollision(kite, bird)) {
      console.log("HIT!");
      gameOverScreen(time);
    }

    if (bird.isOffscreen()) {
      obstacles.splice(i, 1);
    }
  }

  console.log(score);
  if (time) kite.movement(deltaTime, time);
}

function render() {
  // test.update();
  // test2.update();
}

function gameOverScreen(time) {
  const finalScore = document.querySelector("#finalScore");
  const elapsedTime = document.querySelector("#elapsedTime");
  elapsedTime.textContent = ((time - startTime) / 1000).toFixed(1);
  finalScore.textContent = score;
  leaderboard.push({ name: name, score: score });
  showEndScreen();
  gameOver = true;
}

function resetGame() {
  console.log("reset gamme");

  // gameOver = false;
  // obstacles = [];
  // score = 0;

  // previousTime = null;
  // timeStamp = null;

  // kite = new Kite(canvasWidth / 8, (canvasHeight - 64) / 2, assets.kite);

  // gameArea.clear();
  showGameScreen();
  // requestAnimationFrame(gameLoop);
  init();
}

function gameLoop(time) {
  if (gameOver) return;
  if (!previousTime) {
    startTime = time;
    previousTime = time;
    timeStamp = time;
    kite.jump();
  }
  update(time);
  render();
  // if (time - startTime > 10000) gameOver = true;
  // console.log(time - startTime);

  requestAnimationFrame(gameLoop);
}

function generateLeaderboard() {
  leaderboard.sort((a, b) => b.score - a.score);
  const list = document.querySelector(".leaderboard-list");
  list.innerHTML = "";
  for (const element of leaderboard) {
    const item = document.createElement("div");
    item.className = "leaderboard-item";

    item.innerHTML = `
    <span class="player-name">${element.name}</span>
    <span class="player-score">${element.score}</span>
    `;

    list.appendChild(item);
  }
}

document.getElementById("start-btn").onclick = () => {
  if (!gameOver) {
    startGame();
  } else {
    hideStartMenu();
    resetGame();
  }
};

function returnMenu() {
  hideEndScreen();
  hideGameScreen();
  hideLeaderboard();
  showStartMenu();
}

function hideStartMenu() {
  const screen = document.querySelector(".start-screen");
  if (screen) screen.style.display = "none";
}

function showStartMenu() {
  const screen = document.querySelector(".start-screen");
  if (screen) screen.style.display = "flex";
}

function hideGameScreen() {
  const screen = document.querySelector(".screen");
  if (screen) screen.style.display = "none";
}

function showGameScreen() {
  const screen = document.querySelector(".screen");
  if (screen) screen.style.display = "flex";
}

function hideEndScreen() {
  const screen = document.querySelector("#gameOver");
  if (screen) screen.style.display = "none";
}

function showEndScreen() {
  const screen = document.querySelector("#gameOver");
  if (screen) screen.style.display = "flex";
}

function showLeaderboard() {
  const screen = document.querySelector("#leaderboard");
  if (screen) screen.style.display = "flex";

  generateLeaderboard();
}

function hideLeaderboard() {
  const screen = document.querySelector("#leaderboard");
  if (screen) screen.style.display = "none";
}
