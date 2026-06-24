const board = document.getElementById("game-board");
const player = document.getElementById("player");
const scoreText = document.getElementById("score");
const timeText = document.getElementById("time");
const message = document.getElementById("message");

let score = 0;
let time = 30;
let gameRunning = false;

let playerX = 230;
let playerY = 180;

let timer;
let coins = [];

function createCoins() {

    document.querySelectorAll(".coin").forEach(c => c.remove());

    coins = [];

    for(let i=0;i<10;i++){

        const coin = document.createElement("div");
        coin.classList.add("coin");

        const x = Math.random()*460;
        const y = Math.random()*360;

        coin.style.left = x + "px";
        coin.style.top = y + "px";

        board.appendChild(coin);
        coins.push(coin);
    }
}

function startGame(){

    score = 0;
    time = 30;

    scoreText.textContent = score;
    timeText.textContent = time;

    playerX = 230;
    playerY = 180;

    player.style.left = playerX + "px";
    player.style.top = playerY + "px";

    createCoins();

    clearInterval(timer);

    timer = setInterval(()=>{

        time--;
        timeText.textContent = time;

        if(time <= 0){

            clearInterval(timer);
            gameRunning = false;
            message.textContent = "시간 초과!";
        }

    },1000);

    message.textContent = "게임 진행중";
    gameRunning = true;
}

function checkCoins(){

    coins.forEach((coin,index)=>{

        const coinX = parseInt(coin.style.left);
        const coinY = parseInt(coin.style.top);

        if(
            playerX < coinX + 25 &&
            playerX + 35 > coinX &&
            playerY < coinY + 25 &&
            playerY + 35 > coinY
        ){

            coin.remove();

            coins.splice(index,1);

            score++;
            scoreText.textContent = score;

            if(score === 10){

                gameRunning = false;
                clearInterval(timer);

                message.textContent = "승리!";
            }
        }
    });
}

document.addEventListener("keydown",(e)=>{

    if(!gameRunning) return;

    if(e.key==="ArrowUp") playerY-=15;
    if(e.key==="ArrowDown") playerY+=15;
    if(e.key==="ArrowLeft") playerX-=15;
    if(e.key==="ArrowRight") playerX+=15;

    playerX = Math.max(0,Math.min(playerX,465));
    playerY = Math.max(0,Math.min(playerY,365));

    player.style.left = playerX+"px";
    player.style.top = playerY+"px";

    checkCoins();
});

document.getElementById("start-btn").addEventListener("click",startGame);
document.getElementById("restart-btn").addEventListener("click",startGame);