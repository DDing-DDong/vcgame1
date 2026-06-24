const board = document.getElementById("game-board");
const player = document.getElementById("player");
const scoreText = document.getElementById("score");
const timeText = document.getElementById("time");
const message = document.getElementById("message");

let score = 0;
let time = 30;
let gameRunning = false;

let playerX = 430;
let playerY = 300;

let timer;
let bgmInterval;
let acorns = [];

let audioContext;

const boardWidth = 900;
const boardHeight = 520;
const playerSize = 52;
const acornSize = 26;
const totalAcorns = 10;

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

    playerX = 430;
    playerY = 300;

    player.style.left = playerX + "px";
    player.style.top = playerY + "px";

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

function checkAcorns(){
    acorns.forEach((acorn, index) => {
        const acornX = parseInt(acorn.style.left);
        const acornY = parseInt(acorn.style.top);

        if(
            playerX < acornX + acornSize &&
            playerX + playerSize > acornX &&
            playerY < acornY + acornSize &&
            playerY + playerSize > acornY
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

function movePlayer(){
    playerX = Math.max(0, Math.min(playerX, boardWidth - playerSize));
    playerY = Math.max(210, Math.min(playerY, boardHeight - playerSize));

    player.style.left = playerX + "px";
    player.style.top = playerY + "px";

    checkAcorns();
}

document.addEventListener("keydown", (e) => {
    if(!gameRunning) return;

    if(e.key === "ArrowUp") playerY -= 15;
    if(e.key === "ArrowDown") playerY += 15;
    if(e.key === "ArrowLeft") playerX -= 15;
    if(e.key === "ArrowRight") playerX += 15;

    movePlayer();
});

document.getElementById("start-btn").addEventListener("click", startGame);
document.getElementById("restart-btn").addEventListener("click", startGame);