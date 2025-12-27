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

const colours = {'Sons of Horus': 'rgb(0,83,98)',
               'Mechanicum': 'rgb(139,26,15)',
               'Imperium': 'rgb(160,161,151)',
               'Imperial Army': 'rgb(160,161,151)',
               'Imperial Navy': 'rgb(160,161,151)',
               'Iterator': 'rgb(160,161,151)',
               'Remembrancer': 'rgb(160,161,151)',
               'Emperors Children': 'rgb(128,0,128)',
               'Imperial Fists': 'rgb(230,171,0)',
               'Chaos': 'rgb(255,0,0)'};

d3.json("data/lines.json").then(data => {
  const nodes = data.nodes;
  const links = data.edges;

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
    .attr("fill", d => colours[d.affiliation] || colours.default);

  const label = svg.append("g")
    .selectAll("text")
    .data(nodes)
    .enter()
    .append("text")
    .text(d => d.id)
    .attr("font-size", "10px")
    .attr("dx", 10)
    .attr("dy", 4);

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
