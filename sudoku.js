let strikes = 0;
let numClicked;
let board;

// const prefilled = [
//     "---26-7-1",
//     "68--7--9-",
//     "19---45--",
//     "82-1---4-",
//     "--46-29--",
//     "-5---3-28",
//     "--93---74",
//     "-4--5--36",
//     "7-3-18---",
// ];

// const solution = [
//     "435269781",
//     "682571493",
//     "197834562",
//     "826195347",
//     "374682915",
//     "951743628",
//     "519326874",
//     "248957136",
//     "763418259",
// ]

function generatePuzzle() {
    //create empty 9x9 puzzle
    board = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => 0));
        //outer Array.from() creates 9 rows;
        //for each row, inner Array.from() creates 9 columns within each row
    
    //fill the board
    let row = 0;
    let col = 0;
    if (generatePuzzleRecursive(row, col)) {
        return board; //return valid puzzle
    } else {
        return null; //failure to generate
    }

    //remove some numbers to create starting puzzle
    hideNumbers();
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
                return true; //if solution found return true
            }
            //otherwise, if no solution found, backtrack and try next num
            board[row][col] = 0;
        }
    }

    //if no num leads to valid solution, return false (backtrack)
    return false;
}

function solvePuzzle() {

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

function setGame() {
    board = generatePuzzle();
    if (board) { //check if successfully generated
        displaySudoku(board);
    } else {
        console.error("Failed to generate Sudoku puzzle.");
    }
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

//needs to be adjusted to work with the new architecture
//update sudoku cell with clicked num
function clickCell() {
    let prevContent = this.innerText;
    let prevClass = this.className;

    if (numClicked) { //check if cell is filled to avoid cell override
        if (this.innerText != "") {
            return;
        }

        //check against solution array
        let pos = this.id.split(",");
        let x = parseInt(pos[0]);
        let y = parseInt(pos[1]);
                    
        if (solution[x][y] == numClicked.id) { //check if good choice
            this.innerText = numClicked.id;

            //play ding sound
            const dingSound = document.getElementById("dingSound");
            dingSound.volume = 0.5;
            dingSound.currentTime = 0; 
            dingSound.play();
        } else {    //otherwise, bad choice
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

//play game control button sounds 
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

//save moves to array
let moveHx = []; 
function saveMove(cell, prevContent) {
    moveHx.push({cell, prevContent});
    console.log(moveHx);
}

function undo() {
    if (moveHx.length > 0) {
        let lastMove = moveHx.pop();

        lastMove.cell.innerText = lastMove.prevContent;
        lastMove.cell.classList.remove("cell-error");
    }
}

document.addEventListener("DOMContentLoaded", function() {
    undoBtn.addEventListener("click", clickControl);
    undoBtn.addEventListener("click", undo);
    hintBtn.addEventListener("click", clickControl);
    generateBtn.addEventListener("click", clickControl);
    solveBtn.addEventListener("click", clickControl);
});

globalThis.onload = function() {
    setGame();
}


