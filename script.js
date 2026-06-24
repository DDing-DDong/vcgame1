const board = document.getElementById("game-board");
const player = document.getElementById("player");
const scoreText = document.getElementById("score");
const targetText = document.getElementById("target");
const timeText = document.getElementById("time");
const stageText = document.getElementById("stage");
const message = document.getElementById("message");
const unlockMessage = document.getElementById("unlock-message");

const stage1Btn = document.getElementById("stage1-btn");
const stage2Btn = document.getElementById("stage2-btn");
const infiniteBtn = document.getElementById("infinite-btn");
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");

let score = 0;
let time = 30;
let targetAcorns = 10;
let currentMode = "stage1";
let gameRunning = false;

let stage2Unlocked = false;
let infiniteUnlocked = false;

let playerX = 420;
let playerY = 300;

let timer;
let bgmInterval;
let obstacleInterval;
let acorns = [];
let obstacles = [];
let audioContext;

const boardWidth = 900;
const boardHeight = 520;
const playerWidth = 90;
const playerHeight = 90;
const acornSize = 26;
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

function playHitSound(){
    playNote(180, 0.2, 0.18, "sawtooth");
}

function updateModeButtons(){
    stage1Btn.classList.remove("selected-mode");
    stage2Btn.classList.remove("selected-mode");
    infiniteBtn.classList.remove("selected-mode");

    if(currentMode === "stage1") stage1Btn.classList.add("selected-mode");
    if(currentMode === "stage2") stage2Btn.classList.add("selected-mode");
    if(currentMode === "infinite") infiniteBtn.classList.add("selected-mode");

    if(gameRunning){
        stage1Btn.disabled = true;
        stage2Btn.disabled = true;
        infiniteBtn.disabled = true;
    }else{
        stage1Btn.disabled = false;
        stage2Btn.disabled = !stage2Unlocked;
        infiniteBtn.disabled = !infiniteUnlocked;
    }
}

function selectMode(mode){
    if(gameRunning){
        unlockMessage.textContent = "게임 진행 중에는 모드를 바꿀 수 없습니다!";
        return;
    }

    if(mode === "stage2" && !stage2Unlocked){
        unlockMessage.textContent = "1단계를 먼저 클리어해야 2단계가 열립니다!";
        return;
    }

    if(mode === "infinite" && !infiniteUnlocked){
        unlockMessage.textContent = "2단계를 먼저 클리어해야 무한모드가 열립니다!";
        return;
    }

    currentMode = mode;

    if(mode === "stage1"){
        stageText.textContent = "1단계";
        targetAcorns = 10;
        time = 30;
        message.textContent = "1단계: 도토리 10개를 모으세요!";
        unlockMessage.textContent = stage2Unlocked ? "2단계가 해금되었습니다!" : "1단계를 클리어하면 2단계가 해금됩니다!";
    }

    if(mode === "stage2"){
        stageText.textContent = "2단계";
        targetAcorns = 20;
        time = 45;
        message.textContent = "2단계: 장애물을 피하며 도토리 20개를 모으세요!";
        unlockMessage.textContent = infiniteUnlocked ? "무한모드가 해금되었습니다!" : "2단계를 클리어하면 무한모드가 해금됩니다!";
    }

    if(mode === "infinite"){
        stageText.textContent = "무한모드";
        targetAcorns = 999;
        time = 60;
        message.textContent = "무한모드: 제한 시간 동안 최대한 많은 도토리를 모으세요!";
        unlockMessage.textContent = "무한모드 선택 완료!";
    }

    score = 0;
    scoreText.textContent = score;
    targetText.textContent = currentMode === "infinite" ? "∞" : targetAcorns;
    timeText.textContent = time;

    updateModeButtons();
}

function clearObjects(){
    document.querySelectorAll(".acorn").forEach(acorn => acorn.remove());
    document.querySelectorAll(".obstacle").forEach(obstacle => obstacle.remove());

    acorns = [];
    obstacles = [];
}

function createAcorns(){
    document.querySelectorAll(".acorn").forEach(acorn => acorn.remove());
    acorns = [];

    let count = currentMode === "stage1" ? 10 : 8;

    for(let i = 0; i < count; i++){
        createOneAcorn();
    }
}

function createOneAcorn(){
    const acorn = document.createElement("div");
    acorn.classList.add("acorn");

    const x = 40 + Math.random() * (boardWidth - 90);
    const y = 40 + Math.random() * (boardHeight - 90);

    acorn.style.left = x + "px";
    acorn.style.top = y + "px";

    board.appendChild(acorn);
    acorns.push(acorn);
}

function startGame(){
    initAudio();
    startBGM();

    clearInterval(timer);
    clearInterval(obstacleInterval);
    clearObjects();

    score = 0;
    gameRunning = true;

    if(currentMode === "stage1"){
        targetAcorns = 10;
        time = 30;
        stageText.textContent = "1단계";
    }

    if(currentMode === "stage2"){
        targetAcorns = 20;
        time = 45;
        stageText.textContent = "2단계";
    }

    if(currentMode === "infinite"){
        targetAcorns = 999;
        time = 60;
        stageText.textContent = "무한모드";
    }

    scoreText.textContent = score;
    targetText.textContent = currentMode === "infinite" ? "∞" : targetAcorns;
    timeText.textContent = time;

    playerX = 420;
    playerY = 300;

    updatePlayerPosition();
    createAcorns();
    updateModeButtons();

    if(currentMode === "stage2" || currentMode === "infinite"){
        startObstacleSpawn();
    }

    timer = setInterval(() => {
        time--;
        timeText.textContent = time;

        if(time <= 0){
            if(currentMode === "infinite"){
                endGame(`무한모드 종료! 최종 도토리: ${score}개`);
            }else{
                endGame("시간 초과! 다람쥐가 도토리를 다 모으지 못했어요.");
            }
        }
    }, 1000);

    if(currentMode === "stage1"){
        message.textContent = "1단계 진행 중! 도토리 10개를 모으세요.";
        unlockMessage.textContent = "1단계 플레이 중!";
    }

    if(currentMode === "stage2"){
        message.textContent = "2단계 진행 중! 부엉이와 독수리를 피하세요.";
        unlockMessage.textContent = "2단계 플레이 중!";
    }

    if(currentMode === "infinite"){
        message.textContent = "무한모드 진행 중! 최대한 많이 모으세요.";
        unlockMessage.textContent = "무한모드 플레이 중!";
    }
}

function startObstacleSpawn(){
    obstacleInterval = setInterval(() => {
        createObstacle("owl");

        if(Math.random() > 0.45){
            createObstacle("eagle");
        }
    }, 1400);
}

function createObstacle(type){
    const obstacle = document.createElement("div");
    obstacle.classList.add("obstacle");

    if(type === "owl"){
        obstacle.classList.add("owl");
        obstacle.textContent = "🦉";
    }else{
        obstacle.classList.add("eagle");
        obstacle.textContent = "🦅";
    }

    const direction = Math.floor(Math.random() * 4);
    let x;
    let y;
    let speedX = 0;
    let speedY = 0;

    const speed = type === "owl" ? 2.2 : 4.2;

    if(direction === 0){
        x = -70;
        y = Math.random() * (boardHeight - 60);
        speedX = speed;
    }

    if(direction === 1){
        x = boardWidth + 70;
        y = Math.random() * (boardHeight - 60);
        speedX = -speed;
    }

    if(direction === 2){
        x = Math.random() * (boardWidth - 60);
        y = -70;
        speedY = speed;
    }

    if(direction === 3){
        x = Math.random() * (boardWidth - 60);
        y = boardHeight + 70;
        speedY = -speed;
    }

    obstacle.style.left = x + "px";
    obstacle.style.top = y + "px";

    obstacle.dataset.x = x;
    obstacle.dataset.y = y;
    obstacle.dataset.speedX = speedX;
    obstacle.dataset.speedY = speedY;

    board.appendChild(obstacle);
    obstacles.push(obstacle);
}

function updateObstacles(){
    obstacles.forEach((obstacle, index) => {
        let x = Number(obstacle.dataset.x);
        let y = Number(obstacle.dataset.y);
        const speedX = Number(obstacle.dataset.speedX);
        const speedY = Number(obstacle.dataset.speedY);

        x += speedX;
        y += speedY;

        obstacle.dataset.x = x;
        obstacle.dataset.y = y;
        obstacle.style.left = x + "px";
        obstacle.style.top = y + "px";

        if(x < -120 || x > boardWidth + 120 || y < -120 || y > boardHeight + 120){
            obstacle.remove();
            obstacles.splice(index, 1);
        }
    });
}

function checkObstacleCollision(){
    obstacles.forEach((obstacle) => {
        const obstacleX = Number(obstacle.dataset.x);
        const obstacleY = Number(obstacle.dataset.y);
        const obstacleSize = 55;

        if(
            playerX < obstacleX + obstacleSize &&
            playerX + playerWidth > obstacleX &&
            playerY < obstacleY + obstacleSize &&
            playerY + playerHeight > obstacleY
        ){
            playHitSound();
            endGame("실패! 장애물에 부딪혔습니다. 다시 시작해보세요!");
        }
    });
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

            if(currentMode === "stage2" || currentMode === "infinite"){
                createOneAcorn();
            }

            if(currentMode !== "infinite" && score >= targetAcorns){
                clearStage();
            }
        }
    });
}

function clearStage(){
    gameRunning = false;
    clearInterval(timer);
    clearInterval(obstacleInterval);
    stopBGM();
    playWinSound();

    if(currentMode === "stage1"){
        stage2Unlocked = true;
        unlockMessage.textContent = "성공! 2단계 해금완료!";
        message.textContent = "1단계 클리어! 이제 2단계를 선택할 수 있습니다.";
    }

    if(currentMode === "stage2"){
        infiniteUnlocked = true;
        unlockMessage.textContent = "성공! 무한모드 해금완료!";
        message.textContent = "2단계 클리어! 이제 무한모드를 선택할 수 있습니다.";
    }

    updateModeButtons();
}

function endGame(resultMessage){
    gameRunning = false;
    clearInterval(timer);
    clearInterval(obstacleInterval);
    stopBGM();

    message.textContent = resultMessage;
    updateModeButtons();
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
        }

        if(keys.ArrowRight){
            playerX += moveSpeed;
            moving = true;
        }

        playerX = Math.max(0, Math.min(playerX, boardWidth - playerWidth));
        playerY = Math.max(0, Math.min(playerY, boardHeight - playerHeight));

        if(moving){
            player.classList.add("moving");
            updatePlayerPosition();
            checkAcorns();
        }else{
            player.classList.remove("moving");
        }

        updateObstacles();
        checkObstacleCollision();
    }

    requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", (e) => {
    if(e.key in keys){
        keys[e.key] = true;
        e.preventDefault();
    }
});

document.addEventListener("keyup", (e) => {
    if(e.key in keys){
        keys[e.key] = false;
    }
});

stage1Btn.addEventListener("click", () => selectMode("stage1"));
stage2Btn.addEventListener("click", () => selectMode("stage2"));
infiniteBtn.addEventListener("click", () => selectMode("infinite"));

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);

selectMode("stage1");
gameLoop();