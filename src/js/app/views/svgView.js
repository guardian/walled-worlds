define(['app/models/worldMap', 'PubSub', 'd3', 'togeojson'], function(WorldMapData, PubSub) {
  var el;
  var mapData;
  var mapid;
  var KMLPath = 'mapsengine.google.com/map/kml?mid=';
  // https://mapsengine.google.com/map/edit?mid=zTpKh93u3nmI.kn5ClQNz9iAk
  var proxyPath = 'http://localhost:1337/?src=';

  function _fetchKML() {
    var proxyUrl = proxyPath + KMLPath + mapData.mapurl.split('mid=')[1];
    //console.log(mapData.mapurl.split('mid=')[1], proxyUrl);
    d3.xml(proxyUrl, function(xml) {
      if (xml) {

        var geoJson = toGeoJSON.kml(xml);
        _drawMap(geoJson);
      }
    });
  }

  function _drawMap(json) {
    console.log(json);
    var width = 380;
    var height = 400;
    el = document.createElement('div');
    el.setAttribute('class', 'svg_test');

    var svg = d3.select(el).append("svg")
      .attr("width", width)
      .attr("height", height);



    var center = (mapData.center !== undefined && mapData.center.split(',').length === 2) ?  mapData.center.split(',').map(function(loc) { return parseFloat(loc); }) :  [-1.4, 51.5];
    var zoom = (mapData.zoomlevel === undefined || isNaN(parseInt(mapData.zoomlevel, 10)) ) ? 4000 : parseInt(mapData.zoomlevel, 10);

    var translate = [width / 2, height / 2];
    if (mapData.offsetx !== undefined && !isNaN(parseInt(mapData.offsetx, 10)) ) {
      translate[0] += parseInt(mapData.offsetx, 10);
    }

    if (mapData.offsety !== undefined && !isNaN(parseInt(mapData.offsety, 10)) ) {
      translate[1] += parseInt(mapData.offsety, 10);
    }

    console.log(center, translate, zoom);

    var projection = d3.geo.mercator()
      .scale(zoom)
      .translate(translate)
      .center(center);

    var path = d3.geo.path().projection(projection);



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



    var markerData = json.features.filter(function(feature) {
      return feature.geometry.type.toLocaleLowerCase() === 'point';
    });

    var markers = svg.append("svg:g")
      .attr("class", "marker_group");

    markers.selectAll("path")
      .data(markerData)
      .enter()
      .append("g")
      .attr("class", "path_group")
      .append("svg:text")
      .attr("text-anchor", "middle")
      .attr("class", "marker_text")
      .attr("id", function(d) { return 'marker-' + d.properties.name; })
      .attr("transform", function(d) { console.log(d, d.geometry.coordinates); return "translate(" + projection(d.geometry.coordinates) + ")"; })
      .text(function(d) { return d.properties.description; });

    markers.selectAll(".path_group")
      .data(markerData)
      .append("path")
      .attr('class', 'marker_path')
      .attr("d", path);

    var world = svg.append("svg:g")
      .attr("class", "world");
    world.selectAll(".country")
      .data(WorldMapData.features)
      .enter().insert("path", ".graticule")
      .attr("class", "country")
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

});
