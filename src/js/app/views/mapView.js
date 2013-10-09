define(['mustache', 'svgs', 'templates', 'tween'], function(mustache, svgs, templates, Tween) {
  return function(data) {
    var elm;
    var ID = data.chapterid;
    var distance = data.length;
    var paths = [];
    var tweens = [];
    var tweenCount = 0;
    var ANIM_LENGTH = 5*1000;
    var totalLength = 0;

    function _nextPathTween() {
      tweenCount += 1;
      if (tweenCount < paths.length) {
        tweens[tweenCount].start();
      }
    }

    function animate() {
      if (!elm) {
        return;
      }

      paths = elm.querySelectorAll('#wall path');

      if (paths.length < 1) {
        return false;
      }


      for (var i = 0; i < paths.length; i++) {
        totalLength += paths[i].getTotalLength();
      }

      tweens = [];
      var pathTime = ANIM_LENGTH / paths.length;
      for (var i = 0; i < paths.length; i++) {;
        paths[i].setAttribute('style', '');
        tweens.push(_setupAnim(paths[i], pathTime));
      }

      tweens[0].start();

      function anim() {
        requestAnimationFrame(anim);
        TWEEN.update();
      }

      anim();
    }

    function _setupAnim(path, pathTime) {
      var length = path.getTotalLength();
      path.style.strokeDasharray = length + ' ' + length;
      path.style.strokeDashoffset = length;
      var time = Math.round((length / totalLength) * ANIM_LENGTH);

      var tween = new TWEEN.Tween( { x: length} )
        .to( { x: 0 }, time)
        .onUpdate( function () {
          path.style.strokeDashoffset = this.x + 'px';
        }).
        onComplete(_nextPathTween);
      return tween;
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

      var counterElm = elm.querySelector('.chapter-map-counter-count');

      var tween = new TWEEN.Tween( { x: 0} )
        .to( { x: distance }, ANIM_LENGTH)
        .onUpdate( function () {
          counterElm.innerText = this.x.toFixed(2);
        });
      tween.start();

      return elm;
    }

    return {
      render: render,
      animate: animate
    };
  };
});
