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
  images: [],
};
window.Drawer.events = {
  hasMouseMoveEvent: false,
};
window.Drawer.focusedElement = null;

class Polygon {
  constructor(semantic, context, canvas, id, ariaLabel) {
    context.beginPath();

    this.id = id;
    this.children = [];
    this.ariaLabel = ariaLabel;
    this.semanticElement = null;
    this.semantic = semantic;
    this.context = context;
    this.canvas = canvas;
    this.onClickCallback = () => {};
    this.onFocusCallback = () => {};
    this.dataPath = [];
    this.path = new Path2D();
    this.focable = this.semantic === "button";

    if (this.semantic === "button") window.Drawer.paths.buttons.push(this.path);

    if (this.semantic === "image") window.Drawer.paths.images.push(this.path);

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
      button.textContent = this.ariaLabel;
      canvas.appendChild(button);

      this.semanticElement = button;
    } else if (this.semantic === "image") {
      const image = document.createElement("image");
      image.setAttribute("id", this.id);
      image.setAttribute("alt", this.ariaLabel);
      canvas.appendChild(image);

      this.semanticElement = image;
    }
  }

  addPoint(x, y) {
    this.path.lineTo(x, y);
    this.dataPath.push({ x, y });
  }

  arc(x, y, radius, start, end) {
    this.path.arc(x, y, radius, start, end);
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

  draw() {
    this.path.closePath();

    if (this.focable) {
      var width = this.canvas.width;
      var height = this.canvas.height;
      var existingImageData = this.context.getImageData(0, 0, width, height);
      var existingData = existingImageData.data;

      var imageData = this.context.createImageData(width, height);
      var data = imageData.data;

      for (var i = 0; i < existingData.length; i++) {
        data[i] = existingData[i];
      }

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
    }

    // this.context.restore();

    if (window.Drawer.elements.indexOf(this.id) !== -1) {
      this.restoreElement(this.id);
      if (window.Drawer.focusedElement === this.semanticElement) {
        this.semanticElement.focus();
        // this.context.drawFocusIfNeeded(this.path, this.semanticElement);
      }

      return;
    }

    this.createSemantic();

    window.Drawer.elements.push(this.id);
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

              if (vizi.type === "top") {
                if (this.context.isPointInPath(this.path, x, y + 1)) {
                  index = ((y + 1) * this.canvas.width + x) * 4;
                  data[index] = 0;
                  data[index + 1] = 0;
                  data[index + 2] = 0;
                  data[index + 3] = 255;
                }
              } else if (vizi.type === "left") {
                if (this.context.isPointInPath(this.path, x + 1, y)) {
                  index = (y * this.canvas.width + (x + 1)) * 4;
                  data[index] = 0;
                  data[index + 1] = 0;
                  data[index + 2] = 0;
                  data[index + 3] = 255;
                }
              } else if (vizi.type === "right") {
                if (this.context.isPointInPath(this.path, x - 1, y)) {
                  index = (y * this.canvas.width + (x - 1)) * 4;
                  data[index] = 0;
                  data[index + 1] = 0;
                  data[index + 2] = 0;
                  data[index + 3] = 255;
                }
              } else if (vizi.type === "bottom") {
                if (this.context.isPointInPath(this.path, x, y - 1)) {
                  index = ((y - 1) * this.canvas.width + x) * 4;
                  data[index] = 0;
                  data[index + 1] = 0;
                  data[index + 2] = 0;
                  data[index + 3] = 255;
                }
              }
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
    if (!this.focable || !this.semanticElement) return;
    this.onFocusCallback = callback;

    this.semanticElement.onfocus = () => {
      this.drawStroke();
      this.onFocusCallback();
    };

    this.onBlur();
  }

  onBlur() {
    if (!this.focable || !this.semanticElement) return;

    this.semanticElement.onblur = () => {
      this.draw();
    };
  }
}

class ImageP extends Polygon {
  constructor(semantic, context, canvas, id, ariaLabel) {
    super(semantic, context, canvas, id, ariaLabel);
  }

  draw(source, x, y, height, width) {
    super.draw();
    var img = new Image();

    img.src = source;

    img.onload = function () {
      this.context.drawImage(img, x, y, width, height);
    }.bind(this);
  }
}

const canvas = document.getElementsByTagName("canvas")[0];
const context = canvas.getContext("2d");

const render = () => {
  let squareX = 200;
  let squareY = 300;

  context.clearRect(0, 0, canvas.width, canvas.height);

  const Square = new Polygon("button", context, canvas, "teste", "Aumentar");
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

  const image = new ImageP("image", context, canvas, "imagem", "Gato filhote");
  image.draw("cat.jpg", 100, 100, 100, 80);

  // squareX = 300;
  // squareY = 400;
  // squareSize = 50;

  // const Square2 = new Polygon("button", context, canvas, "teste2", "Diminuir");
  // Square2.addPoint(squareX, squareY);
  // Square2.addPoint(squareX + 60, squareY);
  // Square2.addPoint(squareX + 60, squareY - 60);
  // Square2.draw();
  // Square2.onClick(() => {
  //   const count = document.getElementById("counter").textContent;
  //   document.getElementById("counter").textContent = `${Number(count) - 1}`;
  // });
  // Square2.onFocus(() => {
  //   console.log("focou");
  // });

  // const Circle = new Polygon("button", context, canvas, "teste3", "Dobrar");
  // Circle.arc(100, 100, 50, 0, 2 * Math.PI);
  // Circle.draw();
  // Circle.onClick(() => {
  //   const count = document.getElementById("counter").textContent;
  //   document.getElementById("counter").textContent = `${Number(count) * 2}`;
  // });
  // Circle.onFocus(() => {
  //   console.log("focou");
  // });
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
