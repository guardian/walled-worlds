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
    var continueAnim = true;
    var requestAnimFrameId;
    var counterTween;
    var svgView;

    function animate() {
      if (!el || hasAnimated || !svgView) {
        return;
      }

      svgView.anim(ANIM_LENGTH);
      counterTween.start();
      hasAnimated = true;
      requestAnimationFrame(_tick);
    }

    function _tick() {
      if (continueAnim) {
        TWEEN.update();
        requestAnimFrameId = requestAnimationFrame(_tick);
      } else {
        cancelAnimationFrame(requestAnimFrameId);
      }
    }

    function _setupSVG() {
      if (model.map && model.map.length > 0) {
        data = _getAssetData(model.map.trim(), DataModel.get('maps'));
        if (!data) { return; }

        if (Modernizr.svg) {
          svgView = new SvgView(ANIM_LENGTH, ANIM_DELAY);

          if (!Config.wide && data.hasOwnProperty('height') && !isNaN(data.height)) {
            el.style.height = data.height + 'px';
          }

          PubSub.subscribe('mapRendered', function(msg, data) {
            if (data.id === model.map.trim()) {
              el.querySelector('.chapter-svg-map').appendChild(svgView.render());
            }
          });

          svgView.init(model.map.trim(), data);
        } else {
          var img = document.createElement('img');
          img.setAttribute('src', Config.assetPath +  '/imgs/' + data.assetid +'.png');
          el.querySelector('.chapter-svg-map').appendChild(img);
        }

      }
    }

    function _setupCounter() {
      var counterElm = el.querySelector('.chapter-map-counter-count');

      if (!Modernizr.svg) {
        counterElm.innerText = distance;
        return;
      }

      counterTween = new TWEEN.Tween( { x: 0 } )
        .to( { x: distance }, ANIM_LENGTH)
        .onUpdate( function () {
          counterElm.innerText = parseInt(this.x, 10);
        })
        .onComplete(function() {
          continueAnim = false;
        }.bind(this))
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

      el = Utils.buildDOM(mustache.render(templates.chapter_map)).firstChild;
      _setupSVG();
      _setupCounter();

      return el;
    }

    return {
      render: render,
      animate: animate
    };
  };
});
