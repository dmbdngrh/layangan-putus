window.onload = startMenu;

// Audio (gunakan path folder assets)
const bgm = new Audio("assets/music.mp3");
const sfxButton = new Audio("assets/SFXbutton.mp3");

// Classes
class GameArea {
    constructor(w, h) {
        this.screen = document.querySelector(".screen");
        this.canvas = document.createElement("canvas");
        this.context = this.canvas.getContext("2d");
        this.canvas.width = w;
        this.canvas.height = h;
        this.screen.appendChild(this.canvas);

        this.bg = new Image();
        this.bg.src = "assets/background.jpg";   // FIXED

        this.bgX = 0;
    }

    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawBackground() {
        this.context.drawImage(this.bg, this.bgX, 0, this.canvas.width, this.canvas.height);
        this.context.drawImage(this.bg, this.bgX + this.canvas.width, 0, this.canvas.width, this.canvas.height);

        this.bgX -= 1;
        if (this.bgX <= -this.canvas.width) this.bgX = 0;
    }
}

class Kite {
    constructor() {
        this.img = new Image();
        this.img.src = "assets/kite.png";   // FIXED

        this.x = 150;
        this.y = 200;
        this.speed = 0;
        this.gravity = 0.4;
        this.jumpPower = -7;

        window.addEventListener("keydown", e => {
            if (e.key === " " || e.key === "w" || e.key === "ArrowUp") {
                this.speed = this.jumpPower;
            }
        });
    }

    update() {
        this.speed += this.gravity;
        this.y += this.speed;

        gameArea.context.drawImage(this.img, this.x, this.y, 50, 50);
    }
}

// GAME VARIABLES
let gameArea;
let kite;
let obstacles = [];
let score = 0;
let previousTime = 0;
const canvasWidth = 720;
const canvasHeight = 480;

// MENU
function startMenu() {
    document.getElementById("menu").classList.add("active");
    bgm.volume = 0.4;
    bgm.loop = true;
}

// PLAY GAME
function playGame() {
    sfxButton.play();

    document.getElementById("menu").classList.remove("active");

    gameArea = new GameArea(canvasWidth, canvasHeight);
    kite = new Kite();
    score = 0;

    bgm.play();

    requestAnimationFrame(gameLoop);
}

// UPDATE
function update(deltaTime) {
    gameArea.clear();
    gameArea.drawBackground();
    kite.update();
}

// GAME LOOP
function gameLoop(time) {
    const deltaTime = (time - previousTime) / 1000;
    previousTime = time;

    update(deltaTime);

    requestAnimationFrame(gameLoop);
}

// GAME OVER SCREEN
function showGameOver() {
    document.getElementById("finalScore").textContent = score;
    document.getElementById("gameOver").style.display = "flex";
    bgm.pause();
}

function restartGame() {
    sfxButton.play();
    location.reload();
}

function returnMenu() {
    sfxButton.play();
    location.reload();
}

// MOCK FUNCTIONS
function showLeaderboard() {
    alert("Leaderboard belum dibuat (mock UI).");
}

function exitGame() {
    sfxButton.play();
    alert("Exit Game (mock).");
}
