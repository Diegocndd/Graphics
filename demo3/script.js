const canvas = document.getElementById("barChart");
const ctx = canvas.getContext("2d");

const data = {
  labels: ["Category 1", "Category 2", "Category 3"],
  datasets: [
    {
      label: "Dataset 1",
      data: [10, 20, 30],
      backgroundColor: "rgba(255, 99, 132, 0.5)",
    },
    {
      label: "Dataset 2",
      data: [20, 10, 40],
      backgroundColor: "rgba(54, 162, 235, 0.5)",
    },
    {
      label: "Dataset 3",
      data: [30, 40, 20],
      backgroundColor: "rgba(75, 192, 192, 0.5)",
    },
  ],
};

const barWidth = 50;
const barSpacing = 10;
const chartHeight = canvas.height;
const chartWidth = canvas.width;
const numBars = data.labels.length;
const totalWidth = numBars * (barWidth + barSpacing) - barSpacing;
const startX = (chartWidth - totalWidth) / 2;

function drawStackedBar(x, yOffset, height, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, chartHeight - yOffset - height, barWidth, height);
}

function drawChart() {
  ctx.clearRect(0, 0, chartWidth, chartHeight);

  data.labels.forEach((label, index) => {
    let x = startX + index * (barWidth + barSpacing);
    let yOffset = 0;

    data.datasets.forEach((dataset) => {
      const value = dataset.data[index];
      const height =
        value *
        (chartHeight / Math.max(...data.datasets.flatMap((d) => d.data)));
      drawStackedBar(x, yOffset, height, dataset.backgroundColor);
      yOffset += height;
    });
  });
}

drawChart();
