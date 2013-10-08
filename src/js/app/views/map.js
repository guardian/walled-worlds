define(['mustache', 'svgs', 'templates', 'jquery', 'tween'], function(mustache, svgs, templates, $, Tween) {
  return function(data) {
    var $elm;
    var ID = data.chapterid;
    var distance = data.length;
    var paths = [];
    var ANIM_LENGTH = 3*1000;

    function animate() {
      if (paths.length === 0) {
        return;
      }

      console.log();

      paths.forEach(function(path) {
        var tween = _setupAnim(path);
        tween.start();
      });



//
//      var path = $elm.find('path')[0];;
//      var length = path.getTotalLength();
//      path.style.transition = path.style.WebkitTransition =
//        'none';
//      path.style.strokeDasharray = length + ' ' + length;
//      path.style.strokeDashoffset = length;
//      path.getBoundingClientRect();
//      path.style.transition = path.style.WebkitTransition =
//        'stroke-dashoffset 4s ease-in-out';
//      path.style.strokeDashoffset = '0';
    }

    function _setupAnim(path) {
      var length = path.getTotalLength();

      var tween = new TWEEN.Tween( { x: length} )
        .to( { x: 0 }, ANIM_LENGTH )
        .onUpdate( function () {
          path.style.strokeDashoffset = this.x + 'px';
        }).
        onComplete(function(){
          //cancelAnimationFrame(request);
        })
        .delay(500);

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

      paths = $(svgData.svg).find('path').get();

      $elm = $(mustache.render(templates['chapter-map'], svgData));
      return $elm;
    }

    return {
      render: render,
      animate: animate
    };
  };
});
