const board = document.getElementById("game-board");
const player = document.getElementById("player");
const scoreText = document.getElementById("score");
const timeText = document.getElementById("time");
const message = document.getElementById("message");

let score = 0;
let time = 30;
let gameRunning = false;

let playerX = 420;
let playerY = 300;

let timer;
let bgmInterval;
let acorns = [];
let audioContext;

const boardWidth = 900;
const boardHeight = 520;
const playerWidth = 90;
const playerHeight = 90;
const acornSize = 26;
const totalAcorns = 10;
const moveSpeed = 4.8;

const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

function initAudio(){
    if(!audioContext){
        audioContext = new AudioContext();
    }
}

function playNote(frequency, duration, volume, type){
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.value = volume;

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.start();
    osc.stop(audioContext.currentTime + duration);
}

function startBGM(){
    stopBGM();

    const melody = [523, 659, 784, 659, 698, 784, 880, 784];
    let noteIndex = 0;

    bgmInterval = setInterval(() => {
        playNote(melody[noteIndex], 0.16, 0.035, "triangle");

        noteIndex++;

        if(noteIndex >= melody.length){
            noteIndex = 0;
        }
    }, 190);
}

function stopBGM(){
    if(bgmInterval){
        clearInterval(bgmInterval);
        bgmInterval = null;
    }
}

function playAcornSound(){
    playNote(700, 0.08, 0.12, "square");

    setTimeout(() => {
        playNote(950, 0.08, 0.1, "square");
    }, 60);
}

function playWinSound(){
    const notes = [523, 659, 784, 1046];

    notes.forEach((note, index) => {
        setTimeout(() => {
            playNote(note, 0.2, 0.15, "triangle");
        }, index * 180);
    });
}

function createAcorns(){
    document.querySelectorAll(".acorn").forEach(acorn => acorn.remove());
    acorns = [];

    for(let i = 0; i < totalAcorns; i++){
        const acorn = document.createElement("div");
        acorn.classList.add("acorn");

        const x = 40 + Math.random() * (boardWidth - 90);
        const y = 250 + Math.random() * 210;

        acorn.style.left = x + "px";
        acorn.style.top = y + "px";

        board.appendChild(acorn);
        acorns.push(acorn);
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

    playerX = 420;
    playerY = 300;

    updatePlayerPosition();
    createAcorns();

    clearInterval(timer);

    timer = setInterval(() => {
        time--;
        timeText.textContent = time;

        if(time <= 0){
            gameRunning = false;
            clearInterval(timer);
            stopBGM();
            message.textContent = "시간 초과! 다람쥐가 도토리를 다 모으지 못했어요.";
        }
    }, 1000);

    message.textContent = "다람쥐가 숲속에서 도토리를 찾는 중!";
}

function updatePlayerPosition(){
    player.style.transform = `translate(${playerX}px, ${playerY}px)`;
}

function checkAcorns(){
    acorns.forEach((acorn, index) => {
        const acornX = parseInt(acorn.style.left);
        const acornY = parseInt(acorn.style.top);

        if(
            playerX < acornX + acornSize &&
            playerX + playerWidth > acornX &&
            playerY < acornY + acornSize &&
            playerY + playerHeight > acornY
        ){
            acorn.remove();
            acorns.splice(index, 1);

            score++;
            scoreText.textContent = score;

            playAcornSound();

            if(score === totalAcorns){
                gameRunning = false;
                clearInterval(timer);
                stopBGM();
                playWinSound();
                message.textContent = "성공! 다람쥐가 도토리를 모두 모았습니다!";
            }
        }
    });
}

function gameLoop(){
    if(gameRunning){
        let moving = false;

        if(keys.ArrowUp){
            playerY -= moveSpeed;
            moving = true;
        }

        if(keys.ArrowDown){
            playerY += moveSpeed;
            moving = true;
        }

        if(keys.ArrowLeft){
            playerX -= moveSpeed;
            moving = true;
            player.classList.add("left");
        }

        if(keys.ArrowRight){
            playerX += moveSpeed;
            moving = true;
            player.classList.remove("left");
        }

        playerX = Math.max(0, Math.min(playerX, boardWidth - playerWidth));
        playerY = Math.max(210, Math.min(playerY, boardHeight - playerHeight));

        if(moving){
            player.classList.add("moving");
            updatePlayerPosition();
            checkAcorns();
        }else{
            player.classList.remove("moving");
        }
    }

    requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", (e) => {
    if(e.key in keys){
        keys[e.key] = true;
    }
});

document.addEventListener("keyup", (e) => {
    if(e.key in keys){
        keys[e.key] = false;
    }
});

document.getElementById("start-btn").addEventListener("click", startGame);
document.getElementById("restart-btn").addEventListener("click", startGame);

gameLoop();