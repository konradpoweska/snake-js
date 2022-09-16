"use strict";

// CONFIG
const CANVAS_SIZE = {
  x: 20,
  y: 20,
};
const GRID_DENSITY = 1;
const GRID_SIZE = {
  x: CANVAS_SIZE.x / GRID_DENSITY,
  y: CANVAS_SIZE.y / GRID_DENSITY,
};
const INITIAL_LENGTH = 3;
const FRAME_INTERVAL = 100;
const SNAKE_DIRECTIONS = {
  UP: { axis: 'y', value: -1 },
  RIGHT: { axis: 'x', value: 1 },
  DOWN: { axis: 'y', value: 1 },
  LEFT: { axis: 'x', value: -1 },
};
const BUTTON_DIRECTION = {
  upButton: 'UP',
  rightButton: 'RIGHT',
  downButton: 'DOWN',
  leftButton: 'LEFT',
};
const KEY_DIRECTION = {
  ArrowUp: 'UP',
  ArrowRight: 'RIGHT',
  ArrowDown: 'DOWN',
  ArrowLeft: 'LEFT',
};

// FUNCTIONS
const initCanvas = () => {
  const canvasEl = document.getElementById('gameCanvas');
  canvasEl.width = CANVAS_SIZE.x;
  canvasEl.height = CANVAS_SIZE.y;
  return canvasEl;
};

const positionEquals = (a, b) => a.x === b.x && a.y === b.y;
const positionCollides = (pos, posArr) =>
  posArr.some((el) => positionEquals(pos, el));
const collidesWithSnake = (pos) => positionCollides(pos, snake);

const generateApplePosition = () => {
  let position;
  do {
    position = {
      x: Math.floor(Math.random() * GRID_SIZE.x),
      y: Math.floor(Math.random() * GRID_SIZE.y),
    };
  } while (collidesWithSnake(position));
  return position;
};

const modulo = (a, b) => {
  const r = a % b;
  return r < 0 ? r + b : r;
};

const scoreContainer = document.getElementById('scoreContainer');
const increaseScore = () => (scoreContainer.innerHTML = `${++score}`);

const loseGame = () => {
  document.body.style.backgroundColor = '#fee';
  clearInterval(interval);
};

// RENDERING

/** @param ctx {CanvasRenderingContext2D} */
const drawRectangle = (ctx, { x, y }, color) => {
  ctx.fillStyle = color ?? '#000';
  ctx.fillRect(x * GRID_DENSITY, y * GRID_DENSITY, GRID_DENSITY, GRID_DENSITY);
};

const renderFrame = () => {
  ctx.clearRect(0, 0, CANVAS_SIZE.x, CANVAS_SIZE.y);
  drawRectangle(ctx, applePosition, '#f00');
  for (let rect of snake) drawRectangle(ctx, rect);
};

// STATE INIT
const canvas = initCanvas();
const ctx = canvas.getContext('2d');

let score = 0;
const snake = [{ x: 3, y: 3 }];
let snakeDirection = SNAKE_DIRECTIONS.RIGHT;
const directionChangesQueue = [];
let grow = INITIAL_LENGTH - snake.length;
let applePosition = generateApplePosition();

// ITERATION
const iteration = () => {
  const [snakeHead, ...snakeTail] = snake;

  const directionChange = directionChangesQueue.shift();
  if (directionChange && directionChange.axis !== snakeDirection.axis)
    snakeDirection = directionChange;

  const { axis } = snakeDirection;
  const newSnakeHead = {
    ...snakeHead,
    [axis]: modulo(snakeHead[axis] + snakeDirection.value, GRID_SIZE[axis]),
  };

  if (positionCollides(newSnakeHead, snakeTail)) return loseGame();

  if (positionEquals(newSnakeHead, applePosition)) {
    grow = 1;
    applePosition = generateApplePosition();
    increaseScore();
  }

  snake.unshift(newSnakeHead);
  grow ? grow-- : snake.pop();

  requestAnimationFrame(renderFrame);
};

// INIT
const changeDirection = (direction) =>
  directionChangesQueue.push(SNAKE_DIRECTIONS[direction]);

document.body.addEventListener('keydown', (e) => {
  const direction = KEY_DIRECTION[e.key]
  if (direction) changeDirection(direction);
});

for (let buttonId in BUTTON_DIRECTION) {
  const button = document.getElementById(buttonId);
  const direction = BUTTON_DIRECTION[buttonId];

  button.addEventListener('touchstart', (e) => {
    e.preventDefault();
    changeDirection(direction);
  });
  button.addEventListener('click', () => changeDirection(direction));
}

const interval = setInterval(iteration, FRAME_INTERVAL);
