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
        boardSolution = board; //save copy of solution
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
        if (isValid(row, col, num)) { //check if valid in cell
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
/* 
    logic:
    - start with completed puzzle created thru backtracking
    - determine difficulty level, influencing how many numbers to hide 
        - easy: 40 hidden
        - medium: 50 hidden
        - hard: 60 hidden
    - iterate thru cells of sudoku grid
        - for each cell, randomly decide whether to hide it based on difficulty level
          (probability distribution)
            - if deciding to hide it, replace with ''
    - ensure solvability with unique solution (solving algorithm)
        - if there are multiple solutions, adjust number of hidden cells or revert last hidden cell and try again
    - repeat until desired number of cells matches difficulty level

    pseudocode:
    difficultyLevel = determineDifficultyLevel() 
    cellsToHide = determineHiddenCells(difficultyLevel) 

    hiddenCellsCount = 0 

    while hiddenCellsCount < cellsToHide:
        // iterate through the cells of the Sudoku grid
        for each cell in board:
            if randomlyDecideToHide(difficultyLevel): 
                cell.value = '' 
                hiddenCellsCount += 1 

            if not isSolvableWithUniqueSolution(boardSolution): 
                resetLastHiddenCell() 
                hiddenCellsCount -= 1 

    return board
*/
    difficulty = "easy"; //to-do: add difficulty buttons to interface
    cellsToHide = determineHiddenCells(difficulty);

    hiddenCells = 0;

    while (hiddenCells < cellsToHide) {
        for (let i=0; i<9; i++) {
            for (let j=0; j<9; j++) {
                if (randomlyHide(difficulty)) {
                    board[i][j] = "";
                    hiddenCells += 1;
                }

                if (!uniquelySolvable()) {
                    board[i][j] = boardSolution[i][j];
                    hiddenCells -= 1;
                }
            }
        }
    }
}

function determineHiddenCells(level) {
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

function randomlyHide(level) {
    /*
    brainstorming:
    - generate random boolean, hide or keep visible 
        - Math.random() for number 0 to 1, then convert to boolean using randomBool = randomNum < 0.5 
    - smaller clusters as difficulty level increases
        - in addition to randomization, need to check within col, row, and 3x3 grid to avoid clusters
    */
}

function uniquelySolvable() {

}

function isValid(row, col, num) {
    //check if number already exists in row
    for (let i = 0; i < 9; i++) {
        if (board[row][i] === num) {
            return false;
        }
    }

    //check if number already exists in column
    for (let i = 0; i < 9; i++) {
        if (board[i][col] === num) {
            return false;
        }
    }

    //check if number already exists in 3x3 subgrid
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[startRow + i][startCol + j] === num) {
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
        let x = parseInt(pos[0]);
        let y = parseInt(pos[1]);
                    
        if (board[x][y] == numClicked.id) { //check if good choice
            this.innerText = numClicked.id;

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

//save moves to array, allows 'undo' in order
let moveHx = []; 
function saveMove(cell, prevContent) {
    moveHx.push({cell, prevContent});
}

//undo incorrect moves
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
    displaySudoku(board);
}

globalThis.onload = function() {
    setGame();
}


