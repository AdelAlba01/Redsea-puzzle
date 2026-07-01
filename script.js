const puzzle = document.getElementById("puzzle");
const movesEl = document.getElementById("moves");
const timerEl = document.getElementById("timer");
const difficultyEl = document.getElementById("difficulty");
const hint = document.getElementById("hint");
const modal = document.getElementById("modal");
const finalStats = document.getElementById("finalStats");

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
  updateStats();
  render();
}

function render() {
  puzzle.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
  puzzle.style.gridTemplateRows = `repeat(${size}, 1fr)`;
  puzzle.innerHTML = "";

  tiles.forEach((tile, index) => {
    const div = document.createElement("button");
    div.className = tile === null ? "tile empty" : "tile";
    div.setAttribute("aria-label", tile === null ? "empty tile" : `tile ${tile + 1}`);

    if (tile !== null) {
      const correctRow = Math.floor(tile / size);
      const correctCol = tile % size;
      div.style.backgroundSize = `${size * 100}% ${size * 100}%`;
      div.style.backgroundPosition = `${(correctCol / (size - 1)) * 100}% ${(correctRow / (size - 1)) * 100}%`;
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
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  timerEl.textContent = `${m}:${s}`;
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
  ].filter(([r, c]) => r >= 0 && r < size && c >= 0 && c < size)
   .map(([r, c]) => r * size + c);
}

function shuffle() {
  setup();
  let previous = -1;
  for (let i = 0; i < size * size * 80; i++) {
    const choices = possibleMoves().filter(i => i !== previous);
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
  const won = tiles.slice(0, -1).every((v, i) => v === i) && tiles[tiles.length - 1] === null;
  if (!won) return;
  clearInterval(timer);
  finalStats.textContent = `${moves} moves • ${timerEl.textContent}`;
  setTimeout(() => modal.classList.remove("hidden"), 250);
}

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

setup();
shuffle();
