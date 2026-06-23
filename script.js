const board = document.getElementById("game-board");
const player = document.getElementById("player");
const scoreText = document.getElementById("score");
const timeText = document.getElementById("time");
const message = document.getElementById("message");
const restartBtn = document.getElementById("restart-btn");

const boardWidth = 500;
const boardHeight = 400;
const playerSize = 35;
const coinSize = 25;

let playerX = 230;
let playerY = 180;
let score = 0;
let time = 30;
let gameOver = false;
let timer;
let coins = [];

const totalCoins = 10;
const moveSpeed = 15;

function startGame() {
  playerX = 230;
  playerY = 180;
  score = 0;
  time = 30;
  gameOver = false;
  coins = [];

  scoreText.textContent = score;
  timeText.textContent = time;
  message.textContent = "방향키로 움직여서 모든 코인을 먹으세요!";

  player.style.left = playerX + "px";
  player.style.top = playerY + "px";

  document.querySelectorAll(".coin").forEach((coin) => coin.remove());

  createCoins();

  clearInterval(timer);
  timer = setInterval(updateTime, 1000);
}

function createCoins() {
  for (let i = 0; i < totalCoins; i++) {
    const coin = document.createElement("div");
    coin.classList.add("coin");

    const x = Math.floor(Math.random() * (boardWidth - coinSize));
    const y = Math.floor(Math.random() * (boardHeight - coinSize));

    coin.style.left = x + "px";
    coin.style.top = y + "px";

    board.appendChild(coin);
    coins.push(coin);
  }
}

function updateTime() {
  if (gameOver) return;

  time--;
  timeText.textContent = time;

  if (time <= 0) {
    endGame(false);
  }
}

function movePlayer(event) {
  if (gameOver) return;

  if (event.key === "ArrowUp") {
    playerY -= moveSpeed;
  } else if (event.key === "ArrowDown") {
    playerY += moveSpeed;
  } else if (event.key === "ArrowLeft") {
    playerX -= moveSpeed;
  } else if (event.key === "ArrowRight") {
    playerX += moveSpeed;
  }

  if (playerX < 0) playerX = 0;
  if (playerY < 0) playerY = 0;
  if (playerX > boardWidth - playerSize) playerX = boardWidth - playerSize;
  if (playerY > boardHeight - playerSize) playerY = boardHeight - playerSize;

  player.style.left = playerX + "px";
  player.style.top = playerY + "px";

  checkCoinCollision();
}

function checkCoinCollision() {
  coins.forEach((coin, index) => {
    const coinX = parseInt(coin.style.left);
    const coinY = parseInt(coin.style.top);

    const isHit =
      playerX < coinX + coinSize &&
      playerX + playerSize > coinX &&
      playerY < coinY + coinSize &&
      playerY + playerSize > coinY;

    if (isHit) {
      coin.remove();
      coins.splice(index, 1);
      score++;
      scoreText.textContent = score;
    }
  });

  if (score >= totalCoins) {
    endGame(true);
  }
}

function endGame(isWin) {
  gameOver = true;
  clearInterval(timer);

  if (isWin) {
    message.textContent = "승리! 모든 코인을 먹었습니다!";
  } else {
    message.textContent = "패배! 시간이 초과되었습니다.";
  }
}

document.addEventListener("keydown", movePlayer);
restartBtn.addEventListener("click", startGame);

startGame();
