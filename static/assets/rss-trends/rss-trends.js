import links from "./02-2023/links.json" assert { type: "json" }
import nodes from "./02-2023/nodes.json" assert { type: "json" }

const width = window.innerWidth
const height = window.innerHeight


const svg = d3.select('svg')
  .attr('width', width)
  .attr('height', height)
  
var max_value = 0
for (node of nodes) {
  if (node.size > max_value) max_value = node.size;
}

var color = d3.scaleLinear().domain([1, max_value])
  .range(["yellow", "red"])

const radius = 20

var simulation = d3.forceSimulation()
  .force("link", d3.forceLink().id(function(d) { return d.id; }))
  .force("charge", d3.forceManyBody().strength(d => { return -d.size*1000 }))
  .force("center", d3.forceCenter(width / 2, height / 2))
  .force("collide",  d3.forceCollide().radius(d => { return (d.size + 2)*radius }).iterations(3))

  var g = svg.append("g")
    .attr("class", "everything");


  var node = g.append("g")
      .attr("class", "nodes")
    .selectAll("g")
    .data(nodes)
    .enter().append("g")


  var link = g.append("g")
      .attr("class", "links")
    .selectAll("line")
    .data(links)
    .enter().append("line")
      .attr("stroke-width", function(d) { 4 })
      .style('stroke', 'white')


  var circles = node.append("circle")
    .attr("r",  function(d) { 
      return d.size*radius
    })
    .attr("fill", function(d) { 
      return color(d.size*radius);
    })
  // Create a drag handler and append it to the node object instead
  var drag_handler = d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);

  drag_handler(node);
  
  var labels = node.append("text")
      .text(function(d) {
        return d.label
      })
      .attr('x', 6)
      .attr('y', 3)
      .style('fill', 'white')

  node.append("title")
      .text(function(d) {
        return d.label
      });

  simulation
      .nodes(nodes)
      .on("tick", ticked);

  simulation.force("link")
      .links(links);

  function ticked() {
    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node
        .attr("transform", function(d) {
          return "translate(" + d.x + "," + d.y + ")";
        })
  }


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


  //add zoom capabilities 
var zoom_handler = d3.zoom()
.on("zoom", zoom_actions);

zoom_handler(svg);   

function zoom_actions(){
  g.attr("transform", d3.event.transform)
}