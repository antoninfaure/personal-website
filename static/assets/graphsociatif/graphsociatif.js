import links from "./02-2023/links.json" assert { type: "json" }
import nodes from "./02-2023/nodes.json" assert { type: "json" }

const width = window.innerWidth
const height = window.innerHeight


const svg = d3.select('svg')
  .attr('width', width)
  .attr('height', height)
  

var color = d3.scaleOrdinal(d3.schemeCategory20);

const radius = 20

var simulation = d3.forceSimulation()
  .force("link", d3.forceLink().id(function(d) { return d.id; }))
  .force("charge", d3.forceManyBody().strength(-8000))
  .force("center", d3.forceCenter(width / 2, height / 2))
  .force("collide", d3.forceCollide(radius*5))


  var g = svg.append("g")
    .attr("class", "everything");

  var linkElements = g.selectAll(".gLink")
    .data(links)
  .enter().append("g")
    .attr("class", "gLink")
  .append("line")
    .attr("class", "link")
    .style("stroke", "red")
    .attr("x1", function(d) { return d.source.x; })
    .attr("y1", function(d) { return d.source.y; })
    .attr("x2", function(d) { return d.target.x; })
    .attr("y2", function(d) { return d.target.y; });

  

const nodeElements = g.append('g')
  .selectAll('circle')
  .data(nodes)
  .enter().append('circle')
    .attr('r', radius)
    .attr('fill', 'white')
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));

const nodesLabelsElements = g.append('g')
  .selectAll('text')
  .data(nodes)
  .enter().append('text')
    .text(node => node.acronym)
    .attr('font-size', 15)
    .style('fill', 'red')
    .attr('dx', 15)
    .attr('dy', 4)
    
    // Append text to Link edges
    var linkText = g.selectAll(".gLink")
      .data(links)
      .append("text")
      .attr("font-family", "Arial, Helvetica, sans-serif")
  .attr("x", function(d) {
    if (d.target.x > d.source.x) { return (d.source.x + (d.target.x - d.source.x)/2); }
    else { return (d.target.x + (d.source.x - d.target.x)/2); }
  })
      .attr("y", function(d) {
    if (d.target.y > d.source.y) { return (d.source.y + (d.target.y - d.source.y)/2); }
    else { return (d.target.y + (d.source.y - d.target.y)/2); }
  })
  .attr("fill", "white")
      .style("font", "normal 12px Arial")
      .attr("dy", ".35em")
      .text(function(d) { return d.label; });

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
  simulation.stop();
}

simulation.nodes(nodes).on('tick', () => {
  nodeElements
    .attr("cx", node => node.x)
    .attr("cy", node => node.y)

  nodesLabelsElements
    .attr("x", node => node.x)
    .attr("y", node => node.y)

  linkElements
    .attr("x1", function(d) { return d.source.x; })
    .attr("y1", function(d) { return d.source.y; })
    .attr("x2", function(d) { return d.target.x; })
    .attr("y2", function(d) { return d.target.y; });

    linkText
	    .attr("x", function(d) {
	        if (d.target.x > d.source.x) { return (d.source.x + (d.target.x - d.source.x)/2); }
	        else { return (d.target.x + (d.source.x - d.target.x)/2); }
	    })
	    .attr("y", function(d) {
	        if (d.target.y > d.source.y) { return (d.source.y + (d.target.y - d.source.y)/2); }
	        else { return (d.target.y + (d.source.y - d.target.y)/2); }
	    });
})

linkElements
  .attr('x1', link => link.source.x)
  .attr('y1', link => link.source.y)
  .attr('x2', link => link.target.x)
  .attr('y2', link => link.target.y)


simulation.force("link")
  .links(links);


  //add zoom capabilities 
var zoom_handler = d3.zoom()
.on("zoom", zoom_actions);

zoom_handler(svg);   

function zoom_actions(){
  g.attr("transform", d3.event.transform)
}

setTimeout(() => {
  simulation.stop();
}, 2000)