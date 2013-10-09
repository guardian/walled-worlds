define(['mustache', 'app/models/svgs', 'templates', 'tween'], function(mustache, svgs, templates, Tween) {
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
    var svgsss = svgs;

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

      var html = mustache.render(templates.chapter_map, svgData);
      var tmpElm = document.createElement('div');
      tmpElm.innerHTML = html;
      elm = tmpElm.firstChild;

      _setupCounter();
      _setupPaths();

      return elm;
    }

    return {
      render: render,
      animate: animate
    };
  };
});
