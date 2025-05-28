// Game sounds
const sounds = {
  move: new Audio(
    "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU"
  ), // Placeholder for move sound
  win: new Audio(
    "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU"
  ), // Placeholder for win sound
  draw: new Audio(
    "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU"
  ), // Placeholder for draw sound
};

const gameState = {
  currentPlayer: "X",
  board: Array(9).fill(""),
  gameActive: true,
  isAIMode: true,
  winningCombinations: [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // Rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // Columns
    [0, 4, 8],
    [2, 4, 6], // Diagonals
  ],
  scores: {
    player1: 0,
    player2: 0,
    draws: 0,
  },
};

// DOM Elements
const statusDisplay = document.getElementById("status");
const cells = document.querySelectorAll(".cell");
const restartButton = document.getElementById("restartButton");
const resetScoreboardButton = document.getElementById("resetScoreboard");
const darkModeToggle = document.getElementById("darkModeToggle");
const player1ScoreDisplay = document.getElementById("playerScore");
const player2ScoreDisplay = document.getElementById("aiScore");
const drawScoreDisplay = document.getElementById("drawScore");
const modeSelection = document.getElementById("modeSelection");
const gameBoard = document.getElementById("gameBoard");
const vsAIButton = document.getElementById("vsAIButton");
const vsPlayerButton = document.getElementById("vsPlayerButton");
const changeMode = document.getElementById("changeMode");
const modeIndicator = document.getElementById("modeIndicator");
const player1Label = document.getElementById("player1Label");
const player2Label = document.getElementById("player2Label");

// Mode Selection
vsAIButton.addEventListener("click", () => startGame(true));
vsPlayerButton.addEventListener("click", () => startGame(false));
changeMode.addEventListener("click", () => {
  gameBoard.style.display = "none";
  modeSelection.style.display = "block";
  resetGame();
});

function startGame(isAI) {
  gameState.isAIMode = isAI;
  modeSelection.style.display = "none";
  gameBoard.style.display = "block";
  modeIndicator.textContent = `Mode: ${isAI ? "vs AI" : "vs Player"}`;
  player2Label.textContent = isAI ? "AI (O)" : "Player 2 (O)";
  resetGame();
}

// Dark Mode Toggle
darkModeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  const icon = darkModeToggle.querySelector("i");
  icon.classList.toggle("fa-moon");
  icon.classList.toggle("fa-sun");
});

// Initialize game
function initializeGame() {
  statusDisplay.textContent = `${
    gameState.isAIMode ? "Your" : "Player 1's"
  } turn (X)`;
  cells.forEach((cell) => {
    cell.textContent = "";
    cell.classList.remove("x", "o", "winner", "pop");
    cell.addEventListener("click", handleCellClick);
  });
  updateScoreboard();
}

// Update scoreboard displays
function updateScoreboard() {
  player1ScoreDisplay.textContent = gameState.scores.player1;
  player2ScoreDisplay.textContent = gameState.scores.player2;
  drawScoreDisplay.textContent = gameState.scores.draws;
}

// Reset scoreboard
function resetScoreboard() {
  gameState.scores = {
    player1: 0,
    player2: 0,
    draws: 0,
  };
  updateScoreboard();
}

// Handle cell click
async function handleCellClick(event) {
  const cell = event.target;
  const cellIndex = parseInt(cell.getAttribute("data-cell-index"));

  if (gameState.board[cellIndex] !== "" || !gameState.gameActive) {
    return;
  }

  // Player move
  updateCell(cell, cellIndex);
  sounds.move.play().catch((e) => console.log("Sound play failed:", e));

  if (checkGameResult()) {
    return;
  }

  // AI move or switch to next player
  if (gameState.isAIMode && gameState.gameActive) {
    gameState.gameActive = false;
    gameState.currentPlayer = "O";
    statusDisplay.textContent = "AI is thinking...";

    await new Promise((resolve) => setTimeout(resolve, 500));

    const aiMove = findBestMove();
    const aiCell = document.querySelector(`[data-cell-index="${aiMove}"]`);
    updateCell(aiCell, aiMove);
    sounds.move.play().catch((e) => console.log("Sound play failed:", e));

    if (!checkGameResult() && gameState.board.includes("")) {
      gameState.currentPlayer = "X";
      gameState.gameActive = true;
      statusDisplay.textContent = "Your turn (X)";
    }
  } else if (!gameState.isAIMode) {
    gameState.currentPlayer = gameState.currentPlayer === "X" ? "O" : "X";
    statusDisplay.textContent = `Player ${gameState.currentPlayer}'s turn`;
  }
}

// Minimax Algorithm
function minimax(board, depth, isMaximizing) {
  const scores = {
    X: -1,
    O: 1,
    draw: 0,
  };

  const result = checkWinner();
  if (result !== null) {
    return scores[result];
  }

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === "") {
        board[i] = "O";
        const score = minimax(board, depth + 1, false);
        board[i] = "";
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === "") {
        board[i] = "X";
        const score = minimax(board, depth + 1, true);
        board[i] = "";
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

// Find best move for AI
function findBestMove() {
  let bestScore = -Infinity;
  let bestMove;

  for (let i = 0; i < 9; i++) {
    if (gameState.board[i] === "") {
      gameState.board[i] = "O";
      const score = minimax(gameState.board, 0, false);
      gameState.board[i] = "";
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }

  return bestMove;
}

// Update cell content with animation
function updateCell(cell, index) {
  gameState.board[index] = gameState.currentPlayer;
  cell.textContent = gameState.currentPlayer;
  cell.classList.add(gameState.currentPlayer.toLowerCase(), "pop");
}

// Check for winner
function checkWinner() {
  for (const combination of gameState.winningCombinations) {
    const [a, b, c] = combination;
    if (
      gameState.board[a] &&
      gameState.board[a] === gameState.board[b] &&
      gameState.board[a] === gameState.board[c]
    ) {
      return gameState.board[a];
    }
  }

  if (!gameState.board.includes("")) {
    return "draw";
  }

  return null;
}

// Check game result
function checkGameResult() {
  const result = checkWinner();

  if (result !== null) {
    if (result === "draw") {
      statusDisplay.textContent = "Game ended in a draw!";
      gameState.scores.draws++;
      sounds.draw.play().catch((e) => console.log("Sound play failed:", e));
      document.querySelector(".game-board").classList.add("game-draw");
    } else {
      const winner =
        result === "X"
          ? gameState.isAIMode
            ? "Player"
            : "Player 1"
          : gameState.isAIMode
          ? "AI"
          : "Player 2";
      statusDisplay.textContent = `${winner} wins!`;
      if (result === "X") {
        gameState.scores.player1++;
      } else {
        gameState.scores.player2++;
      }
      sounds.win.play().catch((e) => console.log("Sound play failed:", e));
      highlightWinningCombination();
    }

    gameState.gameActive = false;
    updateScoreboard();
    return true;
  }

  return false;
}

// Highlight winning combination
function highlightWinningCombination() {
  for (const combination of gameState.winningCombinations) {
    const [a, b, c] = combination;
    if (
      gameState.board[a] &&
      gameState.board[a] === gameState.board[b] &&
      gameState.board[a] === gameState.board[c]
    ) {
      document
        .querySelector(`[data-cell-index="${a}"]`)
        .classList.add("winner");
      document
        .querySelector(`[data-cell-index="${b}"]`)
        .classList.add("winner");
      document
        .querySelector(`[data-cell-index="${c}"]`)
        .classList.add("winner");
      break;
    }
  }
}

// Reset game
function resetGame() {
  gameState.currentPlayer = "X";
  gameState.board = Array(9).fill("");
  gameState.gameActive = true;
  document.querySelector(".game-board").classList.remove("game-draw");
  initializeGame();
}

// Event listeners
restartButton.addEventListener("click", resetGame);
resetScoreboardButton.addEventListener("click", resetScoreboard);

// Initialize the game when the page loads
initializeGame();
