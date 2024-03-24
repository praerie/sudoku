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

}

function solvePuzzle() {

}

function isValid() {
    // check if number already exists in row
    for (let i = 0; i < 9; i++) {
        if (board[row][i] === num) {
            return false;
        }
    }

    // check if number already exists in column
    for (let i = 0; i < 9; i++) {
        if (board[i][col] === num) {
            return false;
        }
    }

    // check if number already exists in 3x3 subgrid
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
    const board = generateSudoku();
    displaySudoku(board);
}

function displaySudoku(board) {
    
}

// //old fx using prefilled arrays
// function setGame() {
//     //build sudoku board
//     for (let row=0; row<9; row++) {
//         for (let col=0; col<9; col++) {
//             //create cells
//             let cell = document.createElement("div");
//             cell.id = row.toString() + "," + col.toString();
//             cell.classList.add("sudoku-cell");
//             document.getElementById("sudoku-board").append(cell);

//             //fill in numbers with premade board array
//             if (prefilled[row][col] != "-") {
//                 cell.innerText = prefilled[row][col]
//                 cell.classList.add("cell-prefilled");
//             }

//             //create dividers
//             if (row == 2 || row == 5) {
//                 cell.classList.add("horizontal-divider");
//             }
//             if (col == 2 || col == 5) {
//                 cell.classList.add("vertical-divider");
//             }

//             //listen for sudoku cell clicks
//             cell.addEventListener("click", clickCell);            
//         }
//     }

//     //build num row below board
//     for (let i=1; i<=9; i++) {
//         //create num tiles
//         let num = document.createElement("div");
//         num.id = i;
//         num.innerText = i;
//         num.classList.add("num-tile");
//         document.getElementById("nums").append(num);

//         //listen for clicks
//         num.addEventListener("click", clickNum);
//     }
// }

//needs to be adjusted to work with the new architecture
//update color of clicked num
function clickNum() {
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
    var prevContent = this.innerText;
    var prevClass = this.className;

    if (numClicked) {
        //check if cell is filled to avoid cell override
        if (this.innerText != "") {
            return;
        }

        //check against solution array
        let pos = this.id.split(",");
        let x = parseInt(pos[0]);
        let y = parseInt(pos[1]);
                    //check if good choice
        if (solution[x][y] == numClicked.id) {
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
const solveBtn = document.getElementById("solveBtn");

hintBtn.addEventListener("click", clickControl);
solveBtn.addEventListener("click", clickControl);

function clickControl() {
    const controlSound = document.getElementById("controlSound");
    controlSound.volume = 0.3;
    controlSound.currentTime = 0; 
    controlSound.play();
}

undoBtn.addEventListener("click", clickControl);
undoBtn.addEventListener("click", undo);

//save moves to array
let moveHx = []; 
function saveMove(cell, prevContent) {
    moveHx.push({cell, prevContent});
    console.log(moveHx);
}

function undo() {
    if (moveHx.length > 0) {
        var lastMove = moveHx.pop();

        lastMove.cell.innerText = lastMove.prevContent;
        lastMove.cell.classList.remove("cell-error");
    }
}

globalThis.onload = function() {
    setGame();
}


