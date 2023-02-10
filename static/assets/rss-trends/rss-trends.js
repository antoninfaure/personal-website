import links from "./10-02-2023/edges.json" assert { type: "json" }
import nodes from "./10-02-2023/nodes.json" assert { type: "json" }

const width = $('#mynetwork').innerWidth()
const height = $('#mynetwork').innerHeight()

var initial_zoom = d3.zoomIdentity.translate(600, 400).scale(0.04);

//add zoom capabilities 
var zoom_handler = d3.zoom().on("zoom", zoom_actions);

const svg = d3.select('#mynetwork')
  .attr('width', width)
  .attr('height', height)
  .call(zoom_handler)
  .call(zoom_handler.transform, initial_zoom)

var max_value = 0
for (node of nodes) {
  if (node.size > max_value) max_value = node.size;
}
var color = d3.scaleLinear()
  .domain([1, max_value])
  .range(["yellow", "red"])

const radius = 20

var simulation = d3.forceSimulation()
  .force("link", d3.forceLink().id(function (d) { return d.id; }))
  .force("charge", d3.forceManyBody().strength(d => { return -d.size * 10000 }))
  .force("center", d3.forceCenter(width / 2, height / 2))
  .force("collide", d3.forceCollide().radius(d => { return (d.size + 2) * radius }).iterations(3))

var zoomable = svg.append("g")
  .attr("class", "zoomable")
  .attr('transform', initial_zoom)


var node = zoomable.append("g")
  .attr("class", "nodes")
  .selectAll("g")
  .data(nodes)
  .enter().append("g")


var link = zoomable.append("g")
  .attr("class", "links")
  .selectAll("line")
  .data(links)
  .enter().append("line")
  .attr("stroke-width", '5px')
  .style('stroke', 'black')


var circles = node.append("circle")
  .attr("r", function (d) {
    return d.size * radius
  })
  .attr("fill", function (d) {
    return color(d.size);
  })
// Create a drag handler and append it to the node object instead
var drag_handler = d3.drag()
  .on("start", dragstarted)
  .on("drag", dragged)
  .on("end", dragended);

drag_handler(node);

var labels = node.append("text")
  .attr('class', 'text-label')
  .attr("text-anchor", "middle")
  .attr("dy", ".35em")
  .text(function (d) {
    return d.label
  })
  .style("font-size", function (d) {
    return d.size * radius
  })
  .style('fill', 'black')

node.append("title")
  .text(function (d) {
    return d.label
  });

simulation
  .nodes(nodes)
  .on("tick", ticked);

simulation.force("link")
  .links(links);

function ticked() {
  link
    .attr("x1", function (d) { return d.source.x; })
    .attr("y1", function (d) { return d.source.y; })
    .attr("x2", function (d) { return d.target.x; })
    .attr("y2", function (d) { return d.target.y; });

  node
    .attr("transform", function (d) {
      return "translate(" + d.x + "," + d.y + ")";
    })
}

svg.append('g')
  .append('text')
    .attr('class', 'title')
    .attr('x', width / 2)
    .attr('y', 50)
    .attr('text-anchor', 'middle')
    .text('Actualités FR du 10 février 2023');

function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}

function zoom_actions() {
  if (zoomable) {
    zoomable.attr("transform", d3.event.transform)
  }
}


