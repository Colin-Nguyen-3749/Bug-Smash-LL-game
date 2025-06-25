const NUM_HOLES = 9;
const BUGS = ['\uD83D\uDC1B', '\uD83D\uDC1E', '\uD83D\uDC1F']; // 🐜, 🐞, 🐟 (as example)
const SQUASHED = '\u274C'; // ❌
const gameBoard = document.getElementById('gameBoard');
const scoreEl = document.getElementById('score');
const timerEl = document.getElementById('timer');
const startBtn = document.getElementById('startBtn');
const gameOverEl = document.getElementById('gameOver');
let score = 0;
let timeLeft = 30; // Start with 30 seconds
let gameActive = false;
let bugTimeouts = [];
let timerInterval = null;
let bugInterval = null;

// Generate holes
function createBoard() {
  gameBoard.innerHTML = '';
  for (let i = 0; i < NUM_HOLES; i++) {
    const hole = document.createElement('div');
    hole.className = 'hole';
    hole.dataset.index = i;
    gameBoard.appendChild(hole);
  }
}

// Show a bug in a random hole
function showBug() {
  if (!gameActive) return;
  const holes = Array.from(document.querySelectorAll('.hole'));
  const emptyHoles = holes.filter(hole => !hole.querySelector('.bug'));
  if (emptyHoles.length === 0) return;
  const hole = emptyHoles[Math.floor(Math.random() * emptyHoles.length)];
  const bug = document.createElement('span');
  // 15% chance for a time bug
  const isTimeBug = Math.random() < 0.15;
  if (isTimeBug) {
    bug.className = 'bug time-bug';
    bug.textContent = '\uD83E\uDD8B'; // 🦋
    bug.title = 'Time Bug! +5s';
    bug.addEventListener('click', function addTime(e) {
      if (!bug.classList.contains('squashed')) {
        bug.classList.add('squashed');
        bug.textContent = '+5s';
        timeLeft += 5;
        timerEl.textContent = timeLeft;
        setTimeout(() => {
          if (bug.parentNode) bug.parentNode.removeChild(bug);
        }, 400);
      }
      e.stopPropagation();
    });
  } else {
    bug.className = 'bug';
    bug.textContent = randomBug();
    bug.addEventListener('click', function squashBug(e) {
      if (!bug.classList.contains('squashed')) {
        bug.classList.add('squashed');
        bug.textContent = '\u274C'; // ❌
        score += 10;
        scoreEl.textContent = score;
        setTimeout(() => {
          if (bug.parentNode) bug.parentNode.removeChild(bug);
        }, 400);
      }
      e.stopPropagation();
    });
  }
  hole.appendChild(bug);
  hole.classList.add('active');
  const bugTimeout = setTimeout(() => {
    if (bug.parentNode && !bug.classList.contains('squashed')) {
      bug.parentNode.removeChild(bug);
    }
    hole.classList.remove('active');
  }, 1200);
  bugTimeouts.push(bugTimeout);
  bug.addEventListener('transitionend', () => {
    hole.classList.remove('active');
  });
}

function randomBug() {
  // Only use bug emojis
  const bugEmojis = ['\uD83D\uDC1B', '\uD83D\uDC1C', '\uD83D\uDC1E']; // 🐛, 🐜, 🐞
  return String.fromCodePoint(...bugEmojis[Math.floor(Math.random() * bugEmojis.length)].split('\\u').slice(1).map(h=>parseInt(h,16)));
}

function startGame() {
  score = 0;
  timeLeft = 30;
  scoreEl.textContent = score;
  timerEl.textContent = timeLeft;
  gameActive = true;
  gameOverEl.style.display = 'none';
  startBtn.disabled = true;
  clearAllBugs();
  createBoard();
  // Start timer
  timerInterval = setInterval(() => {
    timeLeft--;
    timerEl.textContent = timeLeft;
    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
  // Spawn bugs at random intervals
  bugInterval = setInterval(() => {
    if (gameActive) {
      showBug();
    }
  }, 500 + Math.random() * 400);
}

function endGame() {
  gameActive = false;
  clearInterval(timerInterval);
  clearInterval(bugInterval);
  clearAllBugs();
  startBtn.disabled = false;
  gameOverEl.textContent = `Game Over! Final Score: ${score}`;
  gameOverEl.style.display = 'block';
}

function clearAllBugs() {
  bugTimeouts.forEach(t => clearTimeout(t));
  bugTimeouts = [];
  document.querySelectorAll('.bug').forEach(bug => {
    if (bug.parentNode) bug.parentNode.removeChild(bug);
  });
  document.querySelectorAll('.hole').forEach(hole => hole.classList.remove('active'));
}

startBtn.addEventListener('click', startGame);
createBoard();
