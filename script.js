// Utils

function isElementChildOfCanvas(canvas, element) {
  if (!(canvas instanceof HTMLCanvasElement)) {
    return false;
  }

  let parent = element.parentNode;
  while (parent !== null) {
    if (parent === canvas) {
      return true;
    }
    parent = parent.parentNode;
  }

  return false;
}

// Globais
window.Drawer = {};
window.Drawer.elements = [];
window.Drawer.events = {
  hasMouseMoveEvent: false,
};
window.Drawer.focusedElement = null;

// Classe Graphic
class Graphic {
  constructor({
    tag = "div",
    context,
    canvas,
    id,
    ariaLabel = "",
    focable = false,
  }) {
    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new Error("Invalid <canvas> element.");
    }

    if (!id) {
      throw new Error("Element mush have an id.");
    }

    if (!context) {
      throw new Error("Context is required.");
    }

    this.id = id;
    this.children = [];
    this.ariaLabel = ariaLabel;
    this.element = false;
    this.context = context;
    this.canvas = canvas;
    this.onClickCallback = () => {};
    this.onFocusCallback = () => {};
    this.path = new Path2D();
    this.tag = tag;
    this.autoSemantic = true;
    this.focable = focable;

    const _element = window.Drawer.elements.find(
      (element) => element.id === this.id
    );

    if (!_element) {
      window.Drawer.elements.push({
        id: id,
        inSubDOM: false,
        path: this.path,
        clickable: this.tag === "button",
      });

      this.setCanvasMouseEvents();
      this.initializeDraw();
    }
  }

  setCanvasMouseEvents() {
    if (!window.Drawer.events.hasMouseMoveEvent) {
      this.canvas.addEventListener(
        "mousemove",
        function (event) {
          const rect = canvas.getBoundingClientRect();
          const mouseX = event.clientX - rect.left;
          const mouseY = event.clientY - rect.top;

          let outsideAllButtons = true;

          const clickableElements = window.Drawer.elements.filter(
            (element) => element.clickable
          );

          clickableElements.forEach(({ path }) => {
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

  initializeDraw() {
    context.beginPath();
  }

  /**
   * Cria o elemento da subDOM automaticamente
   */
  autoSubDOM() {
    const _element = window.Drawer.elements.find(
      (element) => element.id === this.id
    );

    if (_element.inSubDOM) return;

    const element = document.createElement(this.tag);
    element.setAttribute("drawer-id", this.id);

    if (this.tag === "button") {
      element.setAttribute("type", "button");
    }

    if (this.ariaLabel) element.setAttribute("alt", this.ariaLabel);

    // TODO: check this!
    // button.textContent = this.ariaLabel;

    canvas.appendChild(element);

    this.element = button;
  }

  addChild(graphic) {
    this.children.push(graphic);

    if (graphic.element) {
      this.semanticElement.appendChild(graphic.element);
      graphic.onClick(this.onClickCallback);
      graphic.onFocus(this.onFocusCallback);
    }
  }

  restoreElement() {}

  /**
   * Associa o path do canvas a um elemento da subDOM.
   *
   * @param {HTMLElement} element
   * @returns
   */
  setElementPath(element) {
    if (!isElementChildOfCanvas(this.canvas, element)) {
      throw "Element must be a child of the canvas!";
    }

    const _element = window.Drawer.elements.find(
      (element) => element.id === this.id
    );

    if (_element.inSubDOM) return;

    element.setAttribute("drawer-id", this.id);
    element.setAttribute("alt", this.ariaLabel);

    this.element = element;
    this.autoSemantic = false;
    if (_element) _element.inSubDOM = true;
  }

  /**
   * Desenha o path no canvas
   *
   * @param {boolean} autoSemantic - se true, um elemento semântico será criado de acordo com o parâmetro passado
   * para classe Polygon
   *
   * @returns
   */
  draw(undoFocusRing = false) {
    if (!undoFocusRing) this.path.closePath();

    // TODO: autosemantic
    if (this.autoSemantic) this.autoSubDOM();

    // coloring the path
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

  /**
   * O evento de click é associado tanto ao elemento semântico quanto ao path
   *
   * @param {Function} callback
   */
  onClick(callback) {
    this.onClickCallback = callback;
    if (this.element) {
      this.element.onclick = () => {
        this.element.focus();
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

  /**
   * O evento de foco é associado ao elemento semântico. Quando focado, é desenhado um anel de foco em torno do path
   *
   * @param {Function} callback
   */
  onFocus(callback) {
    if (!this.focable || !this.element) return;
    this.onFocusCallback = callback;

    this.element.onfocus = () => {
      this.drawFocusRing();
      this.onFocusCallback();
    };

    this.onBlur();
  }

  drawFocusRing() {
    const _element = window.Drawer.elements.find(
      (element) => element.id === this.id
    );

    const imgData = this.context.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );
    const data = imgData.data;

    for (let y = 0; y < this.canvas.height; y++) {
      for (let x = 0; x < this.canvas.width; x++) {
        const path = this.path;
        if (this.context.isPointInPath(path, x, y)) {
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
            if (!this.context.isPointInPath(path, vizi.x, vizi.y)) {
              let index = (y * this.canvas.width + x) * 4;
              data[index] = 0;
              data[index + 1] = 0;
              data[index + 2] = 0;
              data[index + 3] = 255;

              if (vizi.type === "top") {
                if (this.context.isPointInPath(path, x, y + 1)) {
                  index = ((y + 1) * this.canvas.width + x) * 4;
                  data[index] = 0;
                  data[index + 1] = 0;
                  data[index + 2] = 0;
                  data[index + 3] = 255;
                }
              } else if (vizi.type === "left") {
                if (this.context.isPointInPath(path, x + 1, y)) {
                  index = (y * this.canvas.width + (x + 1)) * 4;
                  data[index] = 0;
                  data[index + 1] = 0;
                  data[index + 2] = 0;
                  data[index + 3] = 255;
                }
              } else if (vizi.type === "right") {
                if (this.context.isPointInPath(path, x - 1, y)) {
                  index = (y * this.canvas.width + (x - 1)) * 4;
                  data[index] = 0;
                  data[index + 1] = 0;
                  data[index + 2] = 0;
                  data[index + 3] = 255;
                }
              } else if (vizi.type === "bottom") {
                if (this.context.isPointInPath(path, x, y - 1)) {
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

  onBlur() {
    if (!this.focable || !this.element) return;
    this.element.onblur = () => {
      this.draw(true);
    };
  }
}

let squareX = 200;
let squareY = 300;

const canvas = document.getElementsByTagName("canvas")[0];
const context = canvas.getContext("2d");

// 1st case: with setElementPath
// const Square = new Graphic({
//   context,
//   canvas,
//   id: "teste",
//   ariaLabel: "Aumentar",
//   focable: true,
// });

// const path = Square.path;
// path.lineTo(squareX, squareY);
// path.lineTo(squareX + 60, squareY);
// path.lineTo(squareX + 60, squareY - 60);
// path.lineTo(squareX, squareY - 60);

// const button = document.createElement("button");
// const newContent = document.createTextNode("Hello, World!");
// button.appendChild(newContent);

// canvas.appendChild(button);
// Square.setElementPath(button);
// Square.draw();

// Square.onFocus(() => {
//   console.log("Focou");
// });

// Square.onClick(() => {
//   console.log("Clicou");
// });

// 2nd case: without setElementPath
// const Square = new Graphic({
//   tag: "button",
//   context,
//   canvas,
//   id: "teste",
//   ariaLabel: "Aumentar",
//   focable: true,
// });

// const path = Square.path;
// path.lineTo(squareX, squareY);
// path.lineTo(squareX + 60, squareY);
// path.lineTo(squareX + 60, squareY - 60);
// path.lineTo(squareX, squareY - 60);

// Square.draw();

// Square.onFocus(() => {
//   console.log("Focou");
// });

// Square.onClick(() => {
//   console.log("Clicou");
// });

const button = document.createElement("button");
const newContent = document.createTextNode("Clique aqui!");
button.appendChild(newContent);

const render = () => {
  context.clearRect(0, 0, canvas.width, canvas.height);

  const Square = new Graphic({
    context,
    canvas,
    id: "teste",
    ariaLabel: "Aumentar",
    focable: true,
  });

  const path = Square.path;
  path.lineTo(squareX, squareY);
  path.lineTo(squareX + 60, squareY);
  path.lineTo(squareX + 60, squareY - 60);
  path.lineTo(squareX, squareY - 60);

  canvas.appendChild(button);
  Square.setElementPath(button);
  Square.draw();

  Square.onFocus(() => {
    console.log("Focou");
  });

  Square.onClick(() => {
    console.log("Clicou");
  });
};

render();

function moveSquare(direction) {
  console.log(direction);
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
