class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  get getX() {
    return this.x;
  }
  get getY() {
    return this.y;
  }

  set setX(x) {
    this.x = x;
  }

  set setY(y) {
    this.y = y;
  }
}

let canvas = document.getElementById("canvas");
let ctx;
if (canvas.getContext) {
  ctx = canvas.getContext("2d");
}

let modeSelect = document.getElementById("mode"),
  clearButton = document.getElementById("clear"),
  setControlPoint = document.getElementById("setControlPoint"),
  xPos = document.getElementById("xPos"),
  yPos = document.getElementById("yPos"),
  moveButton = document.getElementById("move"),
  moveX1 = document.getElementById("moveX1"),
  moveY1 = document.getElementById("moveY1"),
  moveX2 = document.getElementById("moveX2"),
  moveY2 = document.getElementById("moveY2"),
  rotate = document.getElementById("rotate"),
  angle = document.getElementById("angle"),
  scale = document.getElementById("scale"),
  xScale = document.getElementById("xScale"),
  yScale = document.getElementById("yScale");

let points = [];
let controlPoint = new Point(-1, -1),
  drawPoint = new Point(-1, -1);
let mouseX = -1,
  mouseY = -1;

const getCursorPosition = (e) => {
  var x;
  var y;

  if (e.pageX != undefined && e.pageY != undefined) {
    x = e.pageX;
    y = e.pageY;
  } else {
    x =
      e.clientX +
      document.body.scrollLeft +
      document.documentElement.scrollLeft;
    y =
      e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
  }
  return [x, y];
};

const translateByVector = (xVal, yVal) => {
  points.forEach((point) => {
    point.setX = point.getX + xVal;
    point.setY = point.getY + yVal;
  });
};

const rotateByAngle = (originPoint, angle) => {
  var xr = originPoint.getX,
    yr = originPoint.getY,
    cos = Math.cos(angle),
    sin = Math.sin(angle);
  points.forEach((point) => {
    var tempX = xr + (point.getX - xr) * cos - (point.getY - yr) * sin,
      tempY = yr + (point.getX - xr) * sin + (point.getY - yr) * cos;
    point.setX = tempX;
    point.setY = tempY;
  });
};

const scaleByPoint = (originPoint, scaleX, scaleY) => {
  let xf = originPoint.getX,
    yf = originPoint.getY;
  points.forEach((point) => {
    point.setX = xf + (point.getX - xf) * scaleX;
    point.setY = yf + (point.getY - yf) * scaleY;
  });
};

const drawPoints = () => {
  ctx.fillStyle = "red";
  points.forEach((point) => {
    ctx.beginPath();
    ctx.arc(point.getX, point.getY, 2.5, 0, 2 * Math.PI);
    ctx.fill();
  });
  ctx.fillStyle = "black";
};

const drawControlPoint = () => {
  ctx.fillStyle = "blue";
  ctx.beginPath();
  ctx.arc(controlPoint.getX, controlPoint.getY, 5, 0, 2 * Math.PI);
  ctx.fill();
};

const drawBetweenPoints = () => {
  ctx.beginPath();
  ctx.moveTo(points[0].getX, points[0].getY);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].getX, points[i].getY);
  }
  ctx.lineTo(points[0].getX, points[0].getY);
  ctx.closePath();
  ctx.stroke();
};

const clearCanvasAndDraw = () => {
  clearCanvas();
  if (points.length > 2) drawBetweenPoints();
  drawPoints();
};

const clearCanvas = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};

const addPointByClick = (e) => {
  var mx = getCursorPosition(e)[0] - canvas.offsetLeft;
  var my = getCursorPosition(e)[1] - canvas.offsetTop;
  points.push(new Point(mx, my));
};

const addControlPoint = (e) => {
  var mx = getCursorPosition(e)[0] - canvas.offsetLeft;
  var my = getCursorPosition(e)[1] - canvas.offsetTop;
  controlPoint = new Point(mx, my);
};

const addControlPointFromInput = () => {
  if (
    xPos.value >= 0 &&
    yPos.value >= 0 &&
    xPos.value < 1000 &&
    yPos.value < 1000
  ) {
    controlPoint = new Point(xPos.value, yPos.value);
  }
};

const calcDist = (x1, y1, x2, y2) => {
  var xPart = Math.pow(x2 - x1, 2);
  var yPart = Math.pow(y2 - y1, 2);
  return Math.sqrt(xPart + yPart);
};

const checkIfInside = (point) => {
  var n = points.length,
    is_in = false,
    x = point.getX,
    y = point.getY,
    x1,
    x2,
    y1,
    y2;

  for (var i = 0; i < n - 1; ++i) {
    x1 = points[i].getX;
    x2 = points[i + 1].getX;
    y1 = points[i].getY;
    y2 = points[i + 1].getY;

    if (y < y1 != y < y2 && x < ((x2 - x1) * (y - y1)) / (y2 - y1) + x1) {
      is_in = !is_in;
    }
  }

  return is_in;
};

const moveByMouse = (e) => {
  clearCanvasAndDraw();
  if (drawPoint) {
    ctx.moveTo(drawPoint.getX, drawPoint.getY);
    ctx.lineTo(e.pageX - canvas.offsetLeft, e.pageY - canvas.offsetTop);
    ctx.stroke();
  }
};

const stopDrawingAndMove = (e) => {
  var mx = getCursorPosition(e)[0] - canvas.offsetLeft;
  var my = getCursorPosition(e)[1] - canvas.offsetTop;
  var xVal = mx - drawPoint.getX,
    yVal = my - drawPoint.getY;
  translateByVector(xVal, yVal);
  clearCanvasAndDraw();
};

const canvasMouseDown = (event) => {
  mouseX = getCursorPosition(event)[0] - canvas.offsetLeft;
  mouseY = getCursorPosition(event)[1] - canvas.offsetTop;
  switch (modeSelect.value) {
    case "1":
      addPointByClick(event);
      clearCanvasAndDraw();
      canvas.removeEventListener("mousemove", moveByMouse);
      canvas.removeEventListener("mouseup", stopDrawingAndMove);
      break;
    case "2":
      if (checkIfInside(new Point(mouseX, mouseY))) {
        drawPoint = new Point(mouseX, mouseY);
        canvas.addEventListener("mousemove", moveByMouse);
        canvas.addEventListener("mouseup", stopDrawingAndMove);
      } else {
        canvas.removeEventListener("mousemove", moveByMouse);
        canvas.removeEventListener("mouseup", stopDrawingAndMove);
      }
      break;
    case "3":
      if (event.ctrlKey) {
        addControlPoint(event);
        clearCanvasAndDraw();
        drawControlPoint();
      }
      break;
    case "4":
      if (event.ctrlKey) {
        addControlPoint(event);
        clearCanvasAndDraw();
        drawControlPoint();
      }
      break;
  }
};

const removeCanvasEventListeners = () => {
  canvas.removeEventListener("mousemove", moveByMouse);
};

canvas.addEventListener("mousedown", canvasMouseDown);

canvas.addEventListener("mouseup", () => {
  removeCanvasEventListeners();
  canvas.addEventListener("mousedown", canvasMouseDown);
});

clearButton.addEventListener("click", () => {
  clearCanvas();
  points = [];
  controlPoint = null;
});

setControlPoint.addEventListener("click", () => {
  if (["3", "4"].includes(modeSelect.value)) {
    addControlPointFromInput();
    clearCanvasAndDraw();
    drawControlPoint();
  }
});

moveButton.addEventListener("click", () => {
  console.log("moveButton");
  if (modeSelect.value === "2") {
    var xVal = moveX2.value - moveX1.value,
      yVal = moveY2.value - moveY1.value;
    translateByVector(xVal, yVal);
    clearCanvasAndDraw();
  } else {
    alert("Choose move mode!");
  }
});

rotate.addEventListener("click", () => {
  if (modeSelect.value === "3" && angle.value > 0) {
    var temp = ((Number(angle.value) % 360) * Math.PI) / 180;
    rotateByAngle(controlPoint, temp);
    clearCanvasAndDraw();
    drawControlPoint();
  }
});

scale.addEventListener("click", () => {
  if (modeSelect.value === "4") {
    scaleByPoint(controlPoint, xScale.value, yScale.value);
    clearCanvasAndDraw();
    drawControlPoint();
  }
});
