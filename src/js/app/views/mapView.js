define(['mustache', 'app/models/svgs', 'app/utils/utils', 'templates', 'tween', 'PubSub'],
  function(mustache, svgs, Utils, templates, Tween, PubSub)
{
  return function(data) {
    var elm;
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

    var pubSubTokens = {};

    function _nextPathTween() {
      tweenCount += 1;
      if (tweenCount < paths.length) {
        tweens[tweenCount].start();
      }
    }

    function animate() {
      if (!elm || hasAnimated || paths.length < 1) {
        return;
      }

      tweens[0].delay(ANIM_DELAY).start();
      counterTween.start();

      function anim() {
        requestAnimationFrame(anim);
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
      paths = elm.querySelectorAll('#wall path');

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
      markers = elm.querySelectorAll('.marker');
      for (var i = 0; i < markers.length; i++) {
        markers[i].style.opacity = 0.3;
        var markerID = markers[i].id.replace('marker_', '');
        pubSubTokens[markerID] = PubSub.subscribe(markerID, addThing(markers[i]));
      }
    }

    function addThing(elm) {
      return function(tiggerID) {

        var el = elm;
        console.log(el, tiggerID, pubSubTokens);

        el.style.opacity = 1;
        PubSub.unsubscribe(pubSubTokens[tiggerID]);

      };
    }

    function render() {
      if (elm) {
        return elm;
      }

      if (!svgs.hasOwnProperty(ID)) {
        return false;
      }

      var svgData = {
        distance: distance,
        svg: svgs[ID]
      };

      elm = Utils.buildDOM(mustache.render(templates.chapter_map, svgData)).firstChild;

      _setupCounter();
      _setupPaths();
      _setupMarkers();

      return elm;
    }

    return {
      render: render,
      animate: animate
    };
  };
});
