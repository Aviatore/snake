var container;
var container;
var width = 20;
var height = 20;
var xElements = 8;
var yElements = 15;
var brickMargin = (30 * width) / 200;
var marginTop = (-5 * width) / 200;
var outline = (20 * width) / 200;
var loop;
// container = document.getElementById('container');


document.addEventListener('DOMContentLoaded', onLoad);

function onLoad() {
    container = document.getElementById('container');

    for (let row=0; row <= yElements; row++) {
        let newRow = document.createElement('DIV');

        for (let column=0; column <= xElements; column++) {
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
            newDiv.id = `${column}:${row}`;
            newDiv.isMarked = false;
            newDiv.isMarkedB = false;

            newRow.appendChild(newDiv);
        }

        container.appendChild(newRow);
    }

    drawBrick();
    document.addEventListener('keydown', e => {
        switch (e.key) {
            // case "ArrowDown":
            //     move('down');
            //     break;
            case "ArrowUp":
                rotate();
                break;
            // case "ArrowLeft":
            //     move('left');
            //     break;
            // case "ArrowRight":
            //     move('right');
            //     break;
        }

        if (!detectColission(e.key)) {
            move(e.key)
            drawBrick(e.key);
        }
        // drawBrick(e.key);

    })
}

let bricks = [
    [
        [0,1,0],
        [0,1,0],
        [1,1,0]
    ],
    [
        [0,0,0],
        [0,1,0],
        [1,1,1]
    ],
    [
        [1,1],
        [1,1]
    ],
    [
        [0,0,0,0],
        [1,1,1,1],
        [0,0,0,0],
        [0,0,0,0]
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
    return bricks[index];
}

let brick = {
    item: [
        [0,1,0],
        [0,1,0],
        [1,1,0]
    ],
    pos: {
        x: 1,
        y: 1
    }
};

function placeBrick() {
    for (let row = 0; row < brick.item.length; row++) {
        for (let col = 0; col < brick.item[0].length; col++) {
            let id = `${brick.pos.x + col}:${brick.pos.y + row}`;
            let dot = document.getElementById(id);

            if (dot !== null) {
                if (dot.isMarkedB) {
                    dot.isMarked = true;
                }
            }
        }
    }
    brick.pos.x = 1;
    brick.pos.y = 1;
    brick.item = randomBrick();
    drawBrick();
}

function detectColission(direction) {
    for (let row = 0; row < brick.item.length; row++) {
        for (let col = 0; col < brick.item[0].length; col++) {
            let xOffset = 0;
            let yOffset = 0;

            if (direction == 'ArrowLeft') {xOffset = -1}
            else if (direction == 'ArrowRight') {xOffset = 1}
            else if (direction == 'ArrowDown') {yOffset = 1}

            let id = `${brick.pos.x + col}:${brick.pos.y + row}`;
            let dot = document.getElementById(id);

            let nextId = `${brick.pos.x + col + xOffset}:${brick.pos.y + row + yOffset}`;
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

function rotate() {
    let newItem = [];

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

    for (let col = 0; col <= brick.item[0].length - 1; col++) {
        let tmp = []
        for (let row = brick.item.length - 1; row >= 0; row--) {
            let id = `${brick.pos.x + col}:${brick.pos.y + row}`;
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
    for (let row = 0; row < brick.item.length; row++) {
        for (let col = 0; col < brick.item[0].length; col++) {
            let xOffset;
            let yOffset;

            if (direction == 'ArrowLeft') {xOffset = -1}
            else if (direction == 'ArrowRight') {xOffset = 1}
            else if (direction == 'ArrowDown') {yOffset = 1}

            let id = `${brick.pos.x + col}:${brick.pos.y + row}`;
            let dot = document.getElementById(id);

            let nextId = `${brick.pos.x + col + xOffset}:${brick.pos.y + row + yOffset}`;
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

function clear() {
    for (let row = 0; row < yElements + 1; row++) {
        for (let col = 0; col < xElements + 1; col++) {
            let id = `${col}:${row}`;
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

function isLineFull() {
    let rows = [];

    for (let row = 0; row < yElements + 1; row++) {
        let counts = 0;

        for (let col = 0; col < xElements + 1; col++) {
            let id = `${col}:${row}`;
            let dot = document.getElementById(id);

            if (dot.isMarked) {counts++}
        }

        if (counts == xElements + 1) {
            rows.push(row);
        }
    }

    if (rows.length > 0) {
        console.log(`row Ids: ${rows}`);
        clearLines(rows);
        // clearInterval(loop);
        return [...[true, rows]];
    }

    return [...[false, rows]];
}

function clearLines(rows) {
    console.log('squash');
    for (let row of rows) {
        for (let col = 0; col < xElements + 1; col++) {
            let id = `${col}:${row}`;

            let dot = document.getElementById(id);

            switchOffB(dot, 'off');
        }
    }
}

function squash(rows) {
    for (let row of rows) {
        for (let rowIndex = row; rowIndex >= 0; rowIndex--) {
            for (let col = 0; col < xElements + 1; col++) {
                let idPrev = `${col}:${rowIndex - 1}`;
                let id = `${col}:${rowIndex}`;
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

let squashed = false;
let rows = [];
function loop() {
    if (squashed) {
        squash(rows);
        squashed = false;
    } else {
        if (!detectColission('ArrowDown')) {
            move('ArrowDown')
            drawBrick('ArrowDown');
        }
    }

    [squashed, rows] = isLineFull();
}

// loop = setInterval(loop, 1000);