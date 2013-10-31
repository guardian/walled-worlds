define(['svgView', 'app/models/config', 'PubSub'],
  function(SVGView, Config, PubSub) {
  return function(animLength, animDelay) {
    var el;
    var mapData;
    var mapid;
    var markers;
    var tweenCount = 0;
    var paths = [];
    var tweens = [];
    var pubSubTokens = {};
    var animDuration = animLength || 500;
    var animDeley = animDelay || 250;
    var svgView = new SVGView();

    var shouldAnimate = false;

    function _nextPathTween() {
      tweenCount += 1;
      if (tweenCount < paths.length) {
        tweens[tweenCount].start();
      } else {
        PubSub.publish('animFinished');
      }
    }

    function _setupAnim(path, totalLength) {
      var length = path.getTotalLength();
      path.style.strokeDasharray = length + ' ' + length;
      path.style.strokeDashoffset = length;
      var pathTime = Math.round((length / totalLength) * animDuration);

      return new TWEEN.Tween( { x: length} )
        .to( { x: 0 }, pathTime)
        .onUpdate( function () {
          path.style.strokeDashoffset = this.x + 'px';
        })
        .onComplete(_nextPathTween);
    }

    function _setupPaths() {
      paths = el.querySelectorAll('.svg_wall .wall_path');
      if (paths.length === 0) {
        return;
      }

      var totalLength = 0;
      for (var i = 0; i < paths.length; i++) {
        totalLength += paths[i].getTotalLength();
      }

      for (var i = 0; i < paths.length; i++) {
        paths[i].setAttribute('style', '');
        tweens.push(_setupAnim(paths[i], totalLength));
      }
    }



    function _setupMarkers() {
      markers = el.querySelectorAll('.svg_wall .marker_group');
      for (var i = 0; i < markers.length; i++) {
        var markerID = markers[i].id.replace('marker_', '');
        pubSubTokens[markerID] = PubSub.subscribe(markerID, _triggerMarker.bind(markers[i]));
      }
    }


    function _triggerMarker(msg, data) {
      // Can't use .classList on SVG elements
      if (data.show) {
        if (-1 === this.getAttribute('class').indexOf('show-marker')) {
          this.setAttribute('class', this.getAttribute('class') + ' show-marker');
        }
      } else {
        if (-1 !== this.getAttribute('class').indexOf('show-marker')) {
          this.setAttribute('class', this.getAttribute('class').replace(' show-marker', ''));
        }
      }
    }



    function render() {
      _setupPaths();
      _setupMarkers();

      if (shouldAnimate) {
        anim();
      }

      return el;
    }

    function anim() {
      shouldAnimate = true;
      if (tweens[0]) {
        tweens[0].delay(animDeley).start();
      }
    }

    function init(mapID, data) {
      el = document.createElement('div');
      mapid = mapID;
      svgView.render(mapID, el, function() {
        PubSub.publish('mapRendered', { id: mapid });
      }, data);
    }

    return {
      render: render,
      init: init,
      anim: anim
    };
  };
});
