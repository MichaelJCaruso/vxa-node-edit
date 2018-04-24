function showGraph (container,what,...args) {
    var f = Chartist[what] || Chartist.Bar;
    console.log (what, ...args);
    var graph;
    if (args.length > 0)
        graph = new f (container[0], ...args);
    else
        graph = new f (container[0], {
            labels: [1, 2, 3, 4],
            series: [[100, 120, 180, 200]]
        });
}

/*
JS jsObject showGraph: "Line" with: (
  JS newObject
  set: "labels" toArrayFrom: 7 sequence .
  set: "series" toArrayFrom: (
     (JS newArrayFrom: 100,120,180,300,-200,234,168) asList
  ).
  jsObject \.id
);
*/
