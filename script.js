// window.onload = startGame;
// const wrapper = screen.parentElement;

class GameArea {
  constructor(canvasWidth, canvasHeight) {
    this.screen = document.querySelector(".screen");
    this.canvas = document.createElement("canvas");
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
      if (e.key === "ArrowDown") {
        this.pressTime = "waiting";
      }
    }
    this.keys[e.key] = true;
  }

  onKeyUp(e) {
    this.keys[e.key] = false;
    if (e.key === "ArrowDown") {
      this.isReleased = true;
    }
  }

  update() {
    const context = gameArea.context;

    context.fillStyle = this.color;
    context.drawImage(this.img, this.x - this.width / 2, this.y - this.height / 2, this.width * 2, this.height * 2);
    context.fillRect(this.x, this.y, this.width, this.height);
  }

  jump() {
    this.speedY = -96;
    this.impulse = -300;
  }

  movement(deltaTime, time) {
    if (gameStarted) {
      if (this.keys["ArrowDown"] && this.pressTime === "waiting") {
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

      if (this.keys["ArrowDown"]) {
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
  }

  handleInput() {}
}

class Bird {}

let kite;
let obstacles;

let score;
let previouseScoreTime;
let previousTime;

let gameArea;
let gameStarted = false;
const canvasWidth = 720;
const canvasHeight = 480;

function startGame() {
  hideStartMenu();
  init();
  gameArea.start();
}

function hideStartMenu() {
  const screen = document.querySelector(".start-screen");
  if (screen) screen.style.display = "none";
}

function init() {
  gameArea = new GameArea(canvasWidth, canvasHeight);
  const kiteSprite = new Image();
  kiteSprite.src = "img/ph-kite.png";
  kiteSprite.onload = () => {
    kite = new Kite(canvasWidth / 8, (canvasHeight - 64) / 2, kiteSprite);
    gameStarted = true;
    requestAnimationFrame(gameLoop);
  };
  score = 0;
  obstacles = [];
}

function update(time) {
  const deltaTime = (time - previousTime) / 1000;
  previousTime = time;

  if (time - previouseScoreTime >= 1000) {
    score += 1000;
    previouseScoreTime = time;
  }

  console.log(score);
  if (time) kite.movement(deltaTime, time);
}

function render() {
  gameArea.clear();
  kite.update();
}

function gameLoop(time) {
  if (!gameStarted) return;
  if (!previousTime) {
    previousTime = time;
    previouseScoreTime = time;
    kite.jump();
  }

  update(time);
  render();
  requestAnimationFrame(gameLoop);
}
