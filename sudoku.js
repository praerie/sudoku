document.addEventListener("DOMContentLoaded", function () {
    
    let strikes = 0;
    let numClicked;

    var prefilled = [
        "5----9-6-",
        "9-3-6---5",
        "--1437-98",
        "69----5-7",
        "---6-85-7",
        "4-2----86",
        "72-5846--",
        "3---2-8-4",
        "-4-9----2"
    ]

    var solution = [
        "578149362",
        "913862475",
        "261437598",
        "694253817",
        "135678249",
        "482791786",
        "729584631",
        "356427914",
        "847916153"
    ]

    globalThis.onload = function() {
        setGame();
    }

    function setGame() {
        //building sudoku board
        for (let row=0; row<9; row++) {
            for (let col=0; col<9; col++) {
                //creating cells
                let cell = document.createElement("div");
                cell.id = row.toString() + "," + col.toString();
                cell.classList.add("sudoku-cell");
                document.getElementById("sudoku-board").append(cell);

                //filling in numbers with premade board array
                if (prefilled[row][col] != "-") {
                    cell.innerText = prefilled[row][col]
                    cell.classList.add("cell-prefilled");
                }

                //creating dividers
                if (row == 2 || row == 5) {
                    cell.classList.add("horizontal-divider");
                }
                if (col == 2 || col == 5) {
                    cell.classList.add("vertical-divider");
                }

                //listening for clicks
                cell.addEventListener("click", clickCell);            
            }
        }

        //building num row below board
        for (let i=1; i<=9; i++) {
            //creating num tiles
            let num = document.createElement("div");
            num.id = i;
            num.innerText = i;
            num.classList.add("num-tile");
            document.getElementById("nums").append(num);

            //listening for clicks
            num.addEventListener("click", clickNum);
        }
    }

    //updating color of clicked num
    function clickNum() {
        //checking for double click
        if (numClicked === this) {
            numClicked.classList.remove("num-clicked");
            numClicked = null;
        } else { //if other num already clicked, removing class
            if (numClicked != null) {
                numClicked.classList.remove("num-clicked");
            }

            numClicked = this;
            numClicked.classList.add("num-clicked");
        }
        //playing click sound
        const clickSound = document.getElementById("clickSound");
        clickSound.currentTime = 0; 
        clickSound.volume = 0.7;
        clickSound.play();
    }

    //updating sudoku cell with clicked num
    function clickCell() {
        if (numClicked) {
            //avoiding cell override
            if (this.innerText != "") {
                return;
            }

            //checking against solution array
            let pos = this.id.split(",");
            let x = parseInt(pos[0]);
            let y = parseInt(pos[1]);
                        //checking if good choice
            if (solution[x][y] == numClicked.id) {
                this.innerText = numClicked.id;

                //playing ding sound
                const dingSound = document.getElementById("dingSound");
                dingSound.volume = 0.5;
                dingSound.currentTime = 0; 
                dingSound.play();
            } else {    //otherwise, bad choice
                strikes += 1;
                document.getElementById("strikes").innerText = strikes;
                // this.innerText = numClicked.id;
                // this.classList.add("cell-error");

                //playing oops sound
                const oopsSound = document.getElementById("oopsSound");
                oopsSound.volume = 0.3;
                oopsSound.currentTime = 0; 
                oopsSound.play();
            }
        }
    }

    //playing game control button sounds 
    const undoBtn = document.getElementById("undoBtn");
    const hintBtn = document.getElementById("hintBtn");
    const solveBtn = document.getElementById("solveBtn");

    undoBtn.addEventListener("click", clickControl);
    hintBtn.addEventListener("click", clickControl);
    solveBtn.addEventListener("click", clickControl);

    function clickControl() {
        const controlSound = document.getElementById("controlSound");
        controlSound.volume = 0.3;
        controlSound.currentTime = 0; 
        controlSound.play();
    }
});

