define(['app/models/worldMap', 'app/models/config', 'PubSub', 'd3', 'togeojson'],
  function(WorldMapData, Config, PubSub){
    'use strict';
  return function() {
    var debug = Config.debug;
    var done;
    var el;
    var mapData;
    var mapid;


    // Example: https://mapsengine.google.com/map/edit?mid=zTpKh93u3nmI.kn5ClQNz9iAk
    var KMLPath = 'mapsengine.google.com/map/kml?mid=';
    var proxyPath = 'http://ec2-54-228-9-201.eu-west-1.compute.amazonaws.com:1337/?src=';

    function _fetchKML() {
      var proxyUrl = proxyPath + KMLPath + mapData.mapurl.split('mid=')[1];

      d3.xml(proxyUrl, function(xml) {
        if (xml) {
          var geoJson = toGeoJSON.kml(xml);
          _drawMap(geoJson);
        }
      });
    }

    function _drawMap(json) {
      var WIDTH = 380;
      var HEIGHT = 800;
      var markerPath = "M77 208 C -10 130 -30 0 77 1 C 184 0 164 130 77 208 Z";

      markerPath += "M 77 30 a 40 40 0 1 0 0.00001 0 Z"; // Circle cut out

      //el = document.createElement('div');
      el.classList.add('svg_wall');

      var svg = d3.select(el).append("svg")
        .attr("width", WIDTH)
        .attr("height", HEIGHT);

      var center = [-1.4, 51];
      if (mapData.center !== undefined && mapData.center.split(',').length === 2) {
        center = mapData.center.split(',').map(function(loc) { return parseFloat(loc); });
      }

      var zoom = 4000;
      if (mapData.zoomlevel !== undefined && !isNaN(parseInt(mapData.zoomlevel, 10)) ) {
        zoom = parseInt(mapData.zoomlevel, 10);
      }

      var translate = [WIDTH / 2, HEIGHT / 2];
      if (mapData.offsetx !== undefined && !isNaN(parseInt(mapData.offsetx, 10)) ) {
        translate[0] += parseInt(mapData.offsetx, 10);
      }

      if (mapData.offsety !== undefined && !isNaN(parseInt(mapData.offsety, 10)) ) {
        translate[1] += parseInt(mapData.offsety, 10);
      }

      // Ref: https://github.com/mbostock/d3/wiki/Geo-Projections
      var projectionType = 'equirectangular';
      if (typeof mapData.projection === 'string') {
        if (mapData.projection.trim().toLocaleLowerCase() === 'mercator') {
          projectionType = 'mercator';
        }

        if (mapData.projection.trim().toLocaleLowerCase() === 'orthographic') {
          projectionType = 'orthographic';
        }
      }


      var projection = d3.geo[projectionType]()
        .scale(zoom)
        .translate(translate)
        .center(center);

      var path = d3.geo.path().projection(projection);

      if (debug) {
        var world = svg.append("svg:g")
          .attr("class", "world");
        world.selectAll(".country")
          .data(WorldMapData.features)
          .enter().insert("path", ".graticule")
          .attr("class", "country")
          .attr("d", path);
      }

      // Add walls
      var wallData = json.features.filter(function(feature) {
        return feature.properties.folder.toLowerCase() === 'walls';
      });

      var walls = svg.append("svg:g")
        .attr("class", "wall_group");

      walls.selectAll("path")
        .data(wallData)
        .enter()
        .append("path")
        .attr("class", 'wall_path')
        .attr("d", path);


      // Add Labels
      var labelsData = json.features.filter(function(feature) {
        return feature.properties.folder.toLowerCase() === 'labels';
      });

      var labels = svg.append("svg:g")
        .attr("class", "labels");

      labels.selectAll("path")
        .data(labelsData)
        .enter()
        .append("g")
        .attr("class", "label_group")
        .attr('id', function(d) { return 'marker_' + d.properties.name; })
        .append("svg:text")
        .attr("text-anchor", "middle")
        .attr("class", function(d) {if (d.properties.description === "1") {return "label_text major";} else {return "label_text minor";}})
        .attr("id", function(d) { return 'label-' + d.properties.name; })
        .attr("transform", function(d) { return "translate(" + projection(d.geometry.coordinates) + ")"; })
        .text(function(d) {if (d.properties.description === "1") {return d.properties.name;} else {return "◆ " + d.properties.name;}});

      // Add markers
      var markerData = json.features.filter(function(feature) {
        return feature.properties.folder.toLowerCase() === 'markers';
      });

      var markers = svg.append("svg:g")
        .attr("class", "markers");

      markers.selectAll("path")
        .data(markerData)
        .enter()
        .append("g")
        .attr("class", "marker_group")
        .attr('id', function(d) { return 'marker_' + d.properties.name; })
        .append("svg:text")
        .attr("text-anchor", "middle")
        .attr("class", "marker_text")
        .attr("id", function(d) { return 'marker-' + d.properties.name; })
        .attr("transform", function(d) { return "translate(" + projection(d.geometry.coordinates) + ")"; });

      markers.selectAll(".marker_group")
        .data(markerData)
        .append("path")
        .attr('class', 'marker_path')
        .attr('transform', function(d) {var x = projection(d.geometry.coordinates)[0] - 11; var y = projection(d.geometry.coordinates)[1] - 22; return "translate(" + x + "," + y + ") scale(0.10)";})
        .attr("d", markerPath);

      done();
    }

    function render(ID, targetEl, callback, data) {
      mapid = ID;
      done = callback;
      mapData = data;
      el = targetEl;
      _fetchKML();
    }

    return {
      render: render
    };
  };
});