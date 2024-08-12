const video = document.getElementById("video");
const canvas = document.getElementById("controls");
const ctx = canvas.getContext("2d");

// Define button and volume bar properties
const playButton = { x: 10, y: 10, width: 80, height: 30 };
const pauseButton = { x: 100, y: 10, width: 80, height: 30 };
const volumeBar = { x: 200, y: 40, width: 300, height: 20 };
let isDraggingVolume = false;

// Draw controls
function drawControls() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw Play Button
  ctx.fillStyle = "green";
  ctx.fillRect(playButton.x, playButton.y, playButton.width, playButton.height);
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Play", playButton.x + 20, playButton.y + 20);

  // Draw Pause Button
  ctx.fillStyle = "red";
  ctx.fillRect(
    pauseButton.x,
    pauseButton.y,
    pauseButton.width,
    pauseButton.height
  );
  ctx.fillStyle = "white";
  ctx.fillText("Pause", pauseButton.x + 20, pauseButton.y + 20);

  // Draw Volume Bar
  ctx.fillStyle = "gray";
  ctx.fillRect(
    volumeBar.x,
    volumeBar.y + 20,
    volumeBar.width,
    volumeBar.height
  );

  const volumeWidth = video.volume * volumeBar.width;
  ctx.fillStyle = "blue";
  ctx.fillRect(volumeBar.x, volumeBar.y + 20, volumeWidth, volumeBar.height);

  ctx.fillStyle = "white";
  ctx.font = "16px Arial";
  ctx.fillText("Volume", volumeBar.x, volumeBar.y + 15);
}

// Handle canvas click
function handleCanvasClick(event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // Check Play Button
  if (
    x >= playButton.x &&
    x <= playButton.x + playButton.width &&
    y >= playButton.y &&
    y <= playButton.y + playButton.height
  ) {
    video.play();
  }
  // Check Pause Button
  else if (
    x >= pauseButton.x &&
    x <= pauseButton.x + pauseButton.width &&
    y >= pauseButton.y &&
    y <= pauseButton.y + pauseButton.height
  ) {
    video.pause();
  }
  // Check Volume Bar
  else if (
    x >= volumeBar.x &&
    x <= volumeBar.x + volumeBar.width &&
    y >= volumeBar.y + 20 &&
    y <= volumeBar.y + 20 + volumeBar.height
  ) {
    video.volume = (x - volumeBar.x) / volumeBar.width;
    drawControls();
  }
}

// Handle volume bar drag
function handleMouseDown(event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  if (
    x >= volumeBar.x &&
    x <= volumeBar.x + volumeBar.width &&
    y >= volumeBar.y + 20 &&
    y <= volumeBar.y + 20 + volumeBar.height
  ) {
    isDraggingVolume = true;
    video.volume = (x - volumeBar.x) / volumeBar.width;
    drawControls();
  }
}

function handleMouseMove(event) {
  if (isDraggingVolume) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    if (x >= volumeBar.x && x <= volumeBar.x + volumeBar.width) {
      video.volume = (x - volumeBar.x) / volumeBar.width;
      drawControls();
    }
  }
}

function handleMouseUp() {
  isDraggingVolume = false;
}

canvas.addEventListener("click", handleCanvasClick);
canvas.addEventListener("mousedown", handleMouseDown);
canvas.addEventListener("mousemove", handleMouseMove);
canvas.addEventListener("mouseup", handleMouseUp);

drawControls();
