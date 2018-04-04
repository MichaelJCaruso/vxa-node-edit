//     d3.json("./tweets.json", data => histogram(data.tweets) );

function showGraph (url) {
    d3.json(url, data => histogram(data.tweets) );
}

function histogram(tweetsData) {
    var xScale = d3.scaleLinear().domain([ 0, 5 ]).range([ 0, 500 ]);
    var yScale = d3.scaleLinear().domain([ 0, 10 ]).range([ 400, 0 ]);
    var xAxis = d3.axisBottom().scale(xScale).ticks(5);
    
    var histoChart = d3.histogram();
    
    histoChart
        .domain([ 0, 5 ])
        .thresholds([ 0, 1, 2, 3, 4, 5 ])
        .value(d => d.favorites.length);
    
    histoData = histoChart(tweetsData);
    
    d3.select("svg")
        .selectAll("rect")
        .data(histoData).enter()
        .append("rect")
        .attr("x", d => xScale(d.x0))
        .attr("y", d => yScale(d.length))
        .attr("width", d => xScale(d.x1 - d.x0) - 2)
        .attr("height", d => 400 - yScale(d.length))
        .style("fill", "#FCD88B");
    
    d3.select("svg").append("g").attr("class", "x axis")
        .attr("transform", "translate(0,400)").call(xAxis);
    
    d3.select("g.axis").selectAll("text").attr("dx", 50);
}
