/**
 * Perceptibilidade: focus ring, cursors
 * Operabilidade: keyboard focus
 * Entendível: ?
 */

/**
 * Semantics:
 *    Button
 *    Text
 *    Input
 */

window.Drawer = {};
window.Drawer.elements = [];
window.Drawer.paths = {
  buttons: [],
};
window.Drawer.events = {
  hasMouseMoveEvent: false,
};
window.Drawer.focusedElement = null;

class Polygon {
  constructor(semantic, context, canvas, id) {
    context.beginPath();

    this.id = id;
    this.children = [];
    this.semanticElement = null;
    this.semantic = semantic;
    this.context = context;
    this.canvas = canvas;
    this.onClickCallback = () => {};
    this.onFocusCallback = () => {};
    this.dataPath = [];
    this.path = new Path2D();

    if (this.semantic === "button") window.Drawer.paths.buttons.push(this.path);

    if (!window.Drawer.events.hasMouseMoveEvent) {
      this.canvas.addEventListener(
        "mousemove",
        function (event) {
          const rect = canvas.getBoundingClientRect();
          const mouseX = event.clientX - rect.left;
          const mouseY = event.clientY - rect.top;

          let outsideAllButtons = true;

          window.Drawer.paths.buttons.forEach((path) => {
            if (this.context.isPointInPath(path, mouseX, mouseY)) {
              outsideAllButtons = false;
              canvas.style.cursor = "pointer";
            }
          });

          if (outsideAllButtons) canvas.style.cursor = "auto";
        }.bind(this)
      );
    }
  }

  createSemantic() {
    if (this.semantic === "button") {
      const button = document.createElement("button");
      button.setAttribute("id", this.id);
      button.textContent = "Pause button";
      canvas.appendChild(button);

      this.semanticElement = button;
    }
  }

  addPoint(x, y) {
    this.path.lineTo(x, y);
    this.dataPath.push({ x, y });
  }

  addChild(polygon) {
    this.children.push(polygon);
    if (polygon.semanticElement) {
      this.semanticElement.appendChild(polygon.semanticElement);
      polygon.onClick(this.onClickCallback);
      polygon.onFocus(this.onClickCallback);
    }
  }

  restoreElement(id) {
    const restoredElement = document.getElementById(id);
    this.semanticElement = restoredElement;
  }

  draw(createFocus = false) {
    this.path.closePath();

    var width = this.canvas.width;
    var height = this.canvas.height;
    var existingImageData = this.context.getImageData(0, 0, width, height);
    var existingData = existingImageData.data;

    var imageData = this.context.createImageData(width, height);
    var data = imageData.data;

    for (var i = 0; i < existingData.length; i++) {
      data[i] = existingData[i];
    }

    // var imageData = context.createImageData(width, height);
    // var data = imageData.data;
    for (var y = 0; y < height; y++) {
      for (var x = 0; x < width; x++) {
        var index = (y * width + x) * 4;
        if (this.context.isPointInPath(this.path, x, y)) {
          data[index] = 255;
          data[index + 1] = 0;
          data[index + 2] = 0;
          data[index + 3] = 255;
        }
      }
    }

    context.putImageData(imageData, 0, 0);

    if (createFocus) {
      // this.context.lineWidth = 3; // Espessura da linha do anel de foco
      // this.context.strokeStyle = "black"; // Cor do anel de foco
      // this.context.stroke(this.path);
    } else {
      this.context.restore();

      // this.context.stroke(this.path);
    }

    if (window.Drawer.elements.indexOf(this.id) !== -1) {
      this.restoreElement(this.id);
      if (window.Drawer.focusedElement === this.semanticElement) {
        this.semanticElement.focus();
        this.context.drawFocusIfNeeded(this.path, this.semanticElement);
      }

      return;
    }

    this.createSemantic();

    window.Drawer.elements.push(this.id);

    let path = "";

    // this.dataPath.forEach(({ x, y }) => {
    //   path += `${x} ${y} `;
    // });

    // this.semanticElement.setAttribute("path", path);

    if (this.semantic === "button") {
      this.canvas.addEventListener(
        "mousemove",
        function (event) {
          const rect = canvas.getBoundingClientRect();
          const mouseX = event.clientX - rect.left;
          const mouseY = event.clientY - rect.top;

          if (this.context.isPointInPath(this.path, mouseX, mouseY)) {
            canvas.style.cursor = "pointer";
          }
        }.bind(this)
      );
    }
  }

  drawStroke() {
    const imgData = this.context.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );
    const data = imgData.data;

    for (let y = 0; y < this.canvas.height; y++) {
      for (let x = 0; x < this.canvas.width; x++) {
        if (this.context.isPointInPath(this.path, x, y)) {
          const positions = [
            { x: x - 1, y: y, type: "left" },
            { x: x + 1, y: y, type: "right" },

            { x: x, y: y - 1, type: "top" },
            { x: x, y: y + 1, type: "bottom" },

            { x: x - 1, y: y - 1, type: "left-top" },
            { x: x + 1, y: y - 1, type: "right-top" },
            { x: x - 1, y: y + 1, type: "left-bottom" },
            { x: x + 1, y: y + 1, type: "right-bottoms" },
          ];

          positions.forEach((vizi) => {
            if (!this.context.isPointInPath(this.path, vizi.x, vizi.y)) {
              let index = (y * this.canvas.width + x) * 4;
              data[index] = 0;
              data[index + 1] = 0;
              data[index + 2] = 0;
              data[index + 3] = 255;
            }
          });
        }
      }
    }
    this.context.putImageData(imgData, 0, 0);
  }

  onClick(callback) {
    this.onClickCallback = callback;
    if (this.semanticElement) {
      this.semanticElement.onclick = () => {
        this.semanticElement.focus();
        this.onClickCallback();
      };
    }

    this.canvas.addEventListener(
      "click",
      function (event) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        if (this.context.isPointInPath(this.path, mouseX, mouseY)) {
          callback();
        }
      }.bind(this)
    );
  }

  onFocus(callback) {
    this.onFocusCallback = callback;

    if (this.semanticElement) {
      this.semanticElement.onfocus = () => {
        this.drawStroke();
        this.onFocusCallback();
      };
    }

    this.onBlur();
  }

  onBlur() {
    if (this.semanticElement) {
      this.semanticElement.onblur = () => {
        this.draw();
      };
    }
  }
}

const canvas = document.getElementsByTagName("canvas")[0];
const context = canvas.getContext("2d");

const render = () => {
  let squareX = 200;
  let squareY = 300;

  context.clearRect(0, 0, canvas.width, canvas.height);

  const Square = new Polygon("button", context, canvas, "teste");
  Square.addPoint(squareX, squareY);
  Square.addPoint(squareX + 60, squareY);
  Square.addPoint(squareX + 60, squareY - 60);
  Square.addPoint(squareX, squareY - 60);
  Square.draw();
  Square.onClick(() => {
    const count = document.getElementById("counter").textContent;
    document.getElementById("counter").textContent = `${Number(count) + 1}`;
  });
  Square.onFocus(() => {
    console.log("focou");
  });

  squareX = 300;
  squareY = 400;
  squareSize = 50;

  const Square2 = new Polygon("button", context, canvas, "teste2");
  Square2.addPoint(squareX, squareY);
  Square2.addPoint(squareX + 60, squareY);
  Square2.addPoint(squareX + 60, squareY - 60);
  Square2.addPoint(squareX, squareY - 60);
  Square2.draw();
  Square2.onClick(() => {
    const count = document.getElementById("counter").textContent;
    document.getElementById("counter").textContent = `${Number(count) - 1}`;
  });
  Square2.onFocus(() => {
    console.log("focou");
  });
};

render();

function moveSquare(direction) {
  switch (direction) {
    case "ArrowUp":
      squareY -= 10;
      render();

      break;
    case "ArrowDown":
      squareY += 10;
      render();

      break;
    case "ArrowLeft":
      squareX -= 10;
      render();

      break;
    case "ArrowRight":
      squareX += 10;
      render();

      break;
  }
}

window.addEventListener("keydown", (event) => {
  moveSquare(event.key);
});
