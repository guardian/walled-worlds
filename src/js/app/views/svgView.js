define(['app/models/worldMap', 'PubSub', 'd3', 'togeojson'], function(WorldMapData, PubSub) {
  return function() {
    var el;
    var mapData;
    var mapid;
    var debug = true;

    // Example: https://mapsengine.google.com/map/edit?mid=zTpKh93u3nmI.kn5ClQNz9iAk
    var KMLPath = 'mapsengine.google.com/map/kml?mid=';
    var proxyPath = 'http://localhost:1337/?src=';

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
      var HEIGHT = 400;
      el = document.createElement('div');
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


      var projection = d3.geo.mercator()
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
        return feature.geometry.type.toLocaleLowerCase() === 'linestring';
      });

      var walls = svg.append("svg:g")
        .attr("class", "wall_group");

      walls.selectAll("path")
        .data(wallData)
        .enter()
        .append("path")
        .attr("class", 'wall_path')
        .attr("d", path);

      // Add markers
      var markerData = json.features.filter(function(feature) {
        return feature.geometry.type.toLocaleLowerCase() === 'point';
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
        .attr("transform", function(d) { return "translate(" + projection(d.geometry.coordinates) + ")"; })
        .text(function(d) { return d.properties.description; });

      markers.selectAll(".marker_group")
        .data(markerData)
        .append("path")
        .attr('class', 'marker_path')
        .attr("d", path);

      PubSub.publish('mapRendered', { id: mapid });
    }


    function render() {
      return el;
    }

    function init(mapID, data) {
      mapData = data;
      mapid = mapID;
      _fetchKML();
    }

    return {
      render: render,
      init: init
    };
  };
});
