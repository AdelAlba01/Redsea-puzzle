const puzzle = document.getElementById("puzzle");
const movesEl = document.getElementById("moves");
const timerEl = document.getElementById("timer");
const difficultyEl = document.getElementById("difficulty");
const hint = document.getElementById("hint");
const modal = document.getElementById("modal");
const finalStats = document.getElementById("finalStats");

let currentImage = "";
let size = 4;
let tiles = [];
let moves = 0;
let seconds = 0;
let timer = null;
let started = false;

function setup() {
  size = Number(difficultyEl.value);
  tiles = [...Array(size * size - 1).keys(), null];
  moves = 0;
  seconds = 0;
  started = false;
  clearInterval(timer);
  hint.src = currentImage;
  updateStats();
  render();
  renderLeaderboard();
}

function render() {
  puzzle.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
  puzzle.style.gridTemplateRows = `repeat(${size}, 1fr)`;
  puzzle.innerHTML = "";

  tiles.forEach((tile, index) => {
    const div = document.createElement("button");
    div.className = tile === null ? "tile empty" : "tile";

    if (tile !== null) {
      const correctRow = Math.floor(tile / size);
      const correctCol = tile % size;
      div.style.backgroundImage = `url("${currentImage}")`;
      div.style.backgroundRepeat = "no-repeat";
      div.style.backgroundSize = `${size * 100}% ${size * 100}%`;
      div.style.backgroundPosition =
        `${correctCol * (100 / (size - 1))}% ${correctRow * (100 / (size - 1))}%`;
      div.onclick = () => move(index);
    }

    puzzle.appendChild(div);
  });
}

function startTimer() {
  if (started) return;
  started = true;
  timer = setInterval(() => {
    seconds++;
    updateStats();
  }, 1000);
}

function updateStats() {
  movesEl.textContent = moves;
  timerEl.textContent = formatTime(seconds);
}

function formatTime(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const secs = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${secs}`;
}

function move(index) {
  const empty = tiles.indexOf(null);
  const row = Math.floor(index / size);
  const col = index % size;
  const erow = Math.floor(empty / size);
  const ecol = empty % size;

  if (Math.abs(row - erow) + Math.abs(col - ecol) !== 1) return;

  startTimer();
  [tiles[index], tiles[empty]] = [tiles[empty], tiles[index]];
  moves++;
  updateStats();
  render();
  checkWin();
}

function possibleMoves() {
  const empty = tiles.indexOf(null);
  const row = Math.floor(empty / size);
  const col = empty % size;

  return [
    [row - 1, col],
    [row + 1, col],
    [row, col - 1],
    [row, col + 1],
  ]
    .filter(([r, c]) => r >= 0 && r < size && c >= 0 && c < size)
    .map(([r, c]) => r * size + c);
}

function shuffle() {
  setup();

  let previous = -1;

  for (let i = 0; i < size * size * 100; i++) {
    const choices = possibleMoves().filter((c) => c !== previous);
    const choice = choices[Math.floor(Math.random() * choices.length)];
    previous = tiles.indexOf(null);

    const empty = tiles.indexOf(null);
    [tiles[choice], tiles[empty]] = [tiles[empty], tiles[choice]];
  }

  moves = 0;
  seconds = 0;
  started = false;
  updateStats();
  render();
}

function checkWin() {
  const won =
    tiles.slice(0, -1).every((v, i) => v === i) &&
    tiles[tiles.length - 1] === null;

  if (!won) return;

  clearInterval(timer);

  showCelebration();
  saveScore();

  finalStats.textContent = `${moves} moves • ${formatTime(seconds)}`;
  setTimeout(() => modal.classList.remove("hidden"), 250);
}

function saveScore() {
  const playerName =
    prompt("Congratulations! Enter your name for the leaderboard:") || "Explorer";

  const resort =
    currentImage === "desert-rock.jpg" ? "Desert Rock" : "Shebara";

  const score = {
    name: playerName,
    resort: resort,
    time: seconds,
    moves: moves,
    difficulty: `${size}x${size}`,
    date: new Date().toLocaleString(),
  };

  const scores = JSON.parse(localStorage.getItem("redseaLeaderboard")) || [];
  scores.push(score);

  scores.sort((a, b) => a.time - b.time || a.moves - b.moves);

  localStorage.setItem("redseaLeaderboard", JSON.stringify(scores));
  renderLeaderboard();
}

function renderLeaderboard() {
  const board = document.getElementById("leaderboard");
  if (!board) return;

  const scores = JSON.parse(localStorage.getItem("redseaLeaderboard")) || [];
  const topScores = scores.slice(0, 10);

  board.innerHTML = `
    <h2>Leaderboard</h2>
    <p>Total participants: <strong>${scores.length}</strong></p>
    ${
      topScores.length === 0
        ? "<p>No scores yet.</p>"
        : `<ol>
            ${topScores
              .map(
                (s) =>
                  `<li><strong>${s.name}</strong> — ${s.resort} — ${formatTime(
                    s.time
                  )} — ${s.moves} moves — ${s.difficulty}</li>`
              )
              .join("")}
          </ol>`
    }
  `;
}

function showCelebration() {
  for (let i = 0; i < 80; i++) {
    const firework = document.createElement("div");
    firework.className = "firework";
    firework.style.left = Math.random() * 100 + "vw";
    firework.style.top = Math.random() * 100 + "vh";
    firework.style.animationDelay = Math.random() * 0.7 + "s";
    document.body.appendChild(firework);

    setTimeout(() => {
      firework.remove();
    }, 1800);
  }
}

document.getElementById("startGame").onclick = () => {
  currentImage = document.getElementById("resortSelect").value;
  document.getElementById("menu").style.display = "none";
  document.getElementById("game").style.display = "block";
  hint.src = currentImage;
  shuffle();
};

document.getElementById("shuffleBtn").onclick = shuffle;
document.getElementById("resetBtn").onclick = setup;

document.getElementById("hintBtn").onclick = () => {
  hint.style.display = hint.style.display === "block" ? "none" : "block";
};

document.getElementById("playAgain").onclick = () => {
  modal.classList.add("hidden");
  shuffle();
};

difficultyEl.onchange = shuffle;

renderLeaderboard();
