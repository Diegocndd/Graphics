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
    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new Error("Invalid <canvas> element.");
    }

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

    // garante mudança do cursor em objetos clicáveis
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

  /**
   * Cria o elemento semântico na subDOM
   */
  createSemantic() {
    if (this.semantic === "button") {
      const button = document.createElement("button");
      button.setAttribute("drawer-id", this.id);
      button.textContent = this.ariaLabel;
      canvas.appendChild(button);

      this.semanticElement = button;
    } else if (this.semantic === "image") {
      const image = document.createElement("image");
      image.setAttribute("drawer-id", this.id);
      image.setAttribute("alt", this.ariaLabel);
      canvas.appendChild(image);

      this.semanticElement = image;
    }
  }

  addChild(polygon) {
    this.children.push(polygon);
    if (polygon.semanticElement) {
      this.semanticElement.appendChild(polygon.semanticElement);
      polygon.onClick(this.onClickCallback);
      polygon.onFocus(this.onClickCallback);
    }
  }

  restoreElement() {
    const restoredElement = this.canvas.querySelector(`[drawer-id=${this.id}]`);
    this.semanticElement = restoredElement;
  }

  /**
   * Desassocia o path do canvas do seu elemento semântico.
   *
   * @param {boolean} remove - se true, o elemento semântico é removido da subDOM.
   */
  clearElementPath(remove) {
    if (remove) {
      this.canvas.querySelector(`[drawer-id=${this.id}]`)?.remove();
    }
    const index = window.Drawer.elements.indexOf(this.id);
    window.Drawer.elements.splice(index, 1);
  }

  /**
   * Associa o path do canvas a um elemento da subDOM.
   *
   * @param {HTMLElement} element
   * @returns
   */
  addElementPath(element) {
    if (window.Drawer.elements.indexOf(this.id) !== -1) {
      console.error(`#${this.id} is already an semantic element!`);
      return;
    }

    if (!isElementChildOfCanvas(this.canvas, element)) {
      console.error("Element must be a child of the canvas!");
      return;
    }

    element.setAttribute("drawer-id", this.id);
    element.setAttribute("alt", this.ariaLabel);
    this.semanticElement = element;
    window.Drawer.elements.push(this.id);
  }

  /**
   * Desenha o path no canvas
   *
   * @param {boolean} autoSemantic - se true, um elemento semântico será criado de acordo com o parâmetro passado
   * para classe Polygon
   *
   * @returns
   */
  draw(autoSemantic = true) {
    this.path.closePath();

    if (this.focable) {
      // TODO: generalizar
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

    if (!autoSemantic) return;

    // evita recriação dos elementos da subDOM
    // pois essa recriação poderia ser confusa ao usuário
    if (window.Drawer.elements.indexOf(this.id) !== -1) {
      this.restoreElement();
      if (window.Drawer.focusedElement === this.semanticElement) {
        this.semanticElement.focus();
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

  /**
   * O evento de click é associado tanto ao elemento semântico quanto ao path
   *
   * @param {Function} callback
   */
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

  /**
   * O evento de foco é associado ao elemento semântico. Quando focado, é desenhado um anel de foco em torno do path
   *
   * @param {Function} callback
   */
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

const canvas = document.getElementsByTagName("canvas")[0];
const context = canvas.getContext("2d");
let squareX = 200;
let squareY = 300;

let squareX2 = 100;
let squareY2 = 200;

const render = () => {
  context.clearRect(0, 0, canvas.width, canvas.height);

  const Square = new Polygon("button", context, canvas, "teste", "Aumentar");

  const path = Square.path;
  path.lineTo(squareX, squareY);
  path.lineTo(squareX + 60, squareY);
  path.lineTo(squareX + 60, squareY - 60);
  path.lineTo(squareX, squareY - 60);

  Square.draw();

  Square.onClick(() => {
    const count = document.getElementById("counter").textContent;
    document.getElementById("counter").textContent = `${Number(count) + 1}`;
  });

  Square.onFocus(() => {
    console.log("focou");
  });

  const Square2 = new Polygon("button", context, canvas, "teste2", "Aumentar");

  const path2 = Square2.path;
  path2.lineTo(squareX2, squareY2);
  path2.lineTo(squareX2 + 60, squareY2);
  path2.lineTo(squareX2 + 60, squareY2 - 60);
  path2.lineTo(squareX2, squareY2 - 60);

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
