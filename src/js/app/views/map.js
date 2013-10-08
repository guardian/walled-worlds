define(['mustache', 'svgs', 'templates', 'jquery', 'tween'], function(mustache, svgs, templates, $, Tween) {
  return function(data) {
    var $elm;
    var ID = data.chapterid;
    var distance = data.length;
    var paths = [];
    var tweens = [];
    var tweenCount = 0;
    var ANIM_LENGTH = 5*1000;

    function _nextPathTween() {
      tweenCount += 1;
      if (tweenCount < paths.length) {
        tweens[tweenCount].start();
      }
    }

    function animate() {
      if (!$elm) {
        return;
      }

      paths = $elm.find('path').get();

      tweens = [];
      var pathTime = ANIM_LENGTH / paths.length;
      paths.forEach(function(path) {
        tweens.push(_setupAnim(path, pathTime));
      });

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

      var tween = new TWEEN.Tween( { x: length} )
        .to( { x: 0 }, pathTime)
        .onUpdate( function () {
          var p = path;
          p.style.strokeDashoffset = this.x + 'px';
        }).
        onComplete(_nextPathTween);

      return tween;
    }

    function render() {
      if ($elm) {
        return $elm;
      }

      if (!svgs.hasOwnProperty(ID)) {
        return false;
      }

      var svgData = {
        distance: distance,
        svg: svgs[ID]
      };

      $elm = $(mustache.render(templates['chapter-map'], svgData));

      var $counter = $elm.find('.chapter-map-counter-count');

      var tween = new TWEEN.Tween( { x: 0} )
        .to( { x: distance }, ANIM_LENGTH)
        .onUpdate( function () {
          $counter.text(this.x.toFixed(2));
        });
      tween.start();


      return $elm;
    }

    return {
      render: render,
      animate: animate
    };
  };
});
