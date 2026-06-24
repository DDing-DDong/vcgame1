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

let audioContext;
let bgmOscillator;
let bgmGain;

function initAudio(){
    if(!audioContext){
        audioContext = new AudioContext();
    }
}

function startBGM(){
    stopBGM();

    bgmOscillator = audioContext.createOscillator();
    bgmGain = audioContext.createGain();

    bgmOscillator.type = "sine";
    bgmOscillator.frequency.value = 220;

    bgmGain.gain.value = 0.04;

    bgmOscillator.connect(bgmGain);
    bgmGain.connect(audioContext.destination);

    bgmOscillator.start();
}

function stopBGM(){
    if(bgmOscillator){
        bgmOscillator.stop();
        bgmOscillator.disconnect();
        bgmOscillator = null;
    }
}

function playCoinSound(){
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = "square";
    osc.frequency.value = 700;
    gain.gain.value = 0.12;

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.start();
    osc.stop(audioContext.currentTime + 0.1);
}

function playWinSound(){
    const notes = [523, 659, 784, 1046];

    notes.forEach((note, index)=>{
        setTimeout(()=>{
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();

            osc.type = "triangle";
            osc.frequency.value = note;
            gain.gain.value = 0.15;

            osc.connect(gain);
            gain.connect(audioContext.destination);

            osc.start();
            osc.stop(audioContext.currentTime + 0.2);
        }, index * 180);
    });
}

function createCoins(){
    document.querySelectorAll(".coin").forEach(c => c.remove());
    coins = [];

    for(let i=0; i<10; i++){
        const coin = document.createElement("div");
        coin.classList.add("coin");

        const x = Math.random() * 460;
        const y = Math.random() * 360;

        coin.style.left = x + "px";
        coin.style.top = y + "px";

        board.appendChild(coin);
        coins.push(coin);
    }
}

function startGame(){
    initAudio();
    startBGM();

    score = 0;
    time = 30;
    gameRunning = true;

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
            stopBGM();
            message.textContent = "시간 초과!";
        }
    },1000);

    message.textContent = "게임 진행중";
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

            playCoinSound();

            if(score === 10){
                gameRunning = false;
                clearInterval(timer);
                stopBGM();
                playWinSound();
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

board.addEventListener("mousemove",(e)=>{
    if(!gameRunning) return;

    const rect = board.getBoundingClientRect();

    playerX = e.clientX - rect.left - 17.5;
    playerY = e.clientY - rect.top - 17.5;

    playerX = Math.max(0,Math.min(playerX,465));
    playerY = Math.max(0,Math.min(playerY,365));

    player.style.left = playerX+"px";
    player.style.top = playerY+"px";

    checkCoins();
});

document.getElementById("start-btn").addEventListener("click",startGame);
document.getElementById("restart-btn").addEventListener("click",startGame);