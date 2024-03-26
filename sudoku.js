let strikes = 0;
let numClicked, board, boardSolution;

function generatePuzzle() {
    //create empty 9x9 puzzle
    board = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => 0));
        //outer Array.from() creates 9 rows;
        //for each row, inner Array.from() creates 9 columns within each row
    
    //fill the board
    let row = 0;
    let col = 0;
    if (generatePuzzleRecursive(row, col)) { //if valid puzzle
        boardSolution = board.map(row => row.slice()); //save copy of solution
        hideNumbers(); //remove numbers to create starting puzzle
        return board;
    } else {
        return null; 
    }
}

function generatePuzzleRecursive(row, col) {
    //base case: if all cells filled, return true
    if (row === 9) {
        return true;
    }

    //determining current row and current col
    //if at end of row or col, iterate to next, otherwise same
    const nextRow = (col === 8) ? row + 1 : row;
    const nextCol = (col === 8) ? 0 : col + 1;

    //if current cell is filled, move to next cell
    if (board[row][col] !== 0) {
        return generatePuzzleRecursive(nextRow, nextCol);
    }

    //try filling current cell with random number
    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    shuffle(nums); //to ensure unique puzzles
    for (const num of nums) {
        if (isValid(row, col, num, board)) { //check if valid in cell
            board[row][col] = num; //place in cell

            //recursively try filling next cell
            if (generatePuzzleRecursive(nextRow, nextCol)) {
                return true; //if solution found, return true
            }
            //otherwise, if no solution found, backtrack and try next
            board[row][col] = 0;
        }
    }

    //if no num leads to valid solution, return false (backtrack)
    return false;
}

function hideNumbers() {
    const difficulty = "easy"; //to-do: add difficulty buttons to interface
    const cellsToHide = setHiddenCells(difficulty);

    const cellCoords = [];
    for (let i=0; i<9; i++) {
        for (let j=0; j<9; j++) {
            cellCoords.push([i, j]);
        }
    }
    shuffle(cellCoords); //randomizes cell hiding
    
    let goodVisibility = false;

    while (!goodVisibility) {
        let hiddenCells = 0;

        //hide cells: iterates thru shuffled coords, hiding specified cellsToHide amt 
        for (let i=0; i<cellsToHide; i++) {
            const [row, col] = cellCoords[i];
            board[row][col] = "";
            hiddenCells += 1;
        }

        let rowValid = true,
            colValid = true,
            gridValid = true;

        //checking if any row, col, or 3x3 grid is fully visible
        for (let i=0; i<9; i++) {
            //checking row visibility
            if (!board[i].some(cell => cell === "")) {
                rowValid = false;
            }
            
            //checking column visibility
            const column = board.map(row => row[i]);
            if (!column.some(cell => cell === "")) {
                colValid = false;
            }

            //checking 3x3 grid visibility
            const startRow = Math.floor(i / 3) * 3;
            const startCol = (i % 3) * 3;
            const gridCells = [];
            for (let j=startRow; j<startRow + 3; j++) {
                for (let k=startCol; k<startCol + 3; k++) {
                    gridCells.push(board[j][k]);
                }
            }
            if (!gridCells.some(cell => cell === "")) {
                gridValid = false;
            }
        }

        if (rowValid && colValid && gridValid) {
            goodVisibility = true;
        } else {
            board = boardSolution.map(row => row.slice()); //reset board
            shuffle(cellCoords);
        }

        //need to check that there is only 1 solution
    } 
}

function setHiddenCells(level) {
    switch(level) {
        case "easy": 
            return 40;
        case "medium":
            return 50;
        case "hard":
            return 60;
        default:
            return 40;
    }   
}

function uniquelySolvable(row, col) {
    //check if hiding cell at row, col results in uniquely solvable puzzle

    const boardCopy = board.map(row => row.slice());

    boardCopy[row][col] = ""; 

    let solutions = 0;
    solvePuzzle(boardCopy, () => {
        solutions++;
    });
    
    return solutions === 1; //if 1 solution, returns true
}

function solvePuzzle(boardToSolve) {
    let emptyCell = findEmptyCell(boardToSolve);
    if (!emptyCell) {
        return true; //no empty cells, board solved
    }

    let [row, col] = emptyCell;

    for (let num = 1; num <= 9; num++) {
        if (isValid(row, col, num, boardToSolve)) {
            //try placing num in the empty cell
            boardToSolve[row][col] = num;

            //recursively try to solve the updated board
            if (solvePuzzle(boardToSolve)) {
                return true; //solution found
            }

            //backtrack if placing num didn't lead to a solution
            boardToSolve[row][col] = 0;
        }
    }

    return false; //no solution found
}

function findEmptyCell(boardToSolve) {
    for (let i=0; i<9; i++) {
        for (let j=0; j<9; j++) {
            if (boardToSolve[i][j] === "") {
                return [i, j]; //return the coordinates of the empty cell
            }
        }
    }
    return null; 
}

function isValid(row, col, num, boardToCheck) {
    //rules out horizontal match (row)
    for (let i = 0; i < 9; i++) {
        if (boardToCheck[row][i] === num) {
            return false;
        }
    }

    //rules out vertical match (column)
    for (let i = 0; i < 9; i++) {
        if (boardToCheck[i][col] === num) {
            return false;
        }
    }

    //rules out match in 3x3 subgrid
    const startRow = Math.floor(row / 3) * 3;
    const startCol = (col % 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (boardToCheck[startRow + i][startCol + j] === num) {
                return false;
            }
        }
    }

    return true;
}

function displaySudoku() {
    const sudokuBoard = document.getElementById("sudoku-board");

    for (let row=0; row<9; row++) {
        for (let col=0; col<9; col++) {
            //determine cell index
            const cellId = row.toString() + "," + col.toString();

            //create cell
            let cell = document.createElement("div");
            cell.id = cellId;
            cell.classList.add("sudoku-cell");

            //set cell value from global board array
            cell.innerText = board[row][col] !== 0 ? board[row][col] : '';
            sudokuBoard.append(cell);

            //create dividers
            if (row == 2 || row == 5) {
                cell.classList.add("horizontal-divider");
            }
            if (col == 2 || col == 5) {
                cell.classList.add("vertical-divider");
            }

            cell.addEventListener("click", clickCell);   
        }
    }

    for (let i=1; i<=9; i++) {
        //create num tiles
        let numTile = document.createElement("div");
        numTile.id = i;
        numTile.innerText = i;
        numTile.classList.add("num-tile");
        document.getElementById("nums").append(numTile);
        numTile.addEventListener("click", styleClickedNum);
    }
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

//update color of clicked num
function styleClickedNum() {
    //check for double click
    if (numClicked === this) {
        numClicked.classList.remove("num-clicked");
        numClicked = null;
    } else { //if other num already clicked, remove class
        if (numClicked != null) {
            numClicked.classList.remove("num-clicked");
        }

        numClicked = this;
        numClicked.classList.add("num-clicked");
    }

    //play click sound
    const clickSound = document.getElementById("clickSound");
    clickSound.currentTime = 0; 
    clickSound.volume = 0.7;
    clickSound.play();
}

//validate input and update board 
function clickCell() {
    let prevContent = this.innerText;
    let prevClass = this.className;

    if (numClicked) { //check if cell is filled to avoid cell override
        if (this.innerText != "") {
            return;
        }

        //validate input against solved board
        let pos = this.id.split(",");
        let row = parseInt(pos[0]);
        let col = parseInt(pos[1]);
                    
        if (boardSolution[row][col] == numClicked.id) { //check if good choice
            this.innerText = numClicked.id;
            this.classList.add("user-entered");

            //play ding sound
            const dingSound = document.getElementById("dingSound");
            dingSound.volume = 0.5;
            dingSound.currentTime = 0; 
            dingSound.play();
        } else { //otherwise, bad choice
            strikes += 1;
            document.getElementById("strikes").innerText = strikes;
            this.innerText = numClicked.id;
            this.classList.add("cell-error");

            //record move in history
            saveMove(this, prevContent, prevClass);

            //play oops sound
            const oopsSound = document.getElementById("oopsSound");
            oopsSound.volume = 0.3;
            oopsSound.currentTime = 0; 
            oopsSound.play();
        }
    }
}

//save moves to array, allows 'undo' 
let moveHx = []; 
function saveMove(cell, prevContent) {
    moveHx.push({cell, prevContent});
}

//undo incorrect moves in reverse order
function undo() {
    if (moveHx.length > 0) {
        let lastMove = moveHx.pop();

        lastMove.cell.innerText = lastMove.prevContent;
        lastMove.cell.classList.remove("cell-error");
    }
}

//game control button sounds and listeners
const undoBtn = document.getElementById("undoBtn");
const hintBtn = document.getElementById("hintBtn");
const generateBtn = document.getElementById("generateBtn");
const solveBtn = document.getElementById("solveBtn");

function clickControl() {
    const controlSound = document.getElementById("controlSound");
    controlSound.volume = 0.3;
    controlSound.currentTime = 0; 
    controlSound.play();
}

document.addEventListener("DOMContentLoaded", function() {
    undoBtn.addEventListener("click", clickControl);
    undoBtn.addEventListener("click", undo);
    hintBtn.addEventListener("click", clickControl);
    generateBtn.addEventListener("click", clickControl);
    solveBtn.addEventListener("click", clickControl);
});

//generate and display puzzle
function setGame() {
    board = generatePuzzle();
    displaySudoku();
}

globalThis.onload = function() {
    setGame();
}


