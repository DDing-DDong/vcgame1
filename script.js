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
let bgmInterval;
let seeds = [];

let audioContext;

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
        playNote(melody[noteIndex], 0.16, 0.04, "triangle");

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

function playSeedSound(){
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

function createSeeds(){
    document.querySelectorAll(".seed").forEach(seed => seed.remove());
    seeds = [];

    for(let i = 0; i < 10; i++){
        const seed = document.createElement("div");
        seed.classList.add("seed");

        const x = Math.random() * 460;
        const y = Math.random() * 360;

        seed.style.left = x + "px";
        seed.style.top = y + "px";

        board.appendChild(seed);
        seeds.push(seed);
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

    createSeeds();

    clearInterval(timer);

    timer = setInterval(() => {
        time--;
        timeText.textContent = time;

        if(time <= 0){
            gameRunning = false;
            clearInterval(timer);
            stopBGM();
            message.textContent = "시간 초과! 햄스터가 씨앗을 다 찾지 못했어요.";
        }
    }, 1000);

    message.textContent = "햄스터가 씨앗을 찾는 중!";
}

function checkSeeds(){
    seeds.forEach((seed, index) => {
        const seedX = parseInt(seed.style.left);
        const seedY = parseInt(seed.style.top);

        if(
            playerX < seedX + 25 &&
            playerX + 35 > seedX &&
            playerY < seedY + 25 &&
            playerY + 35 > seedY
        ){
            seed.remove();
            seeds.splice(index, 1);

            score++;
            scoreText.textContent = score;

            playSeedSound();

            if(score === 10){
                gameRunning = false;
                clearInterval(timer);
                stopBGM();
                playWinSound();
                message.textContent = "성공! 햄스터가 씨앗을 모두 찾았습니다!";
            }
        }
    });
}

document.addEventListener("keydown", (e) => {
    if(!gameRunning) return;

    if(e.key === "ArrowUp") playerY -= 15;
    if(e.key === "ArrowDown") playerY += 15;
    if(e.key === "ArrowLeft") playerX -= 15;
    if(e.key === "ArrowRight") playerX += 15;

    playerX = Math.max(0, Math.min(playerX, 465));
    playerY = Math.max(0, Math.min(playerY, 365));

    player.style.left = playerX + "px";
    player.style.top = playerY + "px";

    checkSeeds();
});

board.addEventListener("mousemove", (e) => {
    if(!gameRunning) return;

    const rect = board.getBoundingClientRect();

    playerX = e.clientX - rect.left - 17.5;
    playerY = e.clientY - rect.top - 17.5;

    playerX = Math.max(0, Math.min(playerX, 465));
    playerY = Math.max(0, Math.min(playerY, 365));

    player.style.left = playerX + "px";
    player.style.top = playerY + "px";

    checkSeeds();
});

document.getElementById("start-btn").addEventListener("click", startGame);
document.getElementById("restart-btn").addEventListener("click", startGame);