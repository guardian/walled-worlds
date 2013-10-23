define(['mustache', 'app/models/svgs', 'app/views/svgView', 'app/models/data', 'app/utils/utils', 'templates', 'tween', 'PubSub'],
  function(mustache, svgs, SvgView, DataModel, Utils, templates, Tween, PubSub)
{
  return function(data) {
    var elm;
    var model = data;
    var ID = data.chapterid;
    var distance = data.length;
    var paths = [];
    var tweens = [];
    var tweenCount = 0;
    var ANIM_LENGTH = 5*1000;
    var hasAnimated = false;
    var ANIM_DELAY = 250;
    var counterTween;
    var markers;
    var tickerID;
    var svg;

    var pubSubTokens = {};

    function _nextPathTween() {
      tweenCount += 1;
      if (tweenCount < paths.length) {
        tweens[tweenCount].start();
      } else {
        window.cancelAnimationFrame(tickerID);
      }
    }

    function animate() {
      if (!elm || hasAnimated || paths.length < 1) {
        return;
      }

      tweens[0].delay(ANIM_DELAY).start();
      counterTween.start();

      function anim() {
        tickerID = window.requestAnimationFrame(anim);
        TWEEN.update();
      }
      anim();

      hasAnimated = true;
    }

    function _setupAnim(path, totalLength) {
      var length = path.getTotalLength();
      path.style.strokeDasharray = length + ' ' + length;
      path.style.strokeDashoffset = length;

      var pathTime = Math.round((length / totalLength) * ANIM_LENGTH);

      return new TWEEN.Tween( { x: length} )
        .to( { x: 0 }, pathTime)
        .onUpdate( function () {
          path.style.strokeDashoffset = this.x + 'px';
        })
        .onComplete(_nextPathTween);
    }

    function _setupPaths() {
      paths = elm.querySelectorAll('.svg_wall .wall_path');

      var totalLength = 0;
      for (var i = 0; i < paths.length; i++) {
        totalLength += paths[i].getTotalLength();
      }

      for (var i = 0; i < paths.length; i++) {;
        paths[i].setAttribute('style', '');
        tweens.push(_setupAnim(paths[i], totalLength));
      }
    }

    function _setupCounter() {
      var counterElm = elm.querySelector('.chapter-map-counter-count');

      counterTween = new TWEEN.Tween( { x: 0} )
        .to( { x: distance }, ANIM_LENGTH)
        .onUpdate( function () {
          counterElm.innerText = this.x.toFixed(2);
        })
        .delay(ANIM_DELAY);
    }

    function _setupMarkers() {
      markers = elm.querySelectorAll('.svg_wall .marker_group');
      for (var i = 0; i < markers.length; i++) {

        var markerID = markers[i].id.replace('marker_', '');
        pubSubTokens[markerID] = PubSub.subscribe(markerID, addThing(markers[i]));
      }
    }

    function addThing(elm) {
      return function(msg, data) {
        var el = elm;

        if (data.show) {
          if (-1 === el.getAttribute('class').indexOf('show-marker')) {
            el.setAttribute('class', el.getAttribute('class') + ' show-marker');
          }
        } else {
          if (-1 !== el.getAttribute('class').indexOf('show-marker')) {
            el.setAttribute('class', el.getAttribute('class').replace(' show-marker', ''));
          }
        }
        //PubSub.unsubscribe(pubSubTokens[tiggerID]);
      };
    }

    function _setupSVG() {

      var targetEl = elm.querySelector('.chapter-svg-map');

      // TODO: Clean this up
      if (model.map && model.map.length > 0) {
        var data = _getAssetData(model.map.trim(), DataModel.get('maps'));
        if (data) {
          svg = new SvgView();
          svg.init(model.map.trim(), data);


          PubSub.subscribe('mapRendered', function(msg, data) {

            if (data.id === model.map.trim()) {
              var svgel = svg.render();
              elm.querySelector('.chapter-svg-map').appendChild(svgel);
              _setupPaths();
              _setupMarkers();

            }

          });



          //el.append(svg.render());
        }
      }


      function whenDone() {
        _setupPaths();
        _setupMarkers();
      }
    }


    function _getAssetData(id, data) {
      return data.filter(function(el) {
        return el.assetid.trim() === id;
      })[0];
    }

    function render() {
      if (elm) {
        return elm;
      }

//      var svg = svgView.render();
//      console.log(svg);

      if (!svgs.hasOwnProperty(ID)) {
        return false;
      }

//      var svgData = {
//        distance: distance,
//        svg: svgs[ID]
//      };

      elm = Utils.buildDOM(mustache.render(templates.chapter_map)).firstChild;

      _setupSVG();
      _setupCounter();

      return elm;
    }

    return {
      render: render,
      animate: animate
    };
  };
});
