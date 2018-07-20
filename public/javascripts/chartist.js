var mrGraph; // most recent

class GraphSpec {
    constructor (what,args) {
        this.what = what;
        this.args = args;
    }

    render (container) {
        //  ... 'container' must be a DOM element, typically a 'div'
        var f = Chartist[this.what] || Chartist.Bar;
        console.log (this.what, ...this.args);
        return this.args.length > 0
            ? new f (container, ...this.args)
            : new f (container, {
                labels: [1, 2, 3, 4],
                series: [[100, 120, 180, 200]]
            });
    }
}

function showGraph (container,what,...args) {
/*
    //  ... 'container' must be a DOM element, typically a 'div'
    var f = Chartist[what] || Chartist.Bar;
    console.log (what, ...args);
    var graph;
    if (args.length > 0)
        graph = new f (container, ...args);
    else
        graph = new f (container, {
            labels: [1, 2, 3, 4],
            series: [[100, 120, 180, 200]]
        });
    }
*/
    var mrGraph = (new GraphSpec (what,args)).render (container);
    return mrGraph;
}

/****************************************************************

################
JS jsObject showGraph: "Line" with: (
  JS newObject
  set: "labels" toArrayFrom: 7 sequence .
  set: "series" toArrayFrom: (
     (JS newArrayFrom: 100,120,180,300,-200,234,168) asList
  ). jsParam
);

################
!data <- Security masterList
 groupedBy: [industry].
    select: [isntDefault].
  sortDown: [groupList count];

JS jsObject
  showGraph: "Bar"
  of: (
    JS newObject
      set: "labels" toArrayFrom: (data send: [name]).
      set: "series" toArrayFrom: (
        (JS newArrayFrom: (data send: [groupList count])) asList
      )
  ) jsParam
  withOptions: (
    JS newObject
      set: "width" to: "10000px".
      set: "height" to: 400
  ) jsParam;

################
!data <- Security masterList
 groupedBy: [industry].
    select: [isntDefault].
  sortDown: [groupList count];

JS jsObject
  showGraph: "Bar"
  of: (
    JS newObject
      set: "labels" toArrayFrom: (data send: [name]).
      set: "series" toArrayFrom: (
        (JS newArrayFrom: (data send: [groupList count])) asList
      )
  ) jsParam
  withOptions: (
    JS newObject
      set: "width" to: "15000px".
      set: "height" to: 400 .
      set: "axisX" to: (
        JS newObject
          set: "offset" to: 100 .
      ) jsParam
  ) jsParam;

################
!data <- Security masterList
 groupedBy: [industry].
    select: [isntDefault].
  sortDown: [groupList count];

JS jsObject showGraph: "Bar" of: (
  JS newObject
  set: "labels" toArrayFrom: (data send: [[name print] divertOutput]) .
  set: "series" toArrayFrom: (
    (JS newArrayFrom: (data send: [groupList count])) asList
  ).
  jsParam
) withOptions: (
  JS newObject
  set: "horizontalBars" to: 1 .
  set: "height" to: (data count * 40) asInteger .
  jsParam
);

################
!data <- Security masterList
 groupedBy: [industry].
    select: [isntDefault].
  sortDown: [groupList count].
     first: 15;

JS jsObject showGraph: "Pie" of: (
  JS newObject
  set: "labels" toArrayFrom: (data send: [name]).
  set: "series" toArrayFrom: (data send: [groupList count]).
) jsParam withOptions: (
  JS newObject
  set: "height" to: 1000
) jsParam;

****************************************************************/
