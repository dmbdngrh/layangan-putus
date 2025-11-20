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

    this.speedX = 0;
    this.speedY = 0;

    this.keys = {};
    this.pressTime = null;
    this.isHeld = false;
    this.launchTreshold = 0.5;

    this.color = "rgba(255, 0, 0, 0.5)";
    this.img = img;

    window.addEventListener("keydown", (e) => {
      this.speedX = 100;
      this.speedY = -100;
    });
    window.addEventListener("keyup", (e) => {
      this.speedX = 0;
      this.speedY = 0;
    });
  }

  update() {
    const context = gameArea.context;

    context.fillStyle = this.color;
    context.drawImage(this.img, this.x - this.width / 2, this.y - this.height / 2, this.width * 2, this.height * 2);
    // context.fillRect(this.x, this.y, this.width, this.height);
  }

  movement(deltaTime, time) {
    // console.log(deltaTime);
    this.x += this.speedX * deltaTime;
    this.y += this.speedY * deltaTime;
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
}

function init() {
  gameArea = new GameArea(canvasWidth, canvasHeight);
  const kiteSprite = new Image();
  kiteSprite.src = "img/ph-kite.png";
  kiteSprite.onload = () => {
    kite = new Kite((canvasWidth - 48) / 2, (canvasHeight - 48) / 2, kiteSprite);
    requestAnimationFrame(gameLoop);
  };
  previousTime = 0;
  score = 0;
  obstacles = [];
}

function update(time) {
  const deltaTime = (time - previousTime) / 1000;
  previousTime = time;

  kite.movement(deltaTime, time);
}

function render() {
  gameArea.clear();
  kite.update();
}

function gameLoop(time) {
  update(time);
  render();
  if (time < 10000) requestAnimationFrame(gameLoop);
}
