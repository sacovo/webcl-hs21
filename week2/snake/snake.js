const north = { dx: 0, dy: -1 };
const east = { dx: 1, dy: 0 };
const south = { dx: 0, dy: 1 };
const west = { dx: -1, dy: 0 };

let direction = north;

let gameOver = false;

const clockwise = [north, east, south, west, north];
const countercw = [north, west, south, east, north];

const startSnake = () => [
  { x: 10, y: 5 },
  { x: 10, y: 6 },
  { x: 10, y: 7 },
  { x: 10, y: 8 },
];
const startFood = () => ({ x: 15, y: 15 });

let snake = startSnake();
let food = startFood();

function snakeEquals(a, b) {
  return a.x === b.x && a.y === b.y;
}

// function gameOver() {
//   snake = startSnake();
//   food = startFood();
//   direction = north;
// }

function changeDirection(orientation) {
  const idx = orientation.indexOf(direction);
  direction = orientation[idx + 1];
}

function start() {
  const canvas = document.getElementById("canvas");
  const context = canvas.getContext("2d");

  const rightArrow = 39;
  const leftArrow = 37;
  window.onkeydown = (evt) => {
    const orientation = evt.keyCode === rightArrow ? clockwise : countercw;
    changeDirection(orientation);
  };

  setInterval(() => {
    nextBoard();
    display(context);
  }, 1000 / 5);
}

function nextBoard() {
  if (gameOver === true) {
    return;
  }
  const maxX = 20;
  const maxY = 20;
  const oldHead = snake[0];

  function inBounds(x, max) {
    if (x < 0) {
      return max - 1;
    }
    if (x > max) {
      return 0;
    }
    return x;
  }

  const head = {
    x: inBounds(oldHead.x + direction.dx, maxX),
    y: inBounds(oldHead.y + direction.dy, maxY),
  };

  for (let i = 0; i < snake.length; i++) {
    if (snakeEquals(head, snake[i])) {
      gameOver = true;
      return;
    }
  }

  if (snakeEquals(food, head)) {
    // have we found any food?
    food.x = Math.floor(Math.random() * 20); // place new food at random location
    food.y = Math.floor(Math.random() * 20);
  } else {
    snake.pop(); // no food found => no growth despite new head => remove last element
  }

  snake.unshift(head); // put head at front of the list
}

function display(context) {
  // clear
  context.fillStyle = "black";
  context.fillRect(0, 0, canvas.width, canvas.height);
  // draw all elements
  context.fillStyle = "cyan";
  snake.forEach((element) => fillBox(context, element));
  context.fillStyle = "green";
  fillBox(context, snake[0]);
  // draw food
  context.fillStyle = "red";
  fillBox(context, food);
}

function fillBox(context, element) {
  context.fillRect(element.x * 20 + 1, element.y * 20 + 1, 18, 18);
}
