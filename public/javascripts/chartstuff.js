//     d3.json("./tweets.json", data => histogram(data.tweets) );

var whichgram = histogram2;
function showGraph (url) {
    $('#viz-svg').empty ();
    d3.json(
	url,
	data => whichgram(data.tweets, d => d.favorites.length)
    );
}

/********************************/
function histogram1(input,accessor) {
    var xScale = d3.scaleLinear().domain([ 0, 5 ]).range([ 0, 500 ]);
    var yScale = d3.scaleLinear().domain([ 0, 10 ]).range([ 400, 0 ]);
    var xAxis = d3.axisBottom().scale(xScale).ticks(5);

    var histoChart = d3.histogram();

    histoChart
        .domain([ 0, 5 ])
        .thresholds([ 0, 1, 2, 3, 4, 5 ])
        .value(accessor);

    histoData = histoChart(input);

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

/********************************/
function histogram2(input,accessor) {
    var formatCount = d3.format(",.0f");

    var minWidth  = 2,
	minHeight = 2;
    
    var svg = d3.select("svg"),
	margin = {top: 10, right: 30, bottom: 30, left: 30},
	width = Math.max(+svg.attr("width") - margin.left - margin.right,minWidth),
	height = Math.max(+svg.attr("height") - margin.top - margin.bottom,minHeight),
	g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

/*
    var x = d3.scaleLinear()
	.rangeRound([0, width]);
*/
    var x = d3.scaleLinear().domain([ 0, 5 ]).range([ 0, 500 ]);

    var bins = d3.histogram()
	.domain(x.domain())
    	.thresholds(x.ticks(20))
	.value(accessor)
    (input);
    console.log (bins);

    var y = d3.scaleLinear().domain([ 0, 10 ]).range([ 400, 0 ]);
/*
    var y = d3.scaleLinear()
	.domain([0, d3.max(bins, function(d) { return d.length; })])
	.range([height, 0]);
*/

    var bar = g.selectAll(".bar")
	.data(bins)
	.enter().append("g")
	.attr("class", "bar")
	.attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; });

    bar.append("rect")
	.attr("x", 1)
	.attr("width", Math.max(x(bins[0].x1) - x(bins[0].x0) - 1, minWidth))
        .attr("height", function(d) { return Math.max(height - y(d.length), minHeight); });

    bar.append("text")
	.attr("dy", ".75em")
	.attr("y", 6)
	.attr("x", (x(bins[0].x1) - x(bins[0].x0)) / 2)
	.attr("text-anchor", "middle")
	.text(function(d) { return formatCount(d.length); });

    g.append("g")
	.attr("class", "axis axis--x")
	.attr("transform", "translate(0," + height + ")")
	.call(d3.axisBottom(x));
}
