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
window.Drawer.paths = {
  buttons: [],
};
window.Drawer.events = {
  hasMouseMoveEvent: false,
};

class Polygon {
  constructor(semantic, context, canvas) {
    context.beginPath();

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

      canvas.appendChild(button);

      this.semanticElement = button;
    }
  }

  addPoint(x, y) {
    this.path.lineTo(x, y);
    this.dataPath.push({ x, y });
  }

  draw() {
    this.path.closePath();
    this.context.stroke();
    this.context.fill(this.path);
    this.createSemantic();

    let path = "";

    this.dataPath.forEach(({ x, y }) => {
      path += `${x} ${y} `;
    });

    this.semanticElement.setAttribute("path", path);

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

  onClick(callback) {
    this.onClickCallback = callback;
    if (this.semanticElement)
      this.semanticElement.onclick = this.onClickCallback;

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
    if (this.semanticElement)
      this.semanticElement.onfocus = this.onFocusCallback;

    this.canvas.addEventListener(
      "focus",
      function (event) {
        callback();
      }.bind(this)
    );
  }
}

const canvas = document.getElementsByTagName("canvas")[0];
const context = canvas.getContext("2d");

const Triangle = new Polygon("button", context, canvas);
Triangle.addPoint(50, 100);
Triangle.addPoint(100, 100);
Triangle.addPoint(20, 20);
Triangle.draw();
Triangle.onClick(() => {
  const count = document.getElementById("counter").textContent;
  document.getElementById("counter").textContent = `${Number(count) + 1}`;
});

const Triangle2 = new Polygon("button", context, canvas);
Triangle2.addPoint(150, 200);
Triangle2.addPoint(200, 200);
Triangle2.addPoint(120, 120);
Triangle2.draw();
Triangle2.onClick(() => {
  const count = document.getElementById("counter").textContent;
  document.getElementById("counter").textContent = `${Number(count) - 1}`;
});
Triangle2.onFocus(() => {
  console.log("focou");
});
