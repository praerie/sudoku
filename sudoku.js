let strikes = 0;
let numClicked;

function generatePuzzle() {
    //create empty 9x9 puzzle
    let boardSolution = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => 0));
        //outer Array.from() creates 9 rows;
        //for each row, inner Array.from() creates 9 columns 
    
    //fill the board
    let row = 0;
    let col = 0;
    if (generatePuzzleRecursive(row, col, boardSolution)) { //if valid puzzle
        let boardCopy = JSON.parse(JSON.stringify(boardSolution)); //deep copy of boardSolution (non-referencing)
        let startingBoard = hideNumbers(boardCopy, boardSolution); //remove numbers to create starting puzzle
        let isUnique = confirmUniqueSolution(startingBoard);

            if(isUnique) console.log("unique")
            else console.log("not unique")

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

function hideNumbers(boardHideCells, boardSolution) {
    let board = JSON.parse(JSON.stringify(boardHideCells)); //deep copy

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

        if (rowValid && colValid && gridValid) {
            goodVisibility = true;
        } else {
            board = JSON.parse(JSON.stringify(boardSolution)); //creating deep copy to 'reset'
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
            return 50;
        case "hard":
            return 60;
        default:
            return 40;
    }   
}

function confirmUniqueSolution(boardConfirm) {
    let board = JSON.parse(JSON.stringify(boardConfirm));

    //NOTE: currently not functioning how intended; need to loop to find all possible solutions

    let solutions = 0;

    if (solvePuzzle(board)) {
        solutions += 1;
        console.log("solutions: ", solutions)
    } 
    
    return solutions === 1; 
    //returns boolean, true if unique solution
}

function solvePuzzle(boardSolve) {
    let board = JSON.parse(JSON.stringify(boardSolve));

    let emptyCell = findEmptyCell(board);
    if (!emptyCell) {
        return true; //no empty cells, board solved
    }

    let [row, col] = emptyCell;

    for (let num = 1; num <= 9; num++) {
        console.log("solvePuzzle, trying to place number");
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
    let board = JSON.parse(JSON.stringify(boardFindHidden));

    for (let i=0; i<9; i++) {
        for (let j=0; j<9; j++) {
            if (board[i][j] === 0) {
                console.log("found an empty cell at", i, j);
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

    if (numClicked) { //check if cell is filled to avoid cell override
        if (this.innerText != '') {
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
    solveBtn.addEventListener("click", solvePuzzle)
});

//generate and display puzzle
function setGame() {
    let [startingBoard, boardSolution] = generatePuzzle();
    displaySudoku(startingBoard, boardSolution);
}

globalThis.onload = function() {
    setGame();
}


