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
        Gameboard.reset();
        DisplayController.render();
        DisplayController.clearHighlights();
        DisplayController.updateTurn(activePlayer.name);
        DisplayController.setResult('-');
        DisplayController.disableInputs(true);
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
        if (gameOver) return;
        if (!Gameboard.setCell(index, activePlayer.marker)) return;

        DisplayController.render();

        const winner = checkWinner();
        if (winner) {
            gameOver = true;
            DisplayController.highlightCells(winner.combo, winner.marker);
            DisplayController.setResult(`${activePlayer.name} wins!`);
            DisplayController.updateTurn("—");
            DisplayController.disableCells();
            return;
        }

        if (Gameboard.getBoard().every(cell => cell !== '')) {
            gameOver = true;
            DisplayController.setResult("It's a tie");
            DisplayController.updateTurn("—");
            DisplayController.disableCells();
            return;
        }

        switchPlayer();

        if (activePlayer.isComputer && !gameOver) {
            setTimeout(() => {
                computerMove();
            }, 300);
        }
    };

    const computerMove = () => {
        const emptyCells = Gameboard.getBoard()
            .map((value, index) => (value === "" ? index : null))
            .filter(idx => idx !== null);

        const choice = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        playRound(choice);
    };

    return {startGame, playRound};
})();

const DisplayController = (() => {
    const board = document.getElementById('gameboard');
    const turn = document.getElementById('turn');
    const result = document.getElementById('result');
    const p1Input = document.getElementById('player1');
    const p2Input = document.getElementById('player2');

    const render = () => {
        board.textContent = "";
        Gameboard.getBoard().forEach((cell, index) => {
            const divCell = document.createElement("div");
            divCell.classList.add('cell');

            if (cell) {
                divCell.textContent = cell;
                divCell.classList.add(cell === "X" ? "x-cell" : "o-cell");
            }

            divCell.addEventListener('click', () => {
                if (Gameboard.getBoard()[index] === ''){
                    GameController.playRound(index);
                }
            });

            board.appendChild(divCell);
        });
    };

    const updateTurn = (name) => { turn.textContent = name; };
    const setResult = (message) => { result.textContent = message; };

    const highlightCells = (combo, marker) => {
        const color = marker === "X" ? "orange" : "green";
        combo.forEach(index => {
            board.children[index].style.border = `3px solid ${color}`;
            board.children[index].style.opacity = "0.7";
        });
    };

    const clearHighlights = () => {
        [...board.children].forEach(cell => {
            cell.style.border = "1px solid #333";
        });
    };

      const disableInputs = (disabled) => {
        p1Input.disabled = disabled;
        p2Input.disabled = disabled;
    };

    const disableCells = () => {
        board.querySelectorAll('.cell').forEach(cell => {
        cell.classList.add('disabled');
        });
    };

    return {render, updateTurn, setResult, highlightCells, clearHighlights, disableInputs, disableCells};
})();

document.getElementById("startBtn").addEventListener("click", () => {
    const p1Name = document.getElementById("player1").value || "Player 1";
    let p2Name = document.getElementById("player2").value || "Player 2";
    const mode = document.getElementById("mode").value;

    if (mode === "pvc") {
        p2Name = "Computer";
        GameController.startGame(p1Name, p2Name, true);
    } else {
        GameController.startGame(p1Name, p2Name, false);
    }
});

DisplayController.render();