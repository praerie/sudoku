let strikes = 3; 
const strikeLimit = 3;
let numClicked;

function generatePuzzle(level) {
    //create empty 9x9 puzzle
    let boardSolution = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => 0));
        //outer Array.from() creates 9 rows;
        //for each row, inner Array.from() creates 9 columns 
    
    //fill the board
    let row = 0,
        col = 0;

    if (generatePuzzleRecursive(row, col, boardSolution)) { //if valid puzzle
        let boardCopy = cloneBoard(boardSolution); //deep copy of boardSolution (non-referencing)
        let startingBoard = hideNumbers(boardCopy, boardSolution, level); //remove numbers to create starting puzzle

        return [startingBoard, boardSolution];
    } else {
        return null; 
    }
}

function generatePuzzleRecursive(row, col, recursiveBoard) {
    //base case: if all cells filled, return true
    if (row === 9) {
        return true;
    }

    //determining current row and current col
    //if at end of row or col, iterate to next, otherwise same
    const nextRow = (col === 8) ? row + 1 : row;
    const nextCol = (col === 8) ? 0 : col + 1;

    //if current cell is filled, move to next cell
    if (recursiveBoard[row][col] !== 0) {
        return generatePuzzleRecursive(nextRow, nextCol);
    }

    //try filling current cell with random number
    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    shuffle(nums); //to ensure unique puzzles

    for (const num of nums) {
        if (isValid(row, col, num, recursiveBoard)) { //check if valid in cell
            recursiveBoard[row][col] = num; //place in cell

            //recursively try filling next cell
            if (generatePuzzleRecursive(nextRow, nextCol, recursiveBoard)) {
                return true; //if solution found, return true
            }
            //otherwise, if no solution found, backtrack and try next
            recursiveBoard[row][col] = 0;
        }
    }

    //if no num leads to valid solution, return false (backtrack)
    return false;
}

function hideNumbers(boardHideCells, boardSolution, difficulty) {
    let board = cloneBoard(boardHideCells); 
    const cellsToHide = setHiddenCells(difficulty);

    const cellCoords = [];
    for (let i=0; i<9; i++) {
        for (let j=0; j<9; j++) {
            cellCoords.push([i, j]);
        }
    }
    shuffle(cellCoords); //randomizes cell hiding
    
    let goodVisibility = false,
        isUnique = false;

    while (!goodVisibility || !isUnique) {
        let hiddenCells = 0;

        //hide cells: iterates thru shuffled coords, hiding specified cellsToHide amt 
        for (let i=0; i<cellsToHide; i++) {
            const [row, col] = cellCoords[i];
            board[row][col] = 0;
            hiddenCells += 1;
        }

        let rowValid = true,
            colValid = true,
            gridValid = true;

        //checking if any row, col, or 3x3 grid is fully visible
        for (let i=0; i<9; i++) {
            //checking row visibility
            if (!board[i].some(cell => cell === 0)) {
                rowValid = false;
            }
            
            //checking column visibility
            const column = board.map(row => row[i]);
            if (!column.some(cell => cell === 0)) {
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
            if (!gridCells.some(cell => cell === 0)) {
                gridValid = false;
            }
        }

        //checking uniqueness
        isUnique = confirmUniqueSolution(board);
        if (isUnique) {
            isUnique = true;
        } else {
            board = cloneBoard(boardSolution); //creating deep copy to 'reset'
            shuffle(cellCoords);
        }

        //checking for valid visibility conditions
        if (rowValid && colValid && gridValid) {
            goodVisibility = true;
        } else {
            board = cloneBoard(boardSolution); //creating deep copy to 'reset'
            shuffle(cellCoords);
        }
    } 

    return board;
}

function setHiddenCells(level) {
    switch(level) {
        case "easy": 
            return 40;
        case "medium":
            return 45;
        case "hard":
            return 50;
        default:
            return 40;
    }   
}

function confirmUniqueSolution(boardConfirm) {
    let board = cloneBoard(boardConfirm);

    let allSolutions = [];
    findAllSolutions(board, allSolutions);

    //returning true if only one solution is found
    return allSolutions.length === 1;
}

function findAllSolutions(board, allSolutions) {
    let emptyCell = findEmptyCell(board);
    if (!emptyCell) {
        //if no empty cells left, add the current board as a solution
        allSolutions.push(cloneBoard(board));
        return;
    }

    let [row, col] = emptyCell;

    for (let num=1; num<=9; num++) {
        if (isValid(row, col, num, board)) {
            //placing num in empty cell
            board[row][col] = num;

            //recursively find solutions with the updated board
            findAllSolutions(board, allSolutions);

            //backtrack if placing num didn't lead to a solution
            board[row][col] = 0;
        }
    }
}

function solvePuzzle(boardSolve) {
    let board = cloneBoard(boardSolve);

    let emptyCell = findEmptyCell(board);
    if (!emptyCell) {
        return true; //no empty cells, board solved
    }

    let [row, col] = emptyCell;

    for (let num=1; num<=9; num++) {
        if (isValid(row, col, num, board)) {
            //try placing num in the empty cell
            board[row][col] = num;

            //recursively try to solve the updated board
            if (solvePuzzle(board)) {
                return true; //solution found
            }

            //backtrack if placing num didn't lead to a solution
            board[row][col] = 0;
        }
    }

    return false; //no solution found
}

function findEmptyCell(boardFindHidden) {
    let board = cloneBoard(boardFindHidden);

    for (let i=0; i<9; i++) {
        for (let j=0; j<9; j++) {
            if (board[i][j] === 0) {
                return [i, j]; //return coords of empty cell
            }
        }
    }
    return null; 
}

function isValid(row, col, num, validatingBoard) {
    //rules out horizontal match (row)
    for (let i = 0; i < 9; i++) {
        if (validatingBoard[row][i] === num) {
            return false;
        }
    }

    //rules out vertical match (column)
    for (let i = 0; i < 9; i++) {
        if (validatingBoard[i][col] === num) {
            return false;
        }
    }

    //rules out match in 3x3 subgrid
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (validatingBoard[startRow + i][startCol + j] === num) {
                return false;
            }
        }
    }

    return true;
}

function displaySudoku(displayingBoard, boardSolution) {
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
            const cellValue = displayingBoard[row][col];
            cell.innerText = cellValue !== 0 ? cellValue : '';
            sudokuBoard.append(cell);

            //create dividers
            if (row == 2 || row == 5) {
                cell.classList.add("horizontal-divider");
            }
            if (col == 2 || col == 5) {
                cell.classList.add("vertical-divider");
            }

            cell.addEventListener("click", function() {
                clickCell.call(this, boardSolution); 
            });
        }
    }
}

function buildNumKeys() {
    console.log("inside buildNumKeys")
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
function clickCell(boardSolution) {
    let prevContent = this.innerText;
    let prevClass = this.className;

    if (numClicked) { 
        if (strikes <= strikeLimit) { //only 3 strikes allowed
            if (strikes > 0) { //if enough strikes left, check input
                if (this.innerText != '') { 
                    return;
                } //check if cell is filled to avoid override 
        
                //determine board position 
                let pos = this.id.split(",");
                let row = parseInt(pos[0]);
                let col = parseInt(pos[1]);
    
                //validate input against solved board
                if (boardSolution[row][col] == numClicked.id) { //valid input
                    this.innerText = numClicked.id;
                    this.classList.add("cell-valid");
    
                    playValidMoveSound();
                } else { //invalid input
                    strikes--;
                    document.getElementById("strikes").innerText = strikes;
    
                    this.innerText = numClicked.id;
                    this.classList.add("cell-invalid");
    
                    playInvalidMoveSound();
    
                    //record move in history
                    saveMove(this, prevContent, prevClass);
                }
            } else if (strikes === 0) {
                strikes = 4;
                document.getElementById("strikes").innerText = "Out of strikes! Game over.";
                this.innerText = numClicked.id;
                this.classList.add("cell-invalid");

                playCannotMoveSound();

                //don't need to save because no undo at this point
            } 
        } else {
            playCannotMoveSound();
        }
    } 
}

function playValidMoveSound() {
    const validSound = document.getElementById("validSound"); //ding.wav
    validSound.volume = 0.5;
    validSound.currentTime = 0; 
    validSound.play();
}

function playInvalidMoveSound() {
    const invalidMoveSound = document.getElementById("invalidSound"); //oops.wav
    invalidSound.volume = 0.3;
    invalidSound.currentTime = 0; 
    invalidSound.play();
}

function playCannotMoveSound() {
    const noMoveSound = document.getElementById("noMoveSound"); //click2.wav
    noMoveSound.volume = 0.3;
    noMoveSound.currentTime = 0; 
    noMoveSound.play();
}

function playControlSound() {
    const controlSound = document.getElementById("controlSound");
    controlSound.volume = 0.3;
    controlSound.currentTime = 0; 
    controlSound.play();
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
        lastMove.cell.classList.remove("cell-invalid");
    }
}

function cloneBoard(board) {
    return JSON.parse(JSON.stringify(board));
}

//game control button sounds and listeners
const undoBtn = document.getElementById("undoBtn");
const hintBtn = document.getElementById("hintBtn");
const generateBtn = document.getElementById("generateBtn");
const solveBtn = document.getElementById("solveBtn");

//difficulty level buttons
const easyBtn = document.getElementById("easy");
const mediumBtn = document.getElementById("medium");
const hardBtn = document.getElementById("hard");

//button event listeners
document.addEventListener("DOMContentLoaded", function() {
    undoBtn.addEventListener("click", playControlSound);
    undoBtn.addEventListener("click", undo);
    hintBtn.addEventListener("click", playControlSound);
    generateBtn.addEventListener("click", playControlSound);
    solveBtn.addEventListener("click", playControlSound);
    solveBtn.addEventListener("click", solvePuzzle)
});

easyBtn.addEventListener("click", function() {
    setGame("easy");
});
mediumBtn.addEventListener("click", function() {
    setGame("medium");
});
hardBtn.addEventListener("click", function() {
    setGame("hard");
});

//generate and display puzzle
function setGame(level) {
    //clear board
    document.getElementById("sudoku-board").innerHTML = ''; 

    //build number key row
    const numKeys = document.getElementById("nums");
    console.log(numKeys.hasChildNodes())
    if (!numKeys.hasChildNodes()) buildNumKeys(); 

    //generate and display puzzle
    let [startingBoard, boardSolution] = generatePuzzle(level);
    displaySudoku(startingBoard, boardSolution);
    strikes = 3;
}

globalThis.onload = function() {
    setGame("default");
}

