/******************************draw tree***************************************/
function tree(data, div){
	var width = 960,
		height = 860;

	var color = d3.scaleOrdinal(d3.schemeCategory10);

	var svg = d3.select(div).append("svg")
		.attr("width", width)
		.attr("height", height)
		.style("background-color", "white");

    var ng = svg.append("g").attr("transform", "translate(60,150)");

	var tree = d3.tree()
	    .size([height -200, width - 300]);

	var stratify = d3.stratify()
	    .parentId(function(d) { return d.id.substring(0, d.id.lastIndexOf("@")); });

	var root = stratify(data)
		.sort(function(a, b) { return (a.height - b.height) || a.id.localeCompare(b.id); });
	//console.log(tree(root).descendants().slice(1));
	var link = ng.selectAll(".link")
		.data(tree(root).descendants().slice(1))
		.enter().append("path")
		.attr("class", "link")
		.style("stroke", color)
		.style("fill", "none")
		.style("stroke-opacity", 0.4)
		.style("stroke-width", 1.5)
		.attr("d", function(d) {
			return "M" + d.y + "," + d.x
		    + "C" + (d.y + d.parent.y) / 2 + "," + d.x
		    + " " + (d.y + d.parent.y) / 2 + "," + d.parent.x
		    + " " + d.parent.y + "," + d.parent.x;
		});

	var node = ng.selectAll(".node")
		.data(root.descendants())
		.enter().append("g")
		.attr("class", function(d) { return "node" + (d.children ? " node--internal" : " node--leaf"); })
		.attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

	node.append("circle")
		.attr("r", 3.5)
		.style("fill", function(d){
			//console.log(d.id.split("@", 3));
			return color(d.depth >= 2 && d.id.split("@", 3));
		});

  	node.append("text")
  		.attr("dy", 5)
		.attr("x", function(d) { return d.parent ? 10 : -10; })
		.style("text-anchor", function(d) { return d.parent ? "start" : "end"; })
		.style("font", "10px sans-serif")
		.attr("transform", function(d){return d.parent ? "rotate(-30)" : "rotate(0)"; })
		.text(function(d) { return d.id.substring(d.id.lastIndexOf("@") + 1); });

	svg.call(d3.zoom()
	.scaleExtent([0, 10])
	.on("zoom", function(){
		var transform = d3.event.transform;
		ng.selectAll(".node").attr("transform", function(d){
			return "translate("+transform.applyX(d.y)+","+transform.applyY(d.x)+")";
		});

		ng.selectAll(".link").attr("d", function(d) {
	    	return "M" + transform.applyX(d.y) + "," + transform.applyY(d.x)
	        + "C" + (transform.applyX(d.y) + transform.applyX(d.parent.y)) / 2 + "," + transform.applyY(d.x)
	        + " " + (transform.applyX(d.y) + transform.applyX(d.parent.y)) / 2 + "," + transform.applyY(d.parent.x)
	        + " " + transform.applyX(d.parent.y) + "," + transform.applyY(d.parent.x);
	  	});
	})); 
}


/*********************************draw radial tree*********************************/
function radialTree(data, div){
	var width = 960,
		height = 880;
	var color = d3.scaleOrdinal(d3.schemeCategory10);
	var svg = d3.select(div).append("svg")
		.attr("width", width)
		.attr("height", height)
		.style("background-color", "white");


    ng = svg.append("g").attr("transform", "translate(" + (width / 2 + 40) + "," + (height / 2) + ")");

	var stratify = d3.stratify()
	    .parentId(function(d) { return d.id.substring(0, d.id.lastIndexOf("@")); });

	var tree = d3.tree()
	    .size([360, 500])
	    .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });

	var root = tree(stratify(data));

	var link = ng.selectAll(".link")
	.data(root.descendants().slice(1))
	.enter().append("path")
	  .attr("class", "link")
	  .style("stroke", color)
	  .style("fill", "none")
      .style("stroke-opacity", 0.4)
      .style("stroke-width", 1.5)
	  .attr("d", function(d) {
	    return "M" + project(d.x, d.y)
	        + "C" + project(d.x, (d.y + d.parent.y) / 2)
	        + " " + project(d.parent.x, (d.y + d.parent.y) / 2)
	        + " " + project(d.parent.x, d.parent.y);
	  });

	var node = ng.selectAll(".node")
	.data(root.descendants())
	.enter().append("g")
	  .attr("class", function(d) { return "node" + (d.children ? " node--internal" : " node--leaf"); })
	  .attr("transform", function(d) { 
	  	//console.log(d);
	  	return "translate(" + project(d.x, d.y) + ")"; });

	node.append("circle")
	  .attr("r", 3.5)
	  .style("fill", function(d){
	      	//console.log(d.id.split("@", 3));
	      	return color(d.depth >= 2 && d.id.split("@", 3));
	      });

	node.append("text")
	  .attr("dy", ".31em")
	  .attr("x", function(d) { return d.parent ? 10 : -10; })
	  .style("text-anchor", function(d) { return d.parent ? "start" : "end"; })
	  .style("font", "10px sans-serif")
	  .attr("transform", function(d){ if(d.children){ return "rotate(30)";}else{return "rotate(" + (d.x - 100) + ")";} })
	  .text(function(d) { return d.id.substring(d.id.lastIndexOf("@") + 1); });

	svg.call(d3.zoom()
	.scaleExtent([0, 10])
	.on("zoom", function(){
		var transform = d3.event.transform;
		ng.selectAll(".node")
			.attr("transform", function(d){
			return "translate(" + transform.apply(project(d.x, d.y)) + ")"; 
		});

		ng.selectAll(".link")
			.attr("d", function(d) {
		     return "M" + transform.apply(project(d.x, d.y))
	        + "C" + transform.apply(project(d.x, (d.y + d.parent.y) / 2))
	        + " " + transform.apply(project(d.parent.x, (d.y + d.parent.y) / 2))
	        + " " + transform.apply(project(d.parent.x, d.parent.y));
		  });
	}));
}

function project(x, y){
	var angle = (x-90)/180 * Math.PI, radius = y;
	return [radius*Math.cos(angle), radius*Math.sin(angle)];
}