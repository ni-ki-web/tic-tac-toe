const Gameboard = (() => {
    let gameboard = ['', '', '', '', '', '', '', '', '' ];

    const getBoard = () => gameboard;

    const setCell = (index, marker) => {
        if (gameboard[index] === '') {
            gameboard[index] = marker;
            return true;
        }
        return false;
    };

    const reset = () => {gameboard = ['', '', '', '', '', '', '', '', '' ];}

    return { getBoard, setCell, reset };
})();

const Player = (name, marker, isComputer = false) => {
    return { name, marker, isComputer};
};

const GameController = (() => {
    let player1, player2, activePlayer;
    let gameOver = false;
    let waitingForComputer = false;

    const winCombos = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    const startGame = (player1Name, player2Name, vsComputer = false) => {
        player1 = Player(player1Name, "X");
        player2 = vsComputer ? Player("Computer", "O", true) : Player(player2Name, "O");
        activePlayer = player1;
        gameOver = false;
        DisplayController.resetDisplay();
    };

    const switchPlayer = () => {
        activePlayer = (activePlayer === player1) ? player2 : player1;
        DisplayController.updateTurn(activePlayer.name);
    };

    const checkWinner = () => {
        const currentBoard = Gameboard.getBoard();
        for (let i = 0; i < winCombos.length; i++) {
            const [a, b, c] = winCombos[i];
            if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
                return { combo: winCombos[i], marker: currentBoard[a] };
            }
        }
        return null;
    };

    const playRound = (index) => {
        if (gameOver || waitingForComputer || !Gameboard.setCell(index, activePlayer.marker)) return;

        endTurn();
    };

    const computerMove = () => {
        const emptyCells = Gameboard.getBoard().map((value, index) => (value === "" ? index : null)).filter(index => index !== null);
        
        if (emptyCells.length === 0) return;
        
        const choice = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        
        Gameboard.setCell(choice, activePlayer.marker);
        endTurn();
    };

    const endTurn = () => {
        DisplayController.render();

        const winner = checkWinner();
        if (winner) {
            gameOver = true;
            DisplayController.highlightCells(winner.combo, winner.marker);
            DisplayController.setResult(`${activePlayer.name} wins!`);
            DisplayController.disableBoard();
            DisplayController.updateTurn(null);
            return;
        }

        if (Gameboard.getBoard().every(cell => cell !== '')) {
            gameOver = true;
            DisplayController.setResult("It's a tie");
            DisplayController.updateTurn(null);
            DisplayController.disableBoard();
            return;
        }

        switchPlayer();
        DisplayController.updateTurn(activePlayer.name);

        if (activePlayer.isComputer && !gameOver) {
            waitingForComputer = true;
            setTimeout(() => {
                computerMove();
                waitingForComputer = false;
            }, 400);
        }
    };

    return {startGame, playRound, get player1() {return player1;}, get player2() {return player2;}};
})();

const DisplayController = (() => {
    const board = document.getElementById('gameboard');
    const turn = document.getElementById('turn');
    const result = document.getElementById('result');

    const render = () => {
        board.textContent = "";
        Gameboard.getBoard().forEach((cell, index) => {
            const divCell = document.createElement("div");
            divCell.classList.add('cell');

            if (cell) {
                divCell.textContent = cell;
                divCell.classList.add(cell === "X" ? "X-cell" : "O-cell");
            }

            divCell.addEventListener('click', () => {
                if (Gameboard.getBoard()[index] === ''){
                    GameController.playRound(index);
                }
            });

            board.appendChild(divCell);
        });
    };

    const highlightCells = (combo, marker) => {
        const color = marker === "X" ? "#007BFF" : "#FF3B3B";
        combo.forEach(index => {
            board.children[index].style.border = `3px solid ${color}`;
            board.children[index].style.opacity = "0.8";
        });
    };

    const updateTurn = (name) => { 
        turn.parentElement.style.display = "flex";
        turn.textContent = name || "-";
    };
        
    const setResult = (message) => { 
        result.parentElement.style.display = "block";
        result.textContent = message || "-";
    };
    const disableBoard = () => { 
        board.querySelectorAll('.cell').forEach(cell => cell .classList.add("disabled")); 
    };

    const clearHighlights = () => {
        board.querySelectorAll('.cell').forEach(cell => {
            cell.style.border = "2px solid #333";
        });
    };

    const resetDisplay = () => {
        Gameboard.reset();
        render();
        clearHighlights();
        updateTurn("-");
        setResult("-");
    };

    return {render, highlightCells, updateTurn, setResult, disableBoard, clearHighlights, resetDisplay };
})();

// ================ UI event handler ================
const gameStateControl = (() => {
    const startBtn = document.getElementById("startBtn");
    const resetBtn = document.getElementById("resetBtn");
    const player1Input = document.getElementById("player1");
    const player2Input = document.getElementById("player2");
    const modeSelect = document.getElementById("mode");

    const initialState = () => {
        startBtn.addEventListener("click", handleStart);
        resetBtn.addEventListener("click", handleReset);
    };

    const handleStart = () => {
        const mode = modeSelect.value;

        if (startBtn.textContent === "Play Again!") {
            GameController.startGame(GameController.player1.name, GameController.player2.name, GameController.player2.isComputer);
            DisplayController.updateTurn(GameController.player1.name);
            DisplayController.setResult("-");
            return;
        }

        const player1Name = player1Input.value || "Player 1";
        let player2Name;

        if (mode === "pvc") {
            player2Name = "Computer";
            player2Input.value = "Computer";
        } else {
            player2Name = player2Input.value || "Player 2";
        }

        player1Input.disabled = true;
        player2Input.disabled = mode === "pvc"
        modeSelect.disabled = true;

        GameController.startGame(player1Name, player2Name, mode==="pvc");

        DisplayController.updateTurn(player1Name);
        DisplayController.setResult("-");

        startBtn.textContent = "Play Again!";
    };

    const handleReset = () => {
        DisplayController.resetDisplay();
        
        player1Input.disabled = false;
        player2Input.disabled = false;
        player1Input.value = "";
        player2Input.value = "";
        modeSelect.disabled = false;

        startBtn.textContent = "Start";
    };

    return { initialState };
})();

DisplayController.render();
gameStateControl.initialState();