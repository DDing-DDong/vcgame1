const board = document.getElementById("game-board");
const player = document.getElementById("player");
const scoreText = document.getElementById("score");
const targetText = document.getElementById("target");
const timeText = document.getElementById("time");
const stageText = document.getElementById("stage");
const message = document.getElementById("message");
const unlockMessage = document.getElementById("unlock-message");

const startOverlay = document.getElementById("start-overlay");
const startTitle = document.getElementById("start-title");
const startText = document.getElementById("start-text");
const overlayStartBtn = document.getElementById("overlay-start-btn");

const resultBox = document.getElementById("result-box");
const resultTitle = document.getElementById("result-title");
const resultText = document.getElementById("result-text");
const resultButtonBox = document.getElementById("result-button-box");

const rankingInputBox = document.getElementById("ranking-input-box");
const playerNameInput = document.getElementById("player-name");
const saveRankBtn = document.getElementById("save-rank-btn");
const rankingList = document.getElementById("ranking-list");

const stage1Btn = document.getElementById("stage1-btn");
const stage2Btn = document.getElementById("stage2-btn");
const infiniteBtn = document.getElementById("infinite-btn");

const shieldTimer = document.getElementById("shield-timer");
const shieldEffect = document.querySelector(".shield-effect");

let score = 0;
let time = 30;
let targetBananas = 10;
let currentMode = "stage1";
let gameRunning = false;

let stage2Unlocked = false;
let infiniteUnlocked = false;

let playerX = 420;
let playerY = 300;

let timer;
let bgmInterval;
let obstacleInterval;
let shieldSpawnInterval;

let bananas = [];
let obstacles = [];
let shieldItems = [];

let shieldActive = false;
let shieldEndTime = 0;

let audioContext;

const boardWidth = 900;
const boardHeight = 520;
const playerWidth = 90;
const playerHeight = 90;
const bananaSize = 56;
const shieldSize = 34;
const moveSpeed = 4.8;

const infiniteBananaTypes = [
    { type: "normal", score: 1, lifetime: 4000, chance: 0.75 },
    { type: "gold", score: 5, lifetime: 3000, chance: 0.15 },
    { type: "rainbow", score: 10, lifetime: 2000, chance: 0.05 },
    { type: "rotten", score: -3, lifetime: 5000, chance: 0.05 }
];

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

function playBananaSound(){
    playNote(700, 0.08, 0.12, "square");

    setTimeout(() => {
        playNote(950, 0.08, 0.1, "square");
    }, 60);
}

function playShieldSound(){
    playNote(520, 0.08, 0.12, "sine");

    setTimeout(() => {
        playNote(780, 0.1, 0.12, "sine");
    }, 80);
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

function showStartOverlay(){
    startOverlay.classList.remove("hidden");

    if(currentMode === "stage1"){
        startTitle.textContent = "1단계 시작";
        startText.textContent = "바나나 10개를 모으면 2단계가 해금됩니다.";
    }

    if(currentMode === "stage2"){
        startTitle.textContent = "2단계 시작";
        startText.textContent = "장애물을 피하면서 바나나 20개를 모으세요. 방어막을 먹으면 3초간 무적입니다.";
    }

    if(currentMode === "infinite"){
        startTitle.textContent = "무한모드 시작";
        startText.textContent = "제한 시간 동안 최대한 많은 바나나를 모으세요. 방어막을 활용하세요!";
    }
}

function hideStartOverlay(){
    startOverlay.classList.add("hidden");
}

function showResult(title, text, type){
    resultTitle.textContent = title;
    resultText.textContent = text;
    resultBox.classList.remove("hidden");

    rankingInputBox.classList.add("hidden");
    resultButtonBox.innerHTML = "";

    if(type === "stage-clear"){
        const nextButton = document.createElement("button");
        nextButton.textContent = "다음 단계 시작";
        nextButton.classList.add("result-btn", "next-btn");
        nextButton.addEventListener("click", goNextStage);

        const retryButton = document.createElement("button");
        retryButton.textContent = "다시 시작";
        retryButton.classList.add("result-btn", "retry-btn");
        retryButton.addEventListener("click", startGame);

        resultButtonBox.appendChild(nextButton);
        resultButtonBox.appendChild(retryButton);
    }

    if(type === "fail"){
        const retryButton = document.createElement("button");
        retryButton.textContent = "다시 시작";
        retryButton.classList.add("result-btn", "retry-btn");
        retryButton.addEventListener("click", startGame);

        resultButtonBox.appendChild(retryButton);
    }

    if(type === "infinite"){
        playerNameInput.value = "";
        rankingInputBox.classList.remove("hidden");

        const retryButton = document.createElement("button");
        retryButton.textContent = "다시 시작";
        retryButton.classList.add("result-btn", "retry-btn");
        retryButton.addEventListener("click", startGame);

        resultButtonBox.appendChild(retryButton);
        renderRanking();
    }
}

function hideResult(){
    resultBox.classList.add("hidden");
    playerNameInput.value = "";
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

    hideResult();
    currentMode = mode;

    if(mode === "stage1"){
        stageText.textContent = "1단계";
        targetBananas = 10;
        time = 30;
        message.textContent = "1단계를 선택했습니다.";
        unlockMessage.textContent = stage2Unlocked ? "2단계가 해금되었습니다!" : "1단계를 클리어하면 2단계가 해금됩니다!";
    }

    if(mode === "stage2"){
        stageText.textContent = "2단계";
        targetBananas = 20;
        time = 45;
        message.textContent = "2단계를 선택했습니다.";
        unlockMessage.textContent = infiniteUnlocked ? "무한모드가 해금되었습니다!" : "2단계를 클리어하면 무한모드가 해금됩니다!";
    }

    if(mode === "infinite"){
        stageText.textContent = "무한모드";
        targetBananas = 999;
        time = 60;
        message.textContent = "무한모드를 선택했습니다.";
        unlockMessage.textContent = "무한모드 선택 완료!";
    }

    score = 0;
    scoreText.textContent = score;
    targetText.textContent = currentMode === "infinite" ? "∞" : targetBananas;
    timeText.textContent = time;

    updateModeButtons();
    showStartOverlay();
}

function clearObjects(){
    document.querySelectorAll(".banana").forEach(removeBanana);
    document.querySelectorAll(".obstacle").forEach(obstacle => obstacle.remove());
    document.querySelectorAll(".shield-item").forEach(shield => shield.remove());

    bananas = [];
    obstacles = [];
    shieldItems = [];
}

function createBananas(){
    document.querySelectorAll(".banana").forEach(removeBanana);
    bananas = [];

    let count = currentMode === "stage1" ? 10 : 8;

    for(let i = 0; i < count; i++){
        createOneBanana();
    }
}

function createOneBanana(){
    const banana = document.createElement("div");
    banana.classList.add("banana");
    banana.dataset.score = "1";

    if(currentMode === "infinite"){
        const bananaType = getInfiniteBananaType();
        banana.classList.add("infinite-banana", `${bananaType.type}-banana`);
        banana.dataset.type = bananaType.type;
        banana.dataset.score = bananaType.score;
        banana.dataset.lifetime = bananaType.lifetime;

        banana.fadeTimerId = setTimeout(() => {
            banana.classList.add("banana-fading");
        }, Math.max(0, bananaType.lifetime - 1000));

        banana.expireTimerId = setTimeout(() => {
            removeBanana(banana);
        }, bananaType.lifetime);
    }

    const x = 40 + Math.random() * (boardWidth - 90);
    const y = 40 + Math.random() * (boardHeight - 90);

    banana.style.left = x + "px";
    banana.style.top = y + "px";

    board.appendChild(banana);
    bananas.push(banana);
}

function getInfiniteBananaType(){
    const roll = Math.random();
    let accumulatedChance = 0;

    for(const bananaType of infiniteBananaTypes){
        accumulatedChance += bananaType.chance;

        if(roll <= accumulatedChance){
            return bananaType;
        }
    }

    return infiniteBananaTypes[0];
}

function removeBanana(banana){
    clearTimeout(banana.fadeTimerId);
    clearTimeout(banana.expireTimerId);
    banana.remove();

    const index = bananas.indexOf(banana);

    if(index !== -1){
        bananas.splice(index, 1);
    }
}

function createShieldItem(){
    if(shieldItems.length > 0) return;

    const shield = document.createElement("div");
    shield.classList.add("shield-item");
    shield.textContent = "🛡️";

    const x = 40 + Math.random() * (boardWidth - 90);
    const y = 40 + Math.random() * (boardHeight - 90);

    shield.style.left = x + "px";
    shield.style.top = y + "px";

    board.appendChild(shield);
    shieldItems.push(shield);
}

function startShieldSpawn(){
    if(currentMode === "stage1") return;

    createShieldItem();

    shieldSpawnInterval = setInterval(() => {
        createShieldItem();
    }, 9000);
}

function activateShield(){
    shieldActive = true;
    shieldEndTime = Date.now() + 3000;

    shieldEffect.classList.remove("hidden");
    shieldTimer.classList.remove("hidden");

    playShieldSound();
}

function updateShield(){
    if(!shieldActive) return;

    const remain = Math.ceil((shieldEndTime - Date.now()) / 1000);

    shieldTimer.textContent = remain;

    if(remain <= 0){
        shieldActive = false;
        shieldEffect.classList.add("hidden");
        shieldTimer.classList.add("hidden");
    }
}

function resetShield(){
    shieldActive = false;
    shieldEndTime = 0;
    shieldEffect.classList.add("hidden");
    shieldTimer.classList.add("hidden");
}

function checkShieldItems(){
    shieldItems.forEach((shield, index) => {
        const shieldX = parseInt(shield.style.left);
        const shieldY = parseInt(shield.style.top);

        if(
            playerX < shieldX + shieldSize &&
            playerX + playerWidth > shieldX &&
            playerY < shieldY + shieldSize &&
            playerY + playerHeight > shieldY
        ){
            shield.remove();
            shieldItems.splice(index, 1);
            activateShield();
        }
    });
}

function startGame(){
    initAudio();
    startBGM();

    hideStartOverlay();
    hideResult();

    clearInterval(timer);
    clearInterval(obstacleInterval);
    clearInterval(shieldSpawnInterval);

    resetShield();
    clearObjects();

    score = 0;
    gameRunning = true;

    if(currentMode === "stage1"){
        targetBananas = 10;
        time = 30;
        stageText.textContent = "1단계";
    }

    if(currentMode === "stage2"){
        targetBananas = 20;
        time = 45;
        stageText.textContent = "2단계";
    }

    if(currentMode === "infinite"){
        targetBananas = 999;
        time = 60;
        stageText.textContent = "무한모드";
    }

    scoreText.textContent = score;
    targetText.textContent = currentMode === "infinite" ? "∞" : targetBananas;
    timeText.textContent = time;

    playerX = 420;
    playerY = 300;

    updatePlayerPosition();
    createBananas();
    updateModeButtons();

    if(currentMode === "stage2" || currentMode === "infinite"){
        startObstacleSpawn();
        startShieldSpawn();
    }

    timer = setInterval(() => {
        time--;
        timeText.textContent = time;

        if(time <= 0){
            if(currentMode === "infinite"){
                endInfiniteMode();
            }else{
                endGame("시간 초과!", "원숭이가 바나나를 다 모으지 못했어요.", "fail");
            }
        }
    }, 1000);

    if(currentMode === "stage1"){
        message.textContent = "1단계 진행 중! 바나나 10개를 모으세요.";
        unlockMessage.textContent = "1단계 플레이 중!";
    }

    if(currentMode === "stage2"){
        message.textContent = "2단계 진행 중! 방어막을 먹으면 3초간 무적입니다.";
        unlockMessage.textContent = "2단계 플레이 중!";
    }

    if(currentMode === "infinite"){
        message.textContent = "무한모드 진행 중! 방어막을 활용해 오래 버티세요.";
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
    }else{
        obstacle.classList.add("eagle");
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
    obstacles.forEach((obstacle, index) => {
        const obstacleX = Number(obstacle.dataset.x);
        const obstacleY = Number(obstacle.dataset.y);
        const obstacleSize = 55;

        if(
            playerX < obstacleX + obstacleSize &&
            playerX + playerWidth > obstacleX &&
            playerY < obstacleY + obstacleSize &&
            playerY + playerHeight > obstacleY
        ){
            if(shieldActive){
                obstacle.remove();
                obstacles.splice(index, 1);
                playShieldSound();
                return;
            }

            playHitSound();

            if(currentMode === "infinite"){
                endInfiniteMode();
            }else{
                endGame("게임 실패!", "장애물에 부딪혔습니다. 다시 시작해보세요.", "fail");
            }
        }
    });
}

function updatePlayerPosition(){
    player.style.transform = `translate(${playerX}px, ${playerY}px)`;
}

function checkBananas(){
    bananas.forEach((banana, index) => {
        const bananaX = parseInt(banana.style.left);
        const bananaY = parseInt(banana.style.top);

        if(
            playerX < bananaX + bananaSize &&
            playerX + playerWidth > bananaX &&
            playerY < bananaY + bananaSize &&
            playerY + playerHeight > bananaY
        ){
            const bananaScore = Number(banana.dataset.score || 1);
            removeBanana(banana);

            score = Math.max(0, score + bananaScore);
            scoreText.textContent = score;

            playBananaSound();

            if(currentMode === "stage2" || currentMode === "infinite"){
                createOneBanana();
            }

            if(currentMode !== "infinite" && score >= targetBananas){
                clearStage();
            }
        }
    });
}

function clearStage(){
    gameRunning = false;
    clearInterval(timer);
    clearInterval(obstacleInterval);
    clearInterval(shieldSpawnInterval);
    stopBGM();
    resetShield();
    playWinSound();

    if(currentMode === "stage1"){
        stage2Unlocked = true;
        unlockMessage.textContent = "성공! 2단계 해금완료!";
        message.textContent = "1단계 클리어!";
        showResult("1단계 클리어!", "성공! 2단계 해금완료!", "stage-clear");
    }

    if(currentMode === "stage2"){
        infiniteUnlocked = true;
        unlockMessage.textContent = "성공! 무한모드 해금완료!";
        message.textContent = "2단계 클리어!";
        showResult("2단계 클리어!", "성공! 무한모드 해금완료!", "stage-clear");
    }

    updateModeButtons();
}

function endGame(title, text, type){
    gameRunning = false;
    clearInterval(timer);
    clearInterval(obstacleInterval);
    clearInterval(shieldSpawnInterval);
    stopBGM();
    resetShield();

    message.textContent = title;
    showResult(title, text, type);
    updateModeButtons();
}

function endInfiniteMode(){
    gameRunning = false;
    clearInterval(timer);
    clearInterval(obstacleInterval);
    clearInterval(shieldSpawnInterval);
    stopBGM();
    resetShield();

    message.textContent = "무한모드 종료!";
    showResult("무한모드 종료!", `최종 바나나: ${score}개`, "infinite");
    updateModeButtons();
}

function goNextStage(){
    if(currentMode === "stage1" && stage2Unlocked){
        selectMode("stage2");
        startGame();
        return;
    }

    if(currentMode === "stage2" && infiniteUnlocked){
        selectMode("infinite");
        startGame();
    }
}

function getRankings(){
    const savedRankings = localStorage.getItem("monkeyRankings");

    if(savedRankings){
        return JSON.parse(savedRankings);
    }

    return [];
}

function saveRankings(rankings){
    localStorage.setItem("monkeyRankings", JSON.stringify(rankings));
}

function renderRanking(){
    const rankings = getRankings();
    rankingList.innerHTML = "";

    if(rankings.length === 0){
        const empty = document.createElement("li");
        empty.classList.add("empty-rank");
        empty.textContent = "아직 등록된 기록이 없습니다.";
        rankingList.appendChild(empty);
        return;
    }

    rankings.slice(0, 10).forEach((rank, index) => {
        const li = document.createElement("li");

        const medal = document.createElement("span");
        medal.classList.add("rank-medal");

        if(index === 0) medal.textContent = "🥇";
        if(index === 1) medal.textContent = "🥈";
        if(index === 2) medal.textContent = "🥉";
        if(index > 2) medal.textContent = `${index + 1}위`;

        const name = document.createElement("span");
        name.classList.add("rank-name");
        name.textContent = rank.name;

        const scoreValue = document.createElement("span");
        scoreValue.classList.add("rank-score");
        scoreValue.textContent = `${rank.score}개`;

        li.appendChild(medal);
        li.appendChild(name);
        li.appendChild(scoreValue);

        rankingList.appendChild(li);
    });
}

function saveRanking(){
    const name = playerNameInput.value.trim();

    if(name === ""){
        alert("이름을 입력해주세요.");
        return;
    }

    const rankings = getRankings();

    rankings.push({
        name: name,
        score: score,
        createdAt: Date.now()
    });

    rankings.sort((a, b) => {
        if(b.score === a.score){
            return a.createdAt - b.createdAt;
        }

        return b.score - a.score;
    });

    saveRankings(rankings.slice(0, 10));

    playerNameInput.value = "";
    rankingInputBox.classList.add("hidden");
    renderRanking();
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
            checkBananas();
            checkShieldItems();
        }else{
            player.classList.remove("moving");
        }

        updateShield();
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

overlayStartBtn.addEventListener("click", startGame);
saveRankBtn.addEventListener("click", saveRanking);

selectMode("stage1");
renderRanking();
gameLoop();
