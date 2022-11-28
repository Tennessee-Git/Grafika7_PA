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

class Vector {
  constructor(p1, p2) {
    this.points = [p1, p2];
  }

  get p1() {
    return this.points[0];
  }

  get p2() {
    return this.points[1];
  }

  set setP1(point) {
    this.points[0] = point;
  }
  set setP2(point) {
    this.points[1] = point;
  }
}

let canvas = document.getElementById("canvas");
let ctx;
if (canvas.getContext) {
  ctx = canvas.getContext("2d");
}

let modeSelect = document.getElementById("mode");
let clearButton = document.getElementById("clear");

let points = [];
let controlPoint;

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

const translateByVector = (vector) => {
  points.forEach((point) => {
    //translate
  });
};

const rotateByAngle = (originPoint, deg) => {
  points.forEach((point) => {
    //rotate
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
  ctx.arc(controlPoint.getX, controlPoint.getY, 2.5, 0, 2 * Math.PI);
  ctx.fill();
};

const drawBetweenPoints = () => {
  var currentPoint;
};

const clearCanvasAndDraw = () => {
  clearCanvas();
  drawPoints();
  drawBetweenPoints();
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

const calcDist = (x1, y1, x2, y2) => {
  var xPart = Math.pow(x2 - x1, 2);
  var yPart = Math.pow(y2 - y1, 2);
  return Math.sqrt(xPart + yPart);
};

canvas.addEventListener("click", (event) => {
  switch (modeSelect.value) {
    case "1":
      addPointByClick(event);
      clearCanvasAndDraw();
      break;
    case "2":
      // console.error(event.ctrlKey, event.button);
      if (event.ctrlKey) {
        addControlPoint(event);
        clearCanvasAndDraw();
        drawControlPoint();
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
});

clearButton.addEventListener("click", () => {
  clearCanvas();
});
