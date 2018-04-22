function showGraph (container,what,...args) {
    var f = Chartist[what] || Chartist.Bar;
    console.log (what, Chartist[what], f);
    new f (container[0], {
        labels: [1, 2, 3, 4],
        series: [[100, 120, 180, 200]]
    });
}
