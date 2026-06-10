const canvas = document.querySelector("canvas#screen");
const ctx = canvas.getContext('2d');
const sens = 1 / 4;

let viewport = [0, 0]

ctx.fillStyle = "lightblue";


function normalizePosition(x, y) {
  return [
    (x - viewport[0]) * 8,
    window.innerHeight - ((y - viewport[1]) * 8) - 70
  ];
}

// DRAW FUNCTIONS //

function setColor(r, g, b) {
  ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
}

function drawRect(x, y, width, height) {
  let [vx, vy] = normalizePosition(x, y);
  ctx.fillRect(vx, vy, width * 8, height * 8);
}

function drawText(x, y, text, real=false) {
  let [vx, vy] = normalizePosition(x, y);
  if (real) [vx, vy] = [x, y];

  ctx.font = "20px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = 'middle';

  if (real) ctx.textAlign = "right"
  ctx.fillText(text, vx, vy);
}

function clearScreen() {
  ctx.fillStyle = "#87CEEB";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

ctx.clearRect(0, 0, canvas.width, canvas.height);
ctx.fillRect(0, 0, canvas.width, canvas.height);

const dragState = {
  shiftDown: false,
  isDragging: false,
  startX: 0,
  startY: 0
};

window.addEventListener('keydown', (e) => {
  dragState.shiftDown = e.key == "Shift"
});

window.addEventListener("keyup", e => {
  dragState.shiftDown = false;
})

window.addEventListener('mousedown', (e) => {
  if (dragState.shiftDown) {
    dragState.isDragging = true;
    dragState.startX = e.clientX;
    dragState.startY = e.clientY;
  }
});

window.addEventListener('mousemove', (e) => {
  if (!dragState.isDragging) return;

  const deltaX = e.clientX - dragState.startX;
  const deltaY = e.clientY - dragState.startY;

  dragState.startX = e.clientX;
  dragState.startY = e.clientY;

  viewport = [
    viewport[0] - (deltaX / 2) * sens,
    viewport[1] + (deltaY / 2) * sens
  ]

  if (viewport[1] < 0) viewport[1] = 0;
  if (viewport[0] < 0) viewport[0] = 0;
  if (viewport[0] > 5000 - window.innerWidth) viewport[0] = 5000 - window.innerWidth;
});

window.addEventListener('mouseup', () => {
  if (dragState.isDragging) {
    dragState.isDragging = false;
  }
});
