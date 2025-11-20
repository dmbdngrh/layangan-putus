window.onload = startGame;
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
    this.width = 48;
    this.height = 48;
    this.color = "red";

    window.addEventListener("keydown", (e) => (this.keys[e.key] = true));
    window.addEventListener("keydown", (e) => (this.keys[e.key] = false));
  }

  update() {
    const context = gameArea.context;
    context.fillStyle = this.color;
    context.fillRect(this.x, this.y, this.width, this.height);
  }

  handleInput() {}
}

let kite;
let obstacles;

let score;
let previousTime;

let gameArea;
const canvasWidth = 720;
const canvasHeight = 480;

function startGame() {
  init();
  gameArea.start();
  requestAnimationFrame(gameLoop);
}

function init() {
  previousTime = 0;
  score = 0;
  gameArea = new GameArea(canvasWidth, canvasHeight);
  kite = new Kite((canvasWidth - 48) / 2, (canvasHeight - 48) / 2);
}

function update(deltaTime) {
  gameArea.clear();
  kite.update();
}

function gameLoop(time) {
  const deltaTime = (time - previousTime) / 1000;
  previousTime = time;
  update(deltaTime);
  //render;
  if (time < 10000) requestAnimationFrame(gameLoop);
}
