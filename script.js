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
  angleValue = document.getElementById("angle"),
  scale = document.getElementById("scale"),
  xScale = document.getElementById("xScale"),
  yScale = document.getElementById("yScale"),
  save = document.getElementById("save"),
  loadBtn = document.getElementById("loadBtn");

let points = [];
let controlPoint = new Point(-1, -1),
  drawPoint = new Point(-1, -1);
let mouseX = -1,
  mouseY = -1,
  angle = -1;

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

const calcRad = (angle) => {
  return ((Number(angle) % 360) * Math.PI) / 180;
};

const calcScales = (beg, end) => {
  var scale = 1;
  var begCP = calcDist(
      beg.getX,
      beg.getY,
      controlPoint.getX,
      controlPoint.getY
    ),
    begEnd = calcDist(beg.getX, beg.getY, end.getX, end.getY),
    endCP = calcDist(end.getX, end.getY, controlPoint.getX, controlPoint.getY);
  if (begCP < endCP) {
    scale = (begEnd + begCP) / begCP;
  } else {
    scale = (begCP - begEnd) / begCP;
  }

  return scale;
};

function pointInPolygon(point) {
  const x = point.getX,
    y = point.getY;
  let wn = 0;

  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    let xi = points[i].getX,
      yi = points[i].getY;
    let xj = points[j].getX,
      yj = points[j].getY;

    if (yj <= y) {
      if (yi > y) {
        if (isLeft(new Point(xj, yj), new Point(xi, yi), new Point(x, y)) > 0) {
          wn++;
        }
      }
    } else {
      if (yi <= y) {
        if (isLeft(new Point(xj, yj), new Point(xi, yi), new Point(x, y)) < 0) {
          wn--;
        }
      }
    }
  }
  return wn != 0;
}

function isLeft(P0, P1, P2) {
  let res =
    (P1.getX - P0.getX) * (P2.getY - P0.getY) -
    (P2.getX - P0.getX) * (P1.getY - P0.getY);
  return res;
}

const moveByMouse = (e) => {
  var mx = getCursorPosition(e)[0] - canvas.offsetLeft;
  var my = getCursorPosition(e)[1] - canvas.offsetTop;
  clearCanvasAndDraw();
  if (drawPoint) {
    var xVal = mx - drawPoint.getX,
      yVal = my - drawPoint.getY;
    translateByVector(xVal, yVal);
    drawPoint.setX = mx;
    drawPoint.setY = my;
  }
};

const stopMoving = () => {
  drawPoint = new Point(-1, -1);
  clearCanvasAndDraw();
};

const rotateByMouse = (e) => {
  var mx = getCursorPosition(e)[0] - canvas.offsetLeft;
  var my = getCursorPosition(e)[1] - canvas.offsetTop;
  clearCanvasAndDraw();
  drawControlPoint();
  if (controlPoint.getX === -1)
    alert("Set control point by text input or CTRL + Left Click!");
  if (drawPoint && controlPoint.getX !== -1) {
    var startAngle = Math.atan2(
        drawPoint.getY - controlPoint.getY,
        drawPoint.getX - controlPoint.getX
      ),
      endAngle = Math.atan2(my - controlPoint.getY, mx - controlPoint.getX);
    angle = endAngle - startAngle;
    rotateByAngle(controlPoint, angle);
    drawPoint.setX = mx;
    drawPoint.setY = my;
  }
};

const stopRotating = () => {
  drawPoint = new Point(-1, -1);
  clearCanvasAndDraw();
  drawControlPoint();
};

const scaleByMouse = (e) => {
  var mx = getCursorPosition(e)[0] - canvas.offsetLeft,
    my = getCursorPosition(e)[1] - canvas.offsetTop;
  clearCanvasAndDraw();
  drawControlPoint();
  if (controlPoint.getX === -1)
    alert("Set control point by text input or CTRL + Left Click!");
  if (drawPoint && controlPoint.getX !== -1) {
    var scale = calcScales(drawPoint, new Point(mx, my));
    scaleByPoint(controlPoint, scale, scale);
    drawPoint.setX = mx;
    drawPoint.setY = my;
  }
};

const stopScaling = () => {
  drawPoint = new Point(-1, -1);
  clearCanvasAndDraw();
  drawControlPoint();
};

const canvasMouseDown = (event) => {
  mouseX = getCursorPosition(event)[0] - canvas.offsetLeft;
  mouseY = getCursorPosition(event)[1] - canvas.offsetTop;
  switch (modeSelect.value) {
    case "1":
      removeCanvasEventListeners();
      addPointByClick(event);
      clearCanvasAndDraw();
      break;
    case "2":
      if (pointInPolygon(new Point(mouseX, mouseY))) {
        drawPoint = new Point(mouseX, mouseY);
        removeCanvasEventListeners();
        canvas.addEventListener("mousemove", moveByMouse);
        canvas.addEventListener("mouseup", stopMoving);
      } else removeCanvasEventListeners();

      if (event.ctrlKey) {
        addControlPoint(event);
        clearCanvasAndDraw();
        drawControlPoint();
      }
      break;
    case "3":
      if (
        pointInPolygon(new Point(mouseX, mouseY)) &&
        controlPoint.getX !== -1
      ) {
        drawPoint = new Point(mouseX, mouseY);
        removeCanvasEventListeners();
        canvas.addEventListener("mousemove", rotateByMouse);
        canvas.addEventListener("mouseup", stopRotating);
      } else removeCanvasEventListeners();

      if (event.ctrlKey) {
        addControlPoint(event);
        clearCanvasAndDraw();
        drawControlPoint();
      }
      break;
    case "4":
      if (
        pointInPolygon(new Point(mouseX, mouseY)) &&
        controlPoint.getX !== -1
      ) {
        drawPoint = new Point(mouseX, mouseY);
        removeCanvasEventListeners();
        canvas.addEventListener("mousemove", scaleByMouse);
        canvas.addEventListener("mouseup", stopScaling);
      } else removeCanvasEventListeners();

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
  canvas.removeEventListener("mouseup", stopMoving);
  canvas.removeEventListener("mousemove", rotateByMouse);
  canvas.removeEventListener("mouseup", stopRotating);
  canvas.removeEventListener("mousemove", scaleByMouse);
  canvas.removeEventListener("mouseup", stopScaling);
};

canvas.addEventListener("mousedown", canvasMouseDown);

canvas.addEventListener("mouseup", () => {
  canvas.removeEventListener("mousemove", moveByMouse);
  canvas.removeEventListener("mousemove", rotateByMouse);
  canvas.removeEventListener("mousemove", scaleByMouse);
  canvas.addEventListener("mousedown", canvasMouseDown);
});

clearButton.addEventListener("click", () => {
  clearCanvas();
  points = [];
  controlPoint = new Point(-1, -1);
});

setControlPoint.addEventListener("click", () => {
  if (["3", "4"].includes(modeSelect.value)) {
    addControlPointFromInput();
    clearCanvasAndDraw();
    drawControlPoint();
  }
});

moveButton.addEventListener("click", () => {
  if (modeSelect.value === "2") {
    var xVal = moveX2.value - moveX1.value,
      yVal = moveY2.value - moveY1.value;
    console.log(xVal, yVal);
    translateByVector(xVal, yVal);
    clearCanvasAndDraw();
  } else {
    alert("Choose move mode!");
  }
});

rotate.addEventListener("click", () => {
  if (modeSelect.value === "3" && controlPoint.getX !== -1) {
    var temp = calcRad(angleValue.value);
    rotateByAngle(controlPoint, temp);
    clearCanvasAndDraw();
    drawControlPoint();
  } else {
    alert("Set control point, then rotate! Make sure the angle is correct!");
  }
});

scale.addEventListener("click", () => {
  if (
    modeSelect.value === "4" &&
    xScale.value > 0 &&
    yScale.value > 0 &&
    controlPoint
  ) {
    scaleByPoint(controlPoint, xScale.value, yScale.value);
    clearCanvasAndDraw();
    drawControlPoint();
  } else {
    alert("Choose scale mode! Make sure scale values are correct!");
  }
});

save.addEventListener("click", () => {
  if (points.length > 0) {
    const file = new Blob([JSON.stringify(points)], { type: "text/plain" });
    var anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(file);
    anchor.download = "shapes.txt";
    anchor.click();
  } else {
    alert("Add some points!");
  }
});

loadBtn.addEventListener("click", () => {
  var file = document.getElementById("load").files[0];
  if (file !== undefined) {
    var reader = new FileReader();
    reader.onloadend = function () {
      var temp = JSON.parse(reader.result);
      temp.forEach((point) => {
        points.push(new Point(point.x, point.y));
      });
      clearCanvasAndDraw();
    };
    reader.readAsText(file);
  } else alert("Pick a file to load!");
});
