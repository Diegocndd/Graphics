// script.js

const canvas = document.getElementById("mapCanvas");
const ctx = canvas.getContext("2d");

// Configurações do mapa
const mapWidth = canvas.width;
const mapHeight = canvas.height;

// Função para desenhar uma rua simples
function drawStreet(x1, y1, x2, y2) {
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

// Função para desenhar um edifício simples
function drawBuilding(x, y, width, height) {
  ctx.fillStyle = "#aaa";
  ctx.fillRect(x, y, width, height);
}

// Função para desenhar o mapa
function drawMap() {
  // Limpa o canvas
  ctx.clearRect(0, 0, mapWidth, mapHeight);

  // Desenha algumas ruas
  drawStreet(100, 100, 400, 100);
  drawStreet(100, 100, 100, 400);
  drawStreet(100, 400, 400, 400);
  drawStreet(400, 100, 400, 400);

  // Desenha alguns edifícios
  drawBuilding(150, 150, 100, 100);
  drawBuilding(300, 150, 100, 100);
  drawBuilding(150, 300, 100, 100);
  drawBuilding(300, 300, 100, 100);
}

// Chama a função para desenhar o mapa
drawMap();
