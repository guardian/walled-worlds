define(['mustache', 'app/models/svgs', 'app/views/svgView', 'app/models/config', 'app/models/data', 'app/utils/utils', 'templates', 'tween', 'PubSub'],
  function(mustache, svgs, SvgView, Config, DataModel, Utils, templates, Tween, PubSub)
{
  return function(data) {
    var el;
    var model = data;
    var ID = data.chapterid;
    var distance = data.length;


    var ANIM_LENGTH = 5*1000;
    var hasAnimated = false;
    var ANIM_DELAY = 250;
    var counterTween;

    var svgView;

    function animate() {
      if (!el || hasAnimated || !svgView) {
        return;
      }

      svgView.anim(ANIM_LENGTH);
      counterTween.start();


      hasAnimated = true;
    }

    function _setupSVG() {
      // TODO: Clean this up

      if (model.map && model.map.length > 0) {
//        svgView = new SvgView(ANIM_LENGTH, ANIM_DELAY);
//        svgView.init(model.map);
//        el.querySelector('.chapter-svg-map').appendChild(svgView.render());
//        console.log(svgView);
        var data = _getAssetData(model.map.trim(), DataModel.get('maps'));

        if (data) {
          svgView = new SvgView(ANIM_LENGTH, ANIM_DELAY);
          svgView.init(model.map.trim(), data);
          PubSub.subscribe('mapRendered', function(msg, data) {
            if (data.id === model.map.trim()) {
              el.querySelector('.chapter-svg-map').appendChild(svgView.render());
            }
          });
        }
      }
    }

    function _setupCounter() {
      var counterElm = el.querySelector('.chapter-map-counter-count');

      counterTween = new TWEEN.Tween( { x: 0} )
        .to( { x: distance }, ANIM_LENGTH)
        .onUpdate( function () {
          counterElm.innerText = this.x.toFixed(2);
        })
        .delay(ANIM_DELAY);
    }


    function _getAssetData(id, data) {
      return data.filter(function(el) {
        return el.assetid.trim() === id;
      })[0];
    }

    function render() {
      if (el) {
        return el;
      }

//      var svg = svgView.render();
//      console.log(svg);

//      if (!svgs.hasOwnProperty(model.map)) {
//        return false;
//      }

//      var svgData = {
//        distance: distance,
//        svg: svgs[ID]
//      };

      el = Utils.buildDOM(mustache.render(templates.chapter_map)).firstChild;
      console.log(Config);
      if (Config.wide) {
        _setupSVG();
        _setupCounter();
      }

      return el;
    }

    return {
      render: render,
      animate: animate
    };
  };
});
