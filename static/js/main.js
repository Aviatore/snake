var container;
var container;
var width = 14;
var height = 14;
var xElements = 9;
var yElements = 19;
var brickMargin = (30 * width) / 200;
var marginTop = (-30 * width) / 200;
var outline = (28 * width) / 200;
var loop;
var gameOverLoop;
// container = document.getElementById('container');
var lock = false;
let squashed = false;
let rows = [];
let pointsPerLine = 100;
let pointsMultiplicate = 0.5;
const placeholderXElements = 3;
const placeholderYElements = 3;
const dotMainBoardPrefix = 'M';
const dotPlaceholderBoardPrefix = 'P';
let mediumButtonLeft = document.querySelector('#medium-button-left')
let mediumButtonRight = document.querySelector('#medium-button-right')
let mediumButtonLow = document.querySelector('#medium-button-low')
let bigButton = document.querySelector('#big-button')
let keyPadLock = false;
var pause = false;
let gamePause = false;
let pauseBlink;


document.addEventListener('DOMContentLoaded', onLoad);


function fillDots(container, rowLen, colLen, prefix) {
    for (let row=0; row <= rowLen; row++) {
        let newRow = document.createElement('DIV');

        for (let column=0; column <= colLen; column++) {
            let newDiv = document.createElement('DIV');
            newDiv.style.border = `${outline}px solid #9aa680`;
            newDiv.style.backgroundColor = '#879571';
            newDiv.style.outline = `${outline}px solid #879571`;
            newDiv.style.width = `${width}px`;
            newDiv.style.height = `${height}px`;
            newDiv.style.margin = `${brickMargin}px`;
            newDiv.style.marginTop = `${marginTop}px`;
            // newDiv.style.paddingTop = '-2px';
            newDiv.style.boxSizing = 'border-box';
            newDiv.style.lineHeight = '0';

            newDiv.style.display = 'inline-block';
            newDiv.id = `${prefix}:${column}:${row}`;
            newDiv.isMarked = false;
            newDiv.isMarkedB = false;

            newRow.appendChild(newDiv);
        }

        container.appendChild(newRow);
    }
}


function onLoad() {
    container = document.getElementById('container');

    fillDots(container, yElements, xElements, dotMainBoardPrefix);

    drawBrick();
    document.addEventListener('keydown', e => {
        if (!keyPadLock) {
            switch (e.key) {
                case "ArrowDown":
                    mediumButtonLow.classList.add('medium-button-low');
                    break;
                case "ArrowUp":
                    bigButton.classList.add('big-button');
                    rotate();
                    break;
                case "ArrowLeft":
                    mediumButtonLeft.classList.add('medium-button-left');
                    break;
                case "ArrowRight":
                    mediumButtonRight.classList.add('medium-button-right');
                    break;
                case "i":
                    pauseTheGame();
            }

            if (!detectColission(e.key) && !lock) {
                // lock = true;
                // move(e.key)
                // drawBrick(e.key);
                loops(e.key);
            }
            // drawBrick(e.key);
        }
    })

    document.addEventListener('keyup', e => {
        mediumButtonLeft.classList.remove('medium-button-left')
        mediumButtonRight.classList.remove('medium-button-right')
        mediumButtonLow.classList.remove('medium-button-low')
        bigButton.classList.remove('big-button')
        lock = false;
    })


    let scoreDiv = document.getElementById('score-panel');
    // scoreDiv.style.border = '1px solid black';
    let currentScore = 999
    scoreDiv.innerHTML = `
       <h1 id="score-title">SCORE</h1>
       <h1 id="current-score">0</h1>
       <h1 id="high-score-title">HI-SCORE</h1>
       <h1 id="high-score">0</h1>
       <div id="placeholder"></div>
       <h1 id="speed-title">SPEED</h1>
       <h1 id="speed">0</h1>
       <h1 id="level-title">LEVEL</h1>
       <h1 id="level">0</h1>
<!--       <h1 id="speaker">&#128264;</h1>-->
      <h1>&nbsp;</h1><h1>&nbsp;</h1>
       <i class="fas fa-mug-hot" id="mug"></i><br>
        <span id="pause" class="pauseOff">PAUSE</span>`;
    let headings = scoreDiv.querySelectorAll('h1')
    for (let i = 0; i < headings.length; i++    ) {
        headings[i].style.fontFamily = 'auto digital';
        headings[i].style.fontSize = '18px';
    }
    scoreDiv.style.textAlign = 'center'
    // scoreDiv.style.border = `${outline}px solid #9aa680`;
    // scoreDiv.style.width = '20%';
    // scoreDiv.style.height = '69.15%';
    // scoreDiv.style.right = '48%';
    // scoreDiv.style.top = '1.3%';
    scoreDiv.style.backgroundColor = '#9aa680';

    let placeholder = document.getElementById('placeholder');
    placeholder.style.display = "inline-block";
    placeholder.style.padding = "8px 2px 2px 2px";

    fillDots(placeholder, placeholderYElements, placeholderXElements, dotPlaceholderBoardPrefix);

    // Generate next random brick
    [brick.next.type, brick.next.item] = randomBrick();
    randomRotation();

    drawBrickPlaceHolder();
    // gameOverClearScreen();
    // clearScreenController();

    get_highscore();
}

function randomRotation() {
    let numberOfTimes = Math.floor(Math.random() * 4);

    for (let time = 0; time < numberOfTimes; time++) {
        rotateRight('placeholder');
    }
}

let bricks = [
    [
        [0,1,0],
        [0,1,0],
        [1,1,0]
    ],
    [

        [0,1,0],
        [1,1,1],
        [0,0,0],
    ],
    [
        [1,1],
        [1,1]
    ],
    [
        [0,0,0,0],
        [0,0,0,0],
        [1,1,1,1],
        [0,0,0,0],
    ],
    [
        [0,1,0],
        [1,1,0],
        [1,0,0]
    ]
];

function randomBrick() {
    let index = Math.floor(Math.random() * bricks.length);
    console.log(index);
    return [...[index, bricks[index]]];
}

let brick = {
    item: [
        [0,1,0],
        [0,1,0],
        [1,1,0]
    ],
    next: {
        item: [],
        type: null,
    },
    type: 0,
    stage: 0,
    pos: {
        x: 4,
        y: -3
    }
};

// ----- ANIMATED CLEAR SCREEN -----
var rowLen;
var colLen;
var deepness = 0;
var dir;

function drawLine(f, dot, mode, timeout) {
    return new Promise(resolve => {
        setTimeout(function() {
            // console.log(dot.id);
            resolve(f(dot, mode));
        }, timeout)
    });
}

async function clearScreenController() {
    rowLen = yElements;
    colLen = xElements;
    deepness = 0;
    dir = 'up';

    keyPadLock = true;
    while (deepness < 5) {
        await gameOverClearScreen('on');
    }

    rowLen = yElements;
    colLen = xElements;
    dir = 'up';
    deepness = 0;

    while (deepness < 5) {
        await gameOverClearScreen('off');
    }
    keyPadLock = false;
}

async function gameOverClearScreen(mode) {
    deepness = xElements - colLen;
    console.log(`deepness: ${deepness}`);
    let dot;

    if (dir == 'up') {
        for (let row = rowLen; row >= deepness; row--) {
            let id = `${dotMainBoardPrefix}:${deepness}:${row}`;
            dot = document.getElementById(id);
            if (dot == null) {console.log(`${id} is null`)} else {console.log(id)}

            if (!dot.isMarked && mode == 'on') {
                await drawLine(switchOffB, dot, mode, 10);
            } else if (mode == 'off') {
                await drawLine(switchOffB, dot, mode, 10);
            }
        }
        dir = 'right';
    } else if (dir == 'down') {
        for (let row = deepness + 1; row < rowLen + 1; row++) {
            let id = `${dotMainBoardPrefix}:${colLen}:${row}`;
            dot = document.getElementById(id);

            if (!dot.isMarked && mode == 'on') {
                await drawLine(switchOffB, dot, mode, 10);
            } else if (mode == 'off') {
                await drawLine(switchOffB, dot, mode, 10);
            }
        }
        rowLen--;
        colLen--;
        dir = 'left';
    } else if (dir == 'left') {
        for (let col = colLen; col >= deepness; col--) {
            let id = `${dotMainBoardPrefix}:${col}:${rowLen + 1}`;
            dot = document.getElementById(id);

            if (!dot.isMarked && mode == 'on') {
                await drawLine(switchOffB, dot, mode, 10);
            } else if (mode == 'off') {
                await drawLine(switchOffB, dot, mode, 10);
            }
        }
        dir = 'up';
    } else if (dir == 'right') {
        for (let col = deepness + 1; col < colLen + 1; col++) {
            let id = `${dotMainBoardPrefix}:${col}:${deepness}`;
            // console.log(id);
            dot = document.getElementById(id);

            if (!dot.isMarked && mode == 'on') {
                await drawLine(switchOffB, dot, mode, 10);
            } else if (mode == 'off') {
                await drawLine(switchOffB, dot, mode, 10);
            }
        }
        dir = 'down';
    }
}
// ---------------------------------


// ----- ANIMATED CLEAR LINE -----
async function clearLinesAnim(rows) {
    pause = true;
    let offset = 4;

    let score = document.getElementById("current-score");
    let rowNum = 1;
    for (let row of rows) {
        for (let col = offset; col >= 0; col--) {
            let idLeft = `${dotMainBoardPrefix}:${col}:${row}`;
            let idRight = `${dotMainBoardPrefix}:${xElements - col}:${row}`;

            let dotLeft = document.getElementById(idLeft);
            let dotRight = document.getElementById(idRight);

            let drawDotLeft = drawLine(switchOffB, dotLeft, 'off', 50);
            let drawDotRight = drawLine(switchOffB, dotRight, 'off', 50);

            await Promise.all([drawDotLeft, drawDotRight]);
        }

        score.innerText = Number(score.innerText) + (rowNum * pointsPerLine);
        rowNum += pointsMultiplicate;
    }
    pause = false;
}


// -------------------------------

function placeBrick() {
    for (let row = 0; row < brick.item.length; row++) {
        for (let col = 0; col < brick.item[0].length; col++) {
            let id = `${dotMainBoardPrefix}:${brick.pos.x + col}:${brick.pos.y + row}`;
            let dot = document.getElementById(id);

            if (dot !== null) {
                if (dot.isMarkedB) {
                    dot.isMarked = true;
                }
            }
        }
    }

    if (brick.pos.y < 0) {
        console.log('Game over!');
        drawBrick();
        clearScreenController();
        clearInterval(loop);

        let score = document.getElementById("current-score");
        score.innerText = '0';
        get_highscore(Number(score.innerText));

    }

    // Update current brick
    brick.type = brick.next.type;
    brick.item = [...brick.next.item];
    brick.stage = 0;
    brick.pos.x = 4;
    brick.pos.y = brick.item.length * -1;
    // drawBrick();

    // Generate next random brick
    [brick.next.type, brick.next.item] = randomBrick();
    randomRotation();
    drawBrickPlaceHolder();
}

function detectColission(direction) {
    for (let row = 0; row < brick.item.length; row++) {
        for (let col = 0; col < brick.item[0].length; col++) {
            let xOffset = 0;
            let yOffset = 0;

            if (direction == 'ArrowLeft') {xOffset = -1}
            else if (direction == 'ArrowRight') {xOffset = 1}
            else if (direction == 'ArrowDown') {yOffset = 1}

            let id = `${dotMainBoardPrefix}:${brick.pos.x + col}:${brick.pos.y + row}`;
            let dot = document.getElementById(id);

            let nextId = `${dotMainBoardPrefix}:${brick.pos.x + col + xOffset}:${brick.pos.y + row + yOffset}`;
            let nextDot = document.getElementById(nextId);


            if (direction == 'ArrowLeft' && dot != undefined) {
                if ((brick.pos.x + col === 0 && dot.isMarkedB) ||
                    (dot.isMarkedB && nextDot.isMarked)) {
                    console.log(`1 ${dot.id}`);

                    return true;
                }
            } else if (direction == 'ArrowRight' && dot != undefined) {
                if ((brick.pos.x + col === xElements + 0 && dot.isMarkedB) ||
                    (dot.isMarkedB && nextDot.isMarked)) {
                    console.log(`2 col: ${col} row: ${row} posX: ${brick.pos.x} id: ${id}`);
                    return true;
                }
            } else if (direction == 'ArrowDown' && dot != undefined) {
                if ((brick.pos.y + row === yElements + 0 && dot.isMarkedB) ||
                    (dot.isMarkedB && nextDot.isMarked)) {

                    placeBrick();
                    console.log(`3 ${dot.id} ${dot.isMarkedB} ${nextId}`);

                    // [squashed, rows] = isLineFull();
                    isLineFull();

                    return true;
                }
            }


            // } else if (dot !== null) {
            //     if (dot.isMarked) {
            //         console.log(`4 ${dot.id}`);
            //         return true
            //     }
            // }
        }
    }

    return false;
}

function move(direction) {
    if (direction === 'ArrowLeft') {
        brick.pos.x--;
    } else if (direction === 'ArrowRight') {
        brick.pos.x++;
    } else if (direction === 'ArrowDown') {
        // console.log(brick.pos.y + brick.item.length);
        brick.pos.y++;
    }
    // console.log(`x: ${brick.pos.x} y: ${brick.pos.y} len: ${brick.item.length}`);
}

function rotateRight(brickType) {
    let newItem = [];
    let prefix;
    let brickItem;
    let brickPos;

    if (brickType == 'main') {
        prefix = dotMainBoardPrefix;
        brickItem = brick.item;
        brickPos = brick.pos;
    } else if (brickType == 'placeholder') {
        prefix = dotPlaceholderBoardPrefix;
        brickItem = brick.next.item;
        brickPos = {x: 0, y: 0};
    }


    for (let col = 0; col <= brickItem[0].length - 1; col++) {
        let tmp = []
        for (let row = brickItem.length - 1; row >= 0; row--) {
            let id = `${prefix}:${brickPos.x + col}:${brickPos.y + row}`;
            let dot = document.getElementById(id);

            if (dot !== null) {
                if (dot.isMarked) {
                    return;
                }
            }

            tmp.push(brickItem[row][col]);
        }
        newItem.push(tmp);
    }

    if (brickType == 'main') {
        brick.item = [...newItem];
    } else if (brickType == 'placeholder') {
        brick.next.item = [...newItem];
    }

}

function rotateLeft() {
    let newItem = [];

    for (let col = brick.item[0].length - 1; col >= 0 ; col--) {
        let tmp = [];
        for (let row = 0; row <= brick.item.length - 1; row++) {
            let id = `${dotMainBoardPrefix}:${brick.pos.x + col}:${brick.pos.y + row}`;
            let dot = document.getElementById(id);

            if (dot !== null) {
                if (dot.isMarked) {
                    return;
                }
            }

            tmp.push(brick.item[row][col]);
        }
        newItem.push(tmp);
    }
    brick.item = [...newItem];
}

function rotate() {
    // Solve the problem with brick rotation at the edge
    if (brick.pos.x + brick.item[0].length - 1 > xElements) {
        brick.pos.x = xElements - (brick.item[0].length - 1);
    }

    if (brick.pos.x < 0) {
        brick.pos.x = 0;
    }

    if (brick.pos.y + brick.item.length - 1 > yElements) {
        brick.pos.y = yElements - (brick.item.length - 1);
    }

    if ([3, 4].includes(brick.type)) {
        if (brick.stage === 0) {
            console.log(`right, ${brick.type}`);
            rotateRight('main');
            brick.stage = 1;
        } else {
            console.log(`left, ${brick.type}`);
            rotateLeft();
            brick.stage = 0;
        }
    } else {
        rotateRight('main');
    }

    console.log(`brick index: ${brick.type}`);
}

function switchDot(dot, x) {
    if (x === 'off') {
        dot.style.backgroundColor = '#879571';
        dot.style.outlineColor = '#879571';
        dot.isMarkedB = false;
    } else if (x === 'on') {
        dot.style.backgroundColor = '#000';
        dot.style.outlineColor = '#000';
        dot.isMarkedB = true;
    }

}

function toggleDot(dot) {
    if (dot.style.backgroundColor == '#879571') {
        dot.style.backgroundColor = '#000';
        dot.style.outlineColor = '#000';
    } else {
        dot.style.backgroundColor = '#879571';
        dot.style.outlineColor = '#879571';
    }
}

function switchOffB(dot, x) {
    if (x === 'off') {
        dot.style.backgroundColor = '#879571';
        dot.style.outlineColor = '#879571';
        dot.isMarked = false;
    } else if (x === 'on') {
        dot.style.backgroundColor = '#000';
        dot.style.outlineColor = '#000';
        dot.isMarked = true;
    }
}



function drawBrick(direction=null) {
    clear();

    // debugger;

    for (let row = 0; row < brick.item.length; row++) {
        for (let col = 0; col < brick.item[0].length; col++) {
            let xOffset;
            let yOffset;

            if (direction == 'ArrowLeft') {xOffset = -1}
            else if (direction == 'ArrowRight') {xOffset = 1}
            else if (direction == 'ArrowDown') {yOffset = 1}

            let id = `${dotMainBoardPrefix}:${brick.pos.x + col}:${brick.pos.y + row}`;
            let dot = document.getElementById(id);

            let nextId = `${dotMainBoardPrefix}:${brick.pos.x + col + xOffset}:${brick.pos.y + row + yOffset}`;
            let nextDot = document.getElementById(nextId);
            // console.log(id);


            if (brick.item[row][col] === 0 && dot !== null) {
                if (nextDot !== null) {
                    if (!nextDot.isMarked) {
                        switchDot(dot, 'off');
                    }
                }

            } else if (brick.item[row][col] === 1 && dot !==null) {
                switchDot(dot, 'on');
            }
        }
    }
}

function drawBrickPlaceHolder() {
    clearPlaceHolder();

    for (let row = 0; row < brick.next.item.length; row++) {
        for (let col = 0; col < brick.next.item[0].length; col++) {
            let id = `${dotPlaceholderBoardPrefix}:${col}:${row}`;
            console.log(id);
            let dot = document.getElementById(id);

            if (brick.next.item[row][col] === 0) {
                switchDot(dot, 'off');
            } else if (brick.next.item[row][col] === 1) {
                switchDot(dot, 'on');
            }
        }
    }
}

function pauseTheGame() {
    let mug = document.getElementById('mug');
    let pauseTxt = document.getElementById('pause');

    if (!gamePause) {
        gamePause = true;
        mug.style.color = '#000';
        pauseBlink = setInterval(blinkPause, 500);
        clearInterval(loop);
    } else if (gamePause) {
        gamePause = false;
        mug.style.color = '#879571';
        clearInterval(pauseBlink);
        if (pauseTxt.classList.contains('pauseOn')) {
            pauseTxt.classList.remove('pauseOn');
            pauseTxt.classList.add('pauseOff');
        }
        loop = setInterval(loops, 1000);
    }
}

function blinkPause() {
    let pauseTxt = document.getElementById('pause');

    if (pauseTxt.classList.contains('pauseOff')) {
        pauseTxt.classList.remove('pauseOff');
        pauseTxt.classList.add('pauseOn');
    } else {
        pauseTxt.classList.remove('pauseOn');
        pauseTxt.classList.add('pauseOff');
    }
}

function clear() {
    for (let row = 0; row < yElements + 1; row++) {
        for (let col = 0; col < xElements + 1; col++) {
            let id = `${dotMainBoardPrefix}:${col}:${row}`;
            let dot = document.getElementById(id);

            if (dot !== null) {
                dot.isMarkedB = false;
            }

            if (!dot.isMarked) {
                switchDot(dot, 'off');
            }

        }
    }
}

function clearPlaceHolder() {
    for (let row = 0; row < placeholderYElements + 1; row++) {
        for (let col = 0; col < placeholderXElements + 1; col++) {
            let id = `${dotPlaceholderBoardPrefix}:${col}:${row}`;
            let dot = document.getElementById(id);

            switchDot(dot, 'off');
        }
    }
}

function isLineFull() {

    let rows_tmp = [];

    for (let row = 0; row < yElements + 1; row++) {
        let counts = 0;

        for (let col = 0; col < xElements + 1; col++) {
            let id = `${dotMainBoardPrefix}:${col}:${row}`;
            let dot = document.getElementById(id);

            if (dot.isMarked) {counts++}
        }

        if (counts == xElements + 1) {
            rows_tmp.push(row);
        }
    }

    if (rows_tmp.length > 0) {
        lock = true;
        console.log(`row Ids: ${rows}`);
        (async () => {clearLinesAnim(rows_tmp)})();
        // clearLines(rows_tmp);
        // clearInterval(loop);
        // return [...[true, rows_tmp]];
        squashed = true;
        rows = rows_tmp;
        return
    }

    squashed = false;
    rows = rows_tmp;
    // return [...[false, rows_tmp]];
}

function clearLines(rows) {
    console.log('squash');
    let score = document.getElementById("current-score");
    let rowNum = 1;
    for (let row of rows) {

        for (let col = 0; col < xElements + 1; col++) {
            let id = `${dotMainBoardPrefix}:${col}:${row}`;

            let dot = document.getElementById(id);

            switchOffB(dot, 'off');
        }

        score.innerText = Number(score.innerText) + (rowNum * pointsPerLine);
        rowNum += pointsMultiplicate;
    }
}

function squash(rows) {
    for (let row of rows) {
        for (let rowIndex = row; rowIndex >= 0; rowIndex--) {
            for (let col = 0; col < xElements + 1; col++) {
                let idPrev = `${dotMainBoardPrefix}:${col}:${rowIndex - 1}`;
                let id = `${dotMainBoardPrefix}:${col}:${rowIndex}`;
                let dot = document.getElementById(id);
                let dotPrev = document.getElementById(idPrev);

                if (dotPrev !== null) {
                    if (dotPrev.isMarked) {
                        switchOffB(dot, 'on');
                    } else {
                        switchOffB(dot, 'off');
                    }
                } else {
                    switchOffB(dot, 'off');
                }
                // debugger;
            }
        }
    }
}

function loops(direction = null) {
    if (pause) {
        console.log('pause');
        return;
    }
    if (squashed) {
        squash(rows);
        squashed = false;

        brick.pos.x = 4;
        brick.pos.y = brick.item.length * -1;

        return;
    }

    if (direction !=null && !lock) {
        move(direction)
        drawBrick(direction);
    }
    else {
        if (squashed) {
            squash(rows);
            squashed = false;
            return;
        } else {
            if (!detectColission('ArrowDown')) {
                move('ArrowDown')
                drawBrick('ArrowDown');
            }
        }
    }
}

function get_highscore(score=null) {
    const xhr = new XMLHttpRequest();
    xhr.addEventListener("load", e => {
        if (xhr.status === 200) {

            let h1_highscore = document.getElementById("high-score");
            let highscore = JSON.parse(xhr.response);
            console.log(`highscore: ${highscore.highscore}`);
            h1_highscore.innerText = highscore.highscore;
        }
    });

    if (score === null) {
        xhr.open("GET", "/highscore", true);
    } else {
        xhr.open("GET", `/highscore/${score}`, true);
    }

    xhr.send();
}

loop = setInterval(loops, 1000);
// gameOverClearScreen();
// gameOverLoop = setInterval(gameOverClearScreen, 1000);
