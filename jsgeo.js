
function intro(){
  var sum = d3.sum(geojson.features, function(d){ return d.properties.repos});
  var div = d3.select('body')
    .append('div')
    .attr('class', 'intro')

  div.append('div')   
      .attr('class', 'header') 
      .html('JS.Geo<hr/>')

  div.append('div')
      .attr('class', 'stat')
      .html('2 days <hr/>')
    .append('div')
      .attr('class', 'stat')
      .html( geojson.features.length + ' People<hr/>')
    .append('div')
      .attr('class', 'stat')
      .html( state_cnt + ' States<hr/>')
    .append('div')
      .attr('class', 'stat')
      .text( sum + ' Repos');
}

function bubble(){

  /*d3.select('div.header').transition()
    .duration(1000)
    .attr('top', '0px')
    .attr('left', '0px')
    .style('position', 'absolute')*/

  d3.select('#code').text('d3.selectAll( "path" ).data( geojson ).enter().append( "path" )');
    

  d3.select('div.intro').style("opacity", 1)
    .transition()
      .duration(1000)
      .style("opacity", 1e-6)
      .each('end', function(){
        d3.select(this).style('display', 'none');

        var w = 800, h = 800;

        var div = d3.select("body")
          .append('div')
            .style("width", '800px')
            .style('margin', 'auto')

        d3.select('body').append('div')
          .attr('id', 'name');
  
        var vis = div.append("svg")
            .attr("width", w)
            .attr("height", h)
            .attr("class", "bubble");

        var  fill = d3.scale.category10();

        force = d3.layout.force()
          .nodes(geojson.features)
          .links([])
          .gravity(.05)
          .charge(-50) //function(d, i){ return i ? 0 : -2000 })
          .size([w, h])
          .start();

        var node = vis.selectAll("circle.node")
          .data(geojson.features)
          .enter().append("svg:circle")
            .attr("class", "node")
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; })
            .attr("r", 10)
            .attr("id", function(d){ return d.properties.last +': '+ d.properties.repos})
            .style("fill", '#777')
            .style("stroke", '#08c')
            .style("stroke-width", 2)
            //.call(force.drag)
            .on('mouseover', function(){
              d3.select('#name').text(this.id) //function(d) { return d.properties.last +': '+ d.properties.repos});
              d3.select(this).transition().style('stroke-width', 10);
            })
            .on('mouseout', function(){
              d3.select(this).transition().style('stroke-width', 2);
            })

        force.on("tick", function(e) {
          node.attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; })
        });

        vis.style("opacity", 1e-6)
          .transition()
            .duration(1000)
            .style("opacity", 1);

      })
}

function bubble_class(){
  d3.selectAll('circle.node')
    .transition()
    .duration(750)
    .attr("r", function(d){ return d.properties.repos || 10 });

  force.charge(function(d){ return d.properties.repos*-10 })
  force.start();
  
  d3.select('#code').text('d3.selectAll( "circle" ).attr("r", function( d ) { return d.properties.repos; })');
}


function bubble_color(){
  var  color = d3.scale.category10();
  d3.selectAll('circle.node')
    .transition()
    .duration(750)
    .style("fill", function(d){ return color( d.properties.state ) });
  /*var color = d3.scale.quantile()
    .domain([0, 100])
    .range(["red", "white", "green"]);*/
  d3.select('#code').text('d3.selectAll( "circle" ).style("fill", function( d ){ return color( d.properties.state ) })');
}



function map(){

  d3.select('#code').text('');

  d3.select('svg.bubble').selectAll('circle')
    .transition()
    .duration(750)
    .attr("r", 0);

  setTimeout(function(){
    d3.select('svg.bubble').remove();
  },750);

  projection = d3.geo.albersUsa();

  var denver = {properties:{}, geometry: { coordinates: [-105.003011, 39.745147], type:'Point'}};

  var vis = d3.select('body').append('div')
    .attr('id', 'map');
 
  svg = vis.append("svg").attr('class', 'map')
    .call(d3.behavior.zoom()
        .translate(projection.translate())
        .scale(projection.scale())
        .on("zoom", redraw));
  
  
  world_g = svg.append("g").attr('class', 'countries');
  state_g = svg.append("g").attr('class', 'states Blues');
  arcs_g = svg.append("svg:g").attr("id", "arcs");
  dots_g = svg.append("g").attr("id", "dots")
    .attr("class", "Blues");

  arc = d3.geo.greatArc();
  path = d3.geo.path();

   

  // Add States
  state_g.selectAll("path")
    .data(states.features)
    .enter().append("path")
      .attr('d', path)
      //.style('fill', '#000')
      .attr("id", function(d){ return d.properties.name +': '+ u[d.properties.name] || 0})
      .attr('class', 'state')
      /*.on('mouseover', function(){
        console.log('state', this.id);
        d3.select('#name').text(this.id);
      })
      .on('mouseout', function(){
        d3.select('#name').text('');
      });*/

  // Add Dots 
  dots_g.selectAll("path")
      .data(geojson.features) 
      .enter().append("path")
        .attr("d", path)
        .attr("class", "dot")
        .attr("id", function(d){ return d.properties.last +': '+ d.properties.repos})
        .on('mouseover', function(){
         d3.select('#name').text(this.id);
        })
        .on('mouseout', function(){
              d3.select('#name').text('');
        }); 


  // ADD Great Arcs
  links = [];
  geojson.features.forEach(function(f) {
    if (f && f.geometry && f.geometry.coordinates){
      links.push({
        source: denver.geometry.coordinates,
        target: f.geometry.coordinates
      });
    }
  });

  arcs_g.selectAll('path')
    .data(links)
    .enter()
    .append('path')
      .attr('class', 'arc')
      .attr("d", function(d) { return path(arc(d)); })
  
  
}



function map_class(){
  arc = d3.geo.greatArc();
  path = d3.geo.path()
   .pointRadius(function(d){
      if (d.properties.repos){
        return d.properties.repos;
      } else {
        return 5;
      }
    });

  d3.selectAll('.dot').transition()
    .duration(750)
    .attr("d", path);

  setTimeout(function(){
    redraw(); 
  },1000);
}


function map_proj(){
  path = d3.geo.path()
   .pointRadius(function(d){
      if (d.properties.repos){
        return d.properties.repos;
      } else {
        return 5;
      }
    }).projection( d3.geo.albers() );

  d3.selectAll('.dot').transition()
    .duration(750)
    .attr("d", path);

  /*d3.selectAll('.arc').transition()
    .duration(750)
    .attr("d", d3.geo.path().projection( d3.geo.albers() ));*/
}



function aggregate(){
 
  state_g.selectAll("path")
    .on('mouseover', function(){
      d3.select('#name').text(this.id);
    })
    .on('mouseout', function(){
      d3.select('#name').text('');
    }); 

  d3.select('g#arcs').remove();

  path = d3.geo.path()
   .pointRadius(function(d){
      return 0;
    }).projection( d3.geo.albers() );

  d3.selectAll('.dot').transition()
    .duration(1000)
    .attr("d", path)
    .remove();

  //var color = d3.scale.linear()
  //  .domain([0, 200])
  //  .range(['#F0F9E8', '#BAE4BC', '#7BCCC4', '#2B00BE']);
  // Count and style states
  d3.selectAll('.state').transition()
    .duration(1500)
    .style('fill', function(d) { return (u[d.properties.name]) ? green(u[d.properties.name]) : 'black'; }) 

  d3.select('body').transition().style('background', '#000');
  d3.select('#name').style('color', '#fff');
}



var m0,
    o0;

projection = d3.geo.azimuthal()
    .scale(380)
    .origin([-71.03,42.37])
    .mode("orthographic")
    .translate([640, 400]);

var circle = d3.geo.greatCircle()
    .origin(projection.origin());

// TODO fix d3.geo.azimuthal to be consistent with scale
var scale = {
  orthographic: 380,
  stereographic: 380,
  gnomonic: 380,
  equidistant: 380 / Math.PI * 2,
  equalarea: 380 / Math.SQRT2
};

function refresh(duration) {
  (duration ? feature.transition().duration(duration) : feature).attr("d", clip);
}

function clip(d) {
  return path(circle.clip(d));
}


function show_proj(){
  var div = d3.select('body').append('div')
    .attr('class', 'projs');

   div.append('div')
    .attr('class', 'proj')
    .attr('id', 'mercator')
    .text('Mercator')

   div.append('div')
    .attr('class', 'proj')
    .attr('id', 'albers')
    .text('Albers')

   div.append('div')
    .attr('class', 'proj')
    .attr('id', 'azimuthal')
    .text('Azimuthal')

   div.append('div')
    .attr('class', 'proj')
    .attr('id', 'bonne')
    .text('Bonne')

    d3.selectAll('div.proj').on('click', function(){
      project(this.id)
    }) 
   
}


function start_projs(){
  //state_g.on("mousedown", mousedown);
  /*d3.select('body')
    .on("mousemove", mousemove)
    .on("mouseup", mouseup);*/

  d3.select("select").on("change", function() {
    projection.mode(this.value).scale(scale[this.value]);
    refresh(750);
  });


  feature = d3.selectAll("path.state").transition().duration(1000).attr("d", d3.geo.path().projection( 
    d3.geo.azimuthal().scale(380)
      .origin([-71.03,42.37])
      .mode("orthographic")
      .translate([640, 400]) 
    ));

  // ADD Country borders 
  setTimeout(function(){
   d3.json("world-countries.json", function(collection) {

    projection = d3.geo.azimuthal()
      .scale(380)
      .origin([-71.03,42.37])
      .mode("orthographic")
      .translate([640, 400]);
    
    
    world_g.selectAll("path")
      .data(collection.features)
    .enter().append("svg:path")
      .style('fill-opacity', 1)
      .attr('class', 'country')
      .attr("d", path.projection( projection ))

   });
    show_proj();
  },1000);


}

function project( type ){
  if (type == 'azimuthal'){
    projection = d3.geo.azimuthal().scale(380)
      .origin([-71.03,42.37])
      .mode("orthographic")
      .translate([640, 400])
  } else {
    projection =  d3.geo[type]();// .origin([-71.03,42.37]);
  }
  dots_g.selectAll("path.state").transition().duration(1000).attr("d", d3.geo.path().projection( projection ));
  state_g.selectAll("path.state").transition().duration(1000).attr("d", d3.geo.path().projection( projection ));
  world_g.selectAll("path.country").transition().duration(1000).attr("d", d3.geo.path().projection( projection ));
}


function mousedown() {
  m0 = [d3.event.pageX, d3.event.pageY];
  o0 = projection.origin();
  d3.event.preventDefault();
}

var m0, o0, m1, o1;

function mousemove() {
  if (m0) {
    var m1 = [d3.event.pageX, d3.event.pageY],
        o1 = [o0[0] + (m0[0] - m1[0]) / 8, o0[1] + (m1[1] - m0[1]) / 8];
    projection.origin(o1);
    circle.origin(o1)
    refresh();
  }
}

function mouseup() {
  if (m0) {
    mousemove();
    m0 = null;
  }
}

function randomNumber( min, max ) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

var npoints = 0,
  pnts = [];
  all_pnts = [];
function streaming(){
  d3.select('body').append('div').attr('class', 'counter').on('click', function(){ clearInterval(stream_cnt); clearInterval(streaming); });
  path = d3.geo.path().pointRadius(function(d){ return 2; }).projection(projection);
  project('albersUsa');
  redraw();
  stream_cnt = setInterval(function(){
    all_pnts.push(pnts);
    pnts = [];
  }, 1000);

  streaming = setInterval(function(){
    var pnt = {};
    var lat = randomNumber(25, 60);
    var lon = randomNumber(-125, -75);
    var pnt = { properties: { id: npoints++ }, geometry: { coordinates: [ lon, lat ], type: 'Point' } };

    d3.select('div.counter').text(npoints);
    d3.select('g#dots').append('path')
      .datum({type:'FeatureCollection', features:[pnt]})
      .attr("class", "dot")
      .style('stroke-width', 10)
      .attr('d', path).transition()
        .duration(200)
        .style('stroke-width', 1)

    pnts.push(pnt);
    
  }, 5);

  state_g.selectAll('path.state').attr('class', 'state').style('fill', '#000')
  world_g.remove();
  d3.select('div.projs').remove();
  d3.select('div#name').remove();
}


var green = d3.scale.ordinal()
    .domain(d3.range([0,20]))
    .range(colorbrewer.Greens[5]);

var red = d3.scale.ordinal()
    .domain(d3.range([0,20]))
    .range(colorbrewer.Reds[5]);


var state_agg = {};
function time_animation(){
  clearInterval(streaming)
  clearInterval(stream_cnt);
  var i = 0;
  all_pnts.forEach(function( group, i ){
    group.forEach(function( p ){
      pip( p.geometry, i );
    });
  });
  d3.select('g#dots').selectAll('path').transition().duration(1000).style('fill','#000').style('stroke-width',0).remove();

  updateStates(0, 1500);  

  state_g.selectAll('path.state')
    .attr('id', function(d){ return d.properties.name })//+ ': ' + state_agg[d.properties.name][0]; })
    .on('mouseover', function(){
      d3.select('#name').text(this.id);
    })
    .on('mouseout', function(){
      d3.select('#name').text('');
    })
 
  d3.select('body').append('range')
    .attr('id', 'map_range')
    .attr('min', 0)
    .attr('max', all_pnts.length)
    .attr('onChange', 'javascript:slide(this)');

}

function updateStates( index, dur){

  state_g.selectAll('path.state').transition()
    .duration(dur)
    .style('fill', function(d){ 
      if ( state_agg[ d.properties.name ] ){ 
        return red(state_agg[ d.properties.name ][index]);
      } else {
        return '#FFF';
      } 
    });

}

function pip( point, i ){
  states.features.forEach(function(s){
    var inside = gju.pointInPolygon( point, s.geometry );
    if (inside) {
      state = s.properties.name;
      if (!state_agg[state]) {
        state_agg[state] = new Array(all_pnts.length);
        state_agg[state][i] = 0;
      } else if (!state_agg[state][i]){
        state_agg[state][i] = 0;
      }
      state_agg[state][i]++;
    }
  });
}


function add_time(){
  d3.select('body').on('mousemove', function( e ){
    var idx = parseInt((d3.event.clientX / 1000) * all_pnts.length)
    updateStates( idx, 0 ); 
  })
}


 function redraw() {
    if (d3.event) {
      projection
          .translate(d3.event.translate)
          .scale(d3.event.scale);
    }
    world_g.selectAll("path").attr("d", path.projection( projection ) );
    state_g.selectAll("path").attr("d", path.projection( projection ) );
    dots_g.selectAll("path").attr("d", path.projection( projection ) );
    //arcs_g.selectAll('path').attr('d', function(d) { console.log(d); return d3.geo.path(d3.geo.greatArc(d)).projection( projection); }); 
    //arcs_g.selectAll('path').attr("d", function(d) { return path(arc(d)).projection( projection ); })
    //arcs_g.selectAll('path').attr('d', function() { return d3.geo.path(d3.geo.greatArc()).projection( projection ) }); 
    
  }
