/* ---------------------------------------------------
   Setup
--------------------------------------------------- */

const graphic = document.querySelector(".graphic");
const width = graphic.clientWidth;
const height = window.innerHeight;

/* ---------------------------------------------------
   BAR CHART
--------------------------------------------------- */

const barSvg = d3.select("#bar");

const barData = [10, 30, 20, 40, 25];

const x = d3.scaleBand()
  .domain(d3.range(barData.length))
  .range([100, width - 100])
  .padding(0.2);

const y = d3.scaleLinear()
  .domain([0, d3.max(barData)])
  .range([height - 100, 100]);

barSvg.selectAll("rect")
  .data(barData)
  .join("rect")
  .attr("x", (d, i) => x(i))
  .attr("y", d => y(d))
  .attr("width", x.bandwidth())
  .attr("height", d => y(0) - y(d))
  .attr("fill", "steelblue");

/* ---------------------------------------------------
   NETWORK GRAPH
--------------------------------------------------- */

const netSvg = d3.select("#network");

// const nodes = [
//   { id: 1, group: "A" },
//   { id: 2, group: "A" },
//   { id: 3, group: "B" },
//   { id: 4, group: "B" }
// ];

// const links = [
//   { source: 1, target: 2 },
//   { source: 2, target: 3 },
//   { source: 3, target: 4 }
// ];

d3.json("data/lines.json").then(data => {

const simulation = d3.forceSimulation(nodes)
  .force("link", d3.forceLink(links).id(d => d.id).distance(80))
  .force("charge", d3.forceManyBody().strength(-200))
  .force("center", d3.forceCenter(width / 2, height / 2));

const link = netSvg.append("g")
  .attr("stroke", "#aaa")
  .selectAll("line")
  .data(links)
  .join("line");

const node = netSvg.append("g")
  .selectAll("circle")
  .data(nodes)
  .join("circle")
  .attr("r", 10)
  .attr("fill", "orange");

simulation.on("tick", () => {
  link
    .attr("x1", d => d.source.x)
    .attr("y1", d => d.source.y)
    .attr("x2", d => d.target.x)
    .attr("y2", d => d.target.y);

  node
    .attr("cx", d => d.x)
    .attr("cy", d => d.y);
})});

/* ---------------------------------------------------
   SCROLLAMA
--------------------------------------------------- */

const scroller = scrollama();

function handleStepEnter(response) {
  const step = response.element.dataset.step;

  d3.selectAll(".step").classed("is-active", false);
  d3.select(response.element).classed("is-active", true);

  if (step === "1") {
    d3.select("#bar").transition().style("opacity", 1);
    d3.select("#network").transition().style("opacity", 0);
  }

  if (step === "2" || step === "3") {
    d3.select("#bar").transition().style("opacity", 0);
    d3.select("#network").transition().style("opacity", 1);

    simulation.alpha(1).restart();
  }

  if (step === "3") {
    node
      .transition()
      .attr("fill", d => d.group === "A" ? "red" : "orange");
  }
}

scroller
  .setup({
    step: ".step",
    offset: 0.5
  })
  .onStepEnter(handleStepEnter);

window.addEventListener("resize", scroller.resize);
