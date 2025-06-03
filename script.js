const homeScreen = document.getElementById("home");
const gameScreen = document.getElementById("game");
const resultScreen = document.getElementById("result");
const board = document.getElementById("game-board");
const timerDisplay = document.getElementById("timer");
const scoreDisplay = document.getElementById("score");
const clickSound = document.getElementById("click-sound");
const failSound = document.getElementById("fail-sound");
const endSounds = [
  document.getElementById("end1"),
  document.getElementById("end2"),
  document.getElementById("end3")
];
const insultText = document.getElementById("insult-line");

const photo1 = 'photo1.jpg';
const photo2 = 'photo2.jpg';

const GAME_DURATION = 20;
let time = GAME_DURATION;
let score = 0;
let best = localStorage.getItem("best") || 0;
let interval = null;
let timerStarted = false;
let gameEnded = false;

function showScreen(screen) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  screen.classList.add('active');
}

function startGame() {
  time = GAME_DURATION;
  score = 0;
  timerStarted = false;
  gameEnded = false;
  board.classList.remove("centered");
  timerDisplay.textContent = `倒计时：${time}`;
  scoreDisplay.textContent = `得分：${score}`;
  showScreen(gameScreen);
  initBoard();
}

function initBoard() {
  board.innerHTML = '';
  for (let r = 0; r < 4; r++) {
    board.appendChild(createRow());
  }
}

function createRow() {
  const row = document.createElement('div');
  row.className = 'row';
  const photoCol = Math.floor(Math.random() * 4);
  for (let c = 0; c < 4; c++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    if (c === photoCol) {
      const img = document.createElement('img');
      img.className = 'photo';
      img.src = photo1;
      cell.appendChild(img);
      cell.dataset.correct = '1';
    } else {
      cell.dataset.correct = '0';
    }
    cell.addEventListener('click', () => handleClick(cell));
    row.appendChild(cell);
  }
  return row;
}

function handleClick(cell) {
  if (gameEnded || cell.classList.contains("clicked")) return;

  cell.classList.add("clicked");

  const clickedRowIndex = Array.from(board.children).indexOf(cell.parentElement);
  const bottomRowIndex = board.children.length - 1;

  if (!timerStarted) {
    timerStarted = true;
    interval = setInterval(() => {
      time--;
      timerDisplay.textContent = `倒计时：${time}`;
      if (time <= 0) {
        clearInterval(interval);
        playRandomEndSound();
        endGame(false);
      }
    }, 1000);
  }

  if (clickedRowIndex !== bottomRowIndex || cell.dataset.correct !== '1') {
    triggerFail(cell);
    return;
  }

  try {
    clickSound.currentTime = 0;
    clickSound.play();
  } catch (e) {
    console.warn("Click sound error:", e);
  }

  score++;
  scoreDisplay.textContent = `得分：${score}`;
  board.removeChild(cell.parentElement);
  board.insertBefore(createRow(), board.firstChild);
}

function triggerFail(cell) {
  clearInterval(interval);
  gameEnded = true;
  failSound.play();
  board.classList.add("centered");
  cell.classList.add("error");

  document.querySelectorAll(".cell").forEach(c => {
    const img = c.querySelector("img");
    if (img && img.src.includes(photo1)) {
      img.src = photo2;
      img.classList.add("flashing");
    }
  });

  setTimeout(() => endGame(true), 2000);
}

function playRandomEndSound() {
  const availableSounds = endSounds.filter(sound => sound);
  if (availableSounds.length === 0) return;
  const sound = availableSounds[Math.floor(Math.random() * availableSounds.length)];
  sound.play();
}

function endGame(isFail) {
  gameEnded = true;
  showScreen(resultScreen);
  document.getElementById('final-score').textContent = `接住了 ${score} 个玉玉`;
  document.getElementById('final-speed').textContent = `平均接玉速度：${(score / GAME_DURATION).toFixed(2)} 个/秒`;

  if (score > best) {
    best = score;
    localStorage.setItem("best", best);
  }

  document.getElementById('best-score').textContent = `最佳成绩：${best}`;

  if (score <= 10) {
    const insults = [
      "烂啦那么少",
      "笑死",
      "慕红接的都比你多",
      "别担心 昱宜玩得肯定比你烂"
    ];
    insultText.textContent = insults[Math.floor(Math.random() * insults.length)];
  } else {
    insultText.textContent = '';
  }
}

function goHome() {
  showScreen(homeScreen);
  board.innerHTML = '';
  insultText.textContent = '';
}
