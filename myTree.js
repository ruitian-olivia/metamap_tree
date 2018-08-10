function renderTreeChart(treeDepth){
    // alert(slider);
    var svg = d3.select('#content')
        .append('svg')
        .attr('width',1120).attr('height',505);

    var width = svg.attr('width'),
        height = svg.attr('height'),
        g = svg.append('g').attr('transform','translate(500,250)');

    //var tree = d3.cluster().size([height-50,width-500]);
    var tree = d3.tree().size([height-50,width-500])
            .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });

    var stratify = d3.stratify()
        .parentId(function(d){return d.id.substring(0,d.id.lastIndexOf('@'));});
    
    
    d3.csv("MetaLab.iMetaLab.tree.csv",function(error,data){
        if(error) throw error;

        /* //Deal with data!!!
        console.log(data);
        var i;
        for (i in  data)
        {
            if(data[i].id)
            {var name = data[i].id;}
            else{name="";}
            console.log(name.length);
            var depthNumber = 0;
            for(var j = 0;j < name.length;j++){
                if(name[j] === '@'){
                    depthNumber = depthNumber + 1;
                }
            }
            console.log(depthNumber);
            if (depthNumber>treeDepth){
                data.splice(i,1);
            }
        } */

        /* var root = stratify(data)
            .sort(function(a,b){return(a.height-b.height)||a.id.localeCompare(b.id);}); */
        var root = tree(stratify(data));
        
        //console.log(data);
        //console.log(root.descendants());
    // tree(root); 
    //Change the depth of tree
      var rootData = root.descendants();
        var x;
        for (x in rootData)
        {
            //console.log(rootData[x]);
            if (rootData[x].depth == treeDepth)
            {
                rootData[x].children = [];
            }
            if (rootData[x].depth > treeDepth)
            {
                rootData.splice(x,1);
            }
        }
        console.log(data);
        console.log(root);
        //console.log(tree(data));
        console.log(root.descendants());
        console.log(rootData);
    
        var link = g.selectAll(".link")
        .data(root.descendants().slice(1))
        .enter().append("path")
        .attr("class", "link")
        /* .attr("d", function(d) {
            return "M" + d.y + "," + d.x
		    + "C" + (d.y + d.parent.y) / 2 + "," + d.x
		    + " " + (d.y + d.parent.y) / 2 + "," + d.parent.x
            + " " + d.parent.y + "," + d.parent.x; */
        .attr("d", function(d) {
            return "M" + project(d.x, d.y)
                + "C" + project(d.x, (d.y + d.parent.y) / 2)
                + " " + project(d.parent.x, (d.y + d.parent.y) / 2)
                + " " + project(d.parent.x, d.parent.y);
        /* return "M" + d.y + "," + d.x
            + "C" + (d.parent.y ) + "," + d.x
            + " " + (d.parent.y ) + "," + d.parent.x
            + " " + d.parent.y + "," + d.parent.x; */
        });

        var node = g.selectAll(".node")
            .data(root.descendants())
            .enter().append("g")
            .attr("class", function(d) { return "node" + (d.children ? " node--internal" : " node--leaf"); })
            /* .attr("transform", function(d) { 
                return "translate(" + d.y + "," + d.x + ")"; 
            }); */
            .attr("transform", function(d) { 
                return "translate(" + project(d.x, d.y) + ")"; });
        
        console.log(node);
        //A map of Depth-Color
        var map = {0:'#F20CE3',1:'#7829F0',2:'#3731D8',3:'#5286EA',4:'#52B7EA',5:'#52DCEA',6:'#52EAD5',7:'#54FFAA'};
        node.append("circle")
            .attr("r", function(d){return (d.data.value)*(d.data.value)/1500+1;})
            .style("fill",function(d){
                return map[d.depth];
            });
        /*svg.selectAll('circle')
            .on('mouseover',function(d,i){
                d3.select(this)
                .attr('fill','steelblue')
        });
        node.on('mouseover',function(d,i){
            d3.select(this)
                .attr('fill','steelblue')
        });
        node.on('mouseout',function(d,i){
            d3.select(this)
                .attr('fill','black')
        });
        node.on('mouseover',showData)
            .on('mouseout',hideData)

        node.append("text")
            .attr("x",-5)
            .attr("y", function(d) { return -(d.data.value/10 + 1) ; })
            //.style("text-anchor", function(d) { return d.children ? "end" : "start"; })
            .text(function(d) { return d.id.substring(d.id.lastIndexOf(".")+1); });*/
        //var tooltip = d3.select("svg")
            //.append("text"
            //.attr("id","tooltip");
        console.log()
        node.on("mouseover",function(d){
                    var x =d3.event.pageX-70;
                    var y =d3.event.pageY-70;
                    svg.append("text")
                        .attr("id","tooltip")    				
                        .attr("x",x)
                        .attr("y", y)
                        .attr("text-anchor","end")  
                        .attr("font-family","sans-setif")  
                        .attr("font-size","11px")  
                        .attr("font-weight","bold")  
                        .attr("fill","black")  
                
                        .text(d.id.substring(d.id.lastIndexOf("@")+1)+':'+d.data.value);
                   
            });
        node.on('mouseout',function(d){
                d3.selectAll('#tooltip').remove();
            });

        node.on('click',function(d){
            //let foo = d3.select('svg').selectAll('circle').data();
            //console.log(foo);
            console.log(d3.select(d3.event.target).data()[0].descendants());
            let _data = d3.select(d3.event.target).data()[0].descendants();

            let newDivs = d3.selectAll('g').selectAll('.node').data(_data);
            newDivs.exit().remove();
            // newDivs.enter().append('g')
            //     .attr('class', 'node')
            //     .attr("transform", function(d) { 
            //         return "translate(" + project(d.x, d.y) + ")"; })
            //     .append('circle')
            //     .attr('r', 15)
            //     .attr('fill','yellow');
            // // newDivs.enter().append('circle')
            //     //.merge(newDivs)
            //     .attr('fill', 'yellow')
            //     .attr('cx', function(d){return d.x;})
            //     .attr('cy', function(d){return d.y;})
            //     .attr('r', 20)
            //     .merge(newDivs);
            console.log(d3.selectAll('.node'));
            console.log(newDivs);
            
            
            // console.log(d3.select(this).select('circle'));
            // //console.log(d3.select(this).node().descendants());
            // d3.select(this).select('circle').node()
            //     .setAttribute('style', 'fill:red');
            // // d3.select(this).append("circle")
            // // .attr("r", function(d){return (d.data.value)*(d.data.value)/1500+1;})
            // // .attr("id","highlight")
            // // .style("fill","red");
        });
        svg.on('dblclick',function(d){
            svg.selectAll('#highlight').remove();
        });

        link.on('mousedown',function(d){
            var Path = d3.select(this).node();
            console.log(d3.select(this).node());
            //console.log(Path.attributes.d);
            //Path.path("stroke","red");
            Path.remove()
                .append("path")
                .attr("class", "newLink")
                .attr("d", function(d) {
                return "M" + project(d.x, d.y)
                    + "C" + project(d.x, (d.y + d.parent.y) / 2)
                    + " " + project(d.parent.x, (d.y + d.parent.y) / 2)
                    + " " + project(d.parent.x, d.parent.y);
                });
            });
        node.on('mouseup',function(d){

        });

        
    });


    // 1. Create the button
    //var button = document.createElement("button");
    //button.innerHTML = "Do Something";

    // 2. Append somewhere
    //var body = document.getElementsByTagName("body")[0];
    //body.appendChild(button);


    // 3. Add event handler
    //button.addEventListener ("click", function() {
    //alert("did something");
    //});

    /* var button = document.createElement('button');
    button.innerHTML = 'Do Something';
    var sidebar = document.getElementsByName('sidebar');
    sidebar.appendChild(button);
    button.on ("click", function() {
    alert("did something");
    });
    console.log(button); */

    /* var button = d3.select('#sidebar').append('button');
    button.innerHTML = 'Do Something'; */

    function showFunction(){
        //var node = d3.selectAll('node');
        var node = g.selectAll(".node");
        node.append("text")
            .attr("class",'details')
            .attr("text-anchor", function(d){return d.children ? "end" : "start"})
            .attr("x",5)
            .attr("y", function(d) { return -(d.data.value/10 + 1) ; })
            //.style("text-anchor", function(d) { return d.children ? "end" : "start"; })
            .text(function(d) { return d.id.substring(d.id.lastIndexOf("@")+1)+':'+d.data.value});
    };
    function hideFunction(){
        g.selectAll('.details').remove();
    };




    //Drag & Zoom in/out
    var view = svg
    .selectAll("g")
    
    var zoom = d3
    .zoom()
    // 设置缩放区域为0.1-100倍
    .scaleExtent([0.1, 100])
    .on("zoom", () => {
        var transform = d3.event.transform;
        view.selectAll(".node").attr("transform", function(d){
            //return "translate("+transform.applyX(d.y)+","+transform.applyY(d.x)+")";
            return "translate(" + transform.apply(project(d.x, d.y)) + ")"; 
		});
        view.selectAll(".link").attr("d", function(d) {
	    	/* return "M" + transform.applyX(d.y) + "," + transform.applyY(d.x)
	        + "C" + (transform.applyX(d.y) + transform.applyX(d.parent.y)) / 2 + "," + transform.applyY(d.x)
	        + " " + (transform.applyX(d.y) + transform.applyX(d.parent.y)) / 2 + "," + transform.applyY(d.parent.x)
            + " " + transform.applyX(d.parent.y) + "," + transform.applyY(d.parent.x); */
            return "M" + transform.apply(project(d.x, d.y))
	        + "C" + transform.apply(project(d.x, (d.y + d.parent.y) / 2))
	        + " " + transform.apply(project(d.parent.x, (d.y + d.parent.y) / 2))
	        + " " + transform.apply(project(d.parent.x, d.parent.y))
          });
        
       /*  view.attr(
            "transform",
            "translate(" +
                (d3.event.transform.x) +
                "," +
                (d3.event.transform.y) +
                ") scale(" +
                d3.event.transform.k +
                ")"
            ); */
    });
    // svg层绑定zoom事件，同时释放zoom双击事件
    svg.call(zoom).on("dblclick.zoom", () => {});
}
/* // 获取最多的子节点数
    function getMax(obj) {
    let max = 0;
    if (obj.children) {
        max = obj.children.length;
        obj.children.forEach(d => {
        const tmpMax = this.getMax(d);
        if (tmpMax > max) {
            max = tmpMax;
        }
        });
    }
    return max;
    }
    // 获取最深层级数
    function getDepth(obj) {
    var depth = 0;
    if (obj.children) {
        obj.children.forEach(d => {
        var tmpDepth = this.getDepth(d);
        if (tmpDepth > depth) {
            depth = tmpDepth;
        }
        });
    }
    return 1 + depth;
    }

    function updateChart(source) {
    // 大致计算需要放大的倍数
    var scale = (getDepth(root) / 8 || 0.5) + (getMax(root) / 12 || 0.5);
    // 定义Tree层级，并设置宽高
    var treemap = d3.tree().size([height * scale, width]);
    // 其他处理 
    } */

//}

function showFunction(){
    //var node = d3.selectAll('node');
    var node = d3.selectAll(".node");
    node.append("text")
        .attr("class",'details')
        .attr("text-anchor", function(d){return d.children ? "end" : "start"})
        .attr("x",5)
        .attr("y", function(d) { return -(d.data.value/10 + 1) ; })
        //.style("text-anchor", function(d) { return d.children ? "end" : "start"; })
        .text(function(d) { return d.id.substring(d.id.lastIndexOf("@")+1)+':'+d.data.value});
};
function hideFunction(){
    d3.selectAll('.details').remove();
};

function project(x, y){
	var angle = (x-90)/180 * Math.PI, radius = y;
	return [radius*Math.cos(angle), radius*Math.sin(angle)];
};


