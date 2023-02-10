import groups from "./02-2023/groups.json" assert { type: "json" }
import graph from "./02-2023/data.json" assert { type: "json" }

const width = window.innerWidth
const height = window.innerHeight


const svg = d3.select('svg')
  .attr('width', width)
  .attr('height', height)
  

var color = d3.scaleOrdinal(d3.schemeCategory20);

const radius = 20

var simulation = d3.forceSimulation()
  .force("link", d3.forceLink().id(function(d) { return d.id; }))
  .force("charge", d3.forceManyBody().strength(d => { return d.type === 'user' ? 0 : -d.size*1000}))
  .force("center", d3.forceCenter(width / 2, height / 2))
  .force("collide",  d3.forceCollide().radius(d => { return d.type === 'user' ? (d.accreds + 2)*radius : Math.log2(d.size*radius + 2)*radius }).iterations(3))

  var g = svg.append("g")
    .attr("class", "everything");


  var node = g.append("g")
      .attr("class", "nodes")
    .selectAll("g")
    .data(graph.nodes)
    .enter().append("g")


  var link = g.append("g")
      .attr("class", "links")
    .selectAll("line")
    .data(graph.links)
    .enter().append("line")
      .attr("stroke-width", function(d) { return Math.sqrt(d.value); })
      .style('stroke', 'white')


  var circles = node.append("circle")
    .attr("r",  function(d) { 
      return d.type === 'user' ? d.accreds*5 : Math.log2(d.size*radius + 2)*radius })
    .attr("fill", function(d) { 
      if (d.type == 'unit') {
        return color(d.group_id);
      } else {
        return 'red'
      }
    })
  // Create a drag handler and append it to the node object instead
  var drag_handler = d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);

  drag_handler(node);
  
  var labels = node.append("text")
      .text(function(d) {
        return d.type === 'user' ? d.name : d.label
      })
      .style("font-size", function(d) { return Math.min(2 * d.r, (2 * d.r - 8) / this.getComputedTextLength() * 24) + "px"; })
      .attr('x', 6)
      .attr('y', 3)
      .style('fill', 'white')

  node.append("title")
      .text(function(d) { return d.type === 'user' ? d.name : d.label });

  simulation
      .nodes(graph.nodes)
      .on("tick", ticked);

  simulation.force("link")
      .links(graph.links);

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

/*setTimeout(() => {
  simulation.stop();
}, 2000)*/

// Add one dot in the legend for each name.

svg.selectAll("mydots")
  .data(groups)
  .enter()
  .append("circle")
    .attr("cx", 100)
    .attr("cy", function(d,i){ return 100 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
    .attr("r", 7)
    .style("fill", function(d){ return color(d.id)})

// Add one dot in the legend for each name.
svg.selectAll("mylabels")
  .data(groups)
  .enter()
  .append("text")
    .attr("x", 120)
    .attr("y", function(d,i){ return 100 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
    .style("fill", function(d){ return color(d.id)})
    .text(function(d){ return d.name})
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle")