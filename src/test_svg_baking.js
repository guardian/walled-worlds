var d3 = require('d3');
var Tabletop = require('tabletop');
var http = require('http');
var DOMParser = require('xmldom').DOMParser;
var jsdom = require("jsdom").jsdom;

// Example: https://mapsengine.google.com/map/edit?mid=zTpKh93u3nmI.kn5ClQNz9iAk
var KMLPath = 'mapsengine.google.com/map/kml?mid=';
var proxyPath = 'http://ec2-54-228-9-201.eu-west-1.compute.amazonaws.com:1337/?src=';

var xml = '';

function fetchMapData() {
  var tabletop = Tabletop.init( {
    key: '0AjNAJ9Njg5YTdGtEZVdreHpBN3ZFOFJVVDdLUXhEcmc',
    callback: _successFetch,
    simpleSheet: false
  });

}

function _fetchKML(mapUrl) {
  var mapURL = 'https://mapsengine.google.com/map/edit?mid=zPmQMtXXj4HE.kXViO5c9pstA';
  var proxyUrl = proxyPath + KMLPath + mapURL;
  var path = '/map/kml?mid=' + mapURL.split('mid=')[1];


  var options = {
    host: 'mapsengine.google.com',
    port: 80,
    path: path
  };

  http.get(options, function(res) {
    console.log("Got response: " + res.statusCode);
    res.on("data", function(chunk) {
      //console.log("BODY: " + chunk);
      xml += chunk.toString();
      //parseKML(chunk);
    });

    res.on('end',parseKML)
  }).on('error', function(e) {
      console.log("Got error: " + e.message);
    });

}

function _successFetch(data) {
  data.maps.elements.forEach(function(map) {
    //console.log(map);
  });

  _fetchKML(data.maps.elements[0].mapurl);
}


function parseKML() {
  var doc = new DOMParser().parseFromString(xml);
  var geoJson = toGeoJSON.kml(doc);
  _drawMap(geoJson);
}




function _drawMap(json) {
  var WIDTH = 380;
  var HEIGHT = 800;
  var document = jsdom("<html><head></head><body>hello world</body></html>");

  var markerPath = "M77 208 C -10 130 -30 0 77 1 C 184 0 164 130 77 208 Z M 77 30 a 40 40 0 1 0 0.00001 0 Z";

  var el = document.createElement('div');
  //el.classList.add('svg_wall');

  var svg = d3.select(el).append("svg")
    .attr("width", WIDTH)
    .attr("height", HEIGHT);

  var center = [-1.4, 51];

  var zoom = 4000;


  var translate = [WIDTH / 2, HEIGHT / 2];

  // Ref: https://github.com/mbostock/d3/wiki/Geo-Projections
  var projectionType = 'equirectangular';


  var projection = d3.geo[projectionType]()
    .scale(zoom)
    .translate(translate)
    .center(center);

  var path = d3.geo.path().projection(projection);

  // Add walls
  var wallData = json.features.filter(function(feature) {
    console.log(feature);
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
    .attr("class", "label_text")
    .attr("id", function(d) { return 'label-' + d.properties.name; })
    .attr("transform", function(d) { return "translate(" + projection(d.geometry.coordinates) + ")"; })
    .text(function(d) { return d.properties.name; });


  // Add markers
  var markerData = json.features.filter(function(feature) {
    return feature.properties.folder.toLowerCase() === 'markers';
  });

  console.log(markerData);

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
    .text(function(d) {if (d.properties.name.substring(0,4) !== "copy") {return d.properties.name;} });

  markers.selectAll(".marker_group")
    .data(markerData)
    .append("path")
    .attr('class', 'marker_path')
    .attr('transform', function(d) {var x = projection(d.geometry.coordinates)[0] - 16; var y = projection(d.geometry.coordinates)[1] - 33; return "translate(" + x + "," + y + ") scale(0.15)";})
    .attr("d", function(d) {if (d.properties.name.substring(0,4) == "copy") {return markerPath;} });


  console.log(el.innerHTML);
}


fetchMapData();





// HACK. Store modified npm togeojson inline
toGeoJSON = (function() {
  'use strict';

  var removeSpace = (/\s*/g),
    trimSpace = (/^\s*|\s*$/g),
    splitSpace = (/\s+/);
  // generate a short, numeric hash of a string
  function okhash(x) {
    if (!x || !x.length) return 0;
    for (var i = 0, h = 0; i < x.length; i++) {
      h = ((h << 5) - h) + x.charCodeAt(i) | 0;
    } return h;
  }
  // all Y children of X
  function get(x, y) { return x.getElementsByTagName(y); }
  function attr(x, y) { return x.getAttribute(y); }
  function attrf(x, y) { return parseFloat(attr(x, y)); }
  // one Y child of X, if any, otherwise null
  function get1(x, y) { var n = get(x, y); return n.length ? n[0] : null; }
  // https://developer.mozilla.org/en-US/docs/Web/API/Node.normalize
  function norm(el) { if (el.normalize) { el.normalize(); } return el; }
  // cast array x into numbers
  function numarray(x) {
    for (var j = 0, o = []; j < x.length; j++) o[j] = parseFloat(x[j]);
    return o;
  }
  function clean(x) {
    var o = {};
    for (var i in x) if (x[i]) o[i] = x[i];
    return o;
  }
  // get the content of a text node, if any
  function nodeVal(x) { if (x) {norm(x);} return x && x.firstChild && x.firstChild.nodeValue; }
  // get one coordinate from a coordinate array, if any
  function coord1(v) { return numarray(v.replace(removeSpace, '').split(',')); }
  // get all coordinates from a coordinate array as [[],[]]
  function coord(v) {
    var coords = v.replace(trimSpace, '').split(splitSpace),
      o = [];
    for (var i = 0; i < coords.length; i++) {
      o.push(coord1(coords[i]));
    }
    return o;
  }
  function coordPair(x) { return [attrf(x, 'lon'), attrf(x, 'lat')]; }

  // create a new feature collection parent object
  function fc() {
    return {
      type: 'FeatureCollection',
      features: []
    };
  }

  var serializer;
  if (typeof XMLSerializer !== 'undefined') {
    serializer = new XMLSerializer();
  } else if (typeof require !== 'undefined') {
    serializer = new (require('xmldom').XMLSerializer)();
  }
  function xml2str(str) { return serializer.serializeToString(str); }

  var t = {
    kml: function(doc, o) {
      o = o || {};

      var gj = fc(),
      // styleindex keeps track of hashed styles in order to match features
        styleIndex = {},
      // atomic geospatial types supported by KML - MultiGeometry is
      // handled separately
        geotypes = ['Polygon', 'LineString', 'Point', 'Track'],
      // all root placemarks in the file
        placemarks = get(doc, 'Placemark'),
        styles = get(doc, 'Style');

      for (var k = 0; k < styles.length; k++) {
        styleIndex['#' + attr(styles[k], 'id')] = okhash(xml2str(styles[k])).toString(16);
      }
      for (var j = 0; j < placemarks.length; j++) {
        gj.features = gj.features.concat(getPlacemark(placemarks[j]));
      }
      function gxCoord(v) { return numarray(v.split(' ')); }
      function gxCoords(root) {
        var elems = get(root, 'coord', 'gx'), coords = [];
        for (var i = 0; i < elems.length; i++) coords.push(gxCoord(nodeVal(elems[i])));
        return coords;
      }
      function getGeometry(root) {
        var geomNode, geomNodes, i, j, k, geoms = [];
        if (get1(root, 'MultiGeometry')) return getGeometry(get1(root, 'MultiGeometry'));
        if (get1(root, 'MultiTrack')) return getGeometry(get1(root, 'MultiTrack'));
        for (i = 0; i < geotypes.length; i++) {
          geomNodes = get(root, geotypes[i]);
          if (geomNodes) {
            for (j = 0; j < geomNodes.length; j++) {
              geomNode = geomNodes[j];
              if (geotypes[i] == 'Point') {
                geoms.push({
                  type: 'Point',
                  coordinates: coord1(nodeVal(get1(geomNode, 'coordinates')))
                });
              } else if (geotypes[i] == 'LineString') {
                geoms.push({
                  type: 'LineString',
                  coordinates: coord(nodeVal(get1(geomNode, 'coordinates')))
                });
              } else if (geotypes[i] == 'Polygon') {
                var rings = get(geomNode, 'LinearRing'),
                  coords = [];
                for (k = 0; k < rings.length; k++) {
                  coords.push(coord(nodeVal(get1(rings[k], 'coordinates'))));
                }
                geoms.push({
                  type: 'Polygon',
                  coordinates: coords
                });
              } else if (geotypes[i] == 'Track') {
                geoms.push({
                  type: 'LineString',
                  coordinates: gxCoords(geomNode)
                });
              }
            }
          }
        }
        return geoms;
      }
      function getPlacemark(root) {
        var geoms = getGeometry(root), i, properties = {},
          name = nodeVal(get1(root, 'name')),
          styleUrl = nodeVal(get1(root, 'styleUrl')),
          description = nodeVal(get1(root, 'description')),
          extendedData = get1(root, 'ExtendedData');

        if (!geoms.length) return [];

        if (name) properties.name = name;
        if (styleUrl && styleIndex[styleUrl]) {
          properties.styleUrl = styleUrl;
          properties.styleHash = styleIndex[styleUrl];
        }
        if (description) properties.description = description;
        if (extendedData) {
          var datas = get(extendedData, 'Data'),
            simpleDatas = get(extendedData, 'SimpleData');

          for (i = 0; i < datas.length; i++) {
            properties[datas[i].getAttribute('name')] = nodeVal(get1(datas[i], 'value'));
          }
          for (i = 0; i < simpleDatas.length; i++) {
            properties[simpleDatas[i].getAttribute('name')] = nodeVal(simpleDatas[i]);
          }
        }
        if (root.parentNode && root.parentNode.getElementsByTagName('name').length > 0) {
          properties.folder = root.parentNode.getElementsByTagName('name')[0].textContent;
        }
        return [{
          type: 'Feature',
          geometry: (geoms.length === 1) ? geoms[0] : {
            type: 'GeometryCollection',
            geometries: geoms
          },
          properties: properties
        }];
      }
      return gj;
    },
    gpx: function(doc, o) {
      var i,
        tracks = get(doc, 'trk'),
        routes = get(doc, 'rte'),
        waypoints = get(doc, 'wpt'),
      // a feature collection
        gj = fc();
      for (i = 0; i < tracks.length; i++) {
        gj.features.push(getLinestring(tracks[i], 'trkpt'));
      }
      for (i = 0; i < routes.length; i++) {
        gj.features.push(getLinestring(routes[i], 'rtept'));
      }
      for (i = 0; i < waypoints.length; i++) {
        gj.features.push(getPoint(waypoints[i]));
      }
      function getLinestring(node, pointname) {
        var j, pts = get(node, pointname), line = [];
        for (j = 0; j < pts.length; j++) {
          line.push(coordPair(pts[j]));
        }
        console.log(node);
        return {
          type: 'Feature',
          properties: getProperties(node),
          geometry: {
            type: 'LineString',
            coordinates: line
          }
        };
      }
      function getPoint(node) {
        console.log(node);
        var prop = getProperties(node);
        prop.ele = nodeVal(get1(node, 'ele'));
        prop.sym = nodeVal(get1(node, 'sym'));
        return {
          type: 'Feature',
          properties: prop,
          geometry: {
            type: 'Point',
            coordinates: coordPair(node)
          }
        };
      }
      function getProperties(node) {
        var meta = ['name', 'desc', 'author', 'copyright', 'link',
            'time', 'keywords'],
          prop = {},
          k;
        for (k = 0; k < meta.length; k++) {
          prop[meta[k]] = nodeVal(get1(node, meta[k]));
        }
        return clean(prop);
      }
      return gj;
    }
  };
  return t;
})();

