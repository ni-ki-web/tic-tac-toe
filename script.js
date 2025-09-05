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
        console.clear();
        console.log(`Game started! ${player1.name} (X) vs ${player2.name} (O)`);
        printBoard();
    };

    const getActivePlayer = () => activePlayer;

    const switchPlayer = () => {
        activePlayer = activePlayer === player1 ? player2 : player1;
    };

    const checkWinner = () => {
        const currentBoard = Gameboard.getBoard();
        for (let [a, b, c] of winCombos) {
            if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
                return true;
            }
        }
        return false;
    };

    const playRound = (index) => {
        if (gameOver) return;

        if (!Gameboard.setCell(index, activePlayer.marker)) {
            console.log("Cell already taken!");
            return;
        }

        console.log(`${activePlayer.name} (${activePlayer.marker}) played at ${index}`);
        printBoard();

        if (checkWinner()) {
            console.log(`${activePlayer.name} wins!`);
            gameOver = true;
            return;
        }

        if (Gameboard.getBoard.every(cell => cell !== '') ) {
            console.log("It's a tie!");
            gameOver = true;
            return;
        }

        switchPlayer();

        if (activePlayer.isComputer && !gameOver) {
            computerMove();
        }
    };

    const computerMove = () => {
        const emptyCells = Gameboard.getBoard()
            .map((value, index) => (value === "" ? index : null))
            .filter(value => value !== null);

        const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        console.log("Computer is playing it's move");
        playRound(randomIndex);
    };

    const printBoard = () => {
        const currentBoard = Gameboard.getBoard();
        console.log(`
            ${b[0] || " "} | ${b[1] || " "} | ${b[2] || " "}
            ---------
            ${b[3] || " "} | ${b[4] || " "} | ${b[5] || " "}
            ---------
            ${b[6] || " "} | ${b[7] || " "} | ${b[8] || " "}
        `);
    };
    return {startGame, playRound, getActivePlayer};
})();

GameController.startGame("Alice", "Bob"); // PvP
// OR
GameController.startGame("Alice", "Computer", true); // PvC

GameController.playRound(0); // active player plays
GameController.playRound(1);
GameController.playRound(4);