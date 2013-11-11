define([], function() {

  function waypoint(el, callback) {
    function givenElementInViewport (el) {
      return function () {
        if ( _isElementInViewport(el) ) {

          callback();

        }
      }
    }

    if (window.addEventListener) {
      addEventListener('DOMContentLoaded', givenElementInViewport(el), false);
      addEventListener('load', givenElementInViewport(el), false);
      addEventListener('scroll', givenElementInViewport(el), false);
      addEventListener('resize', givenElementInViewport(el), false);
    } else if (window.attachEvent)  {
      attachEvent('DOMContentLoaded', givenElementInViewport(el));
      attachEvent('load', givenElementInViewport(el));
      attachEvent('scroll', givenElementInViewport(el));
      attachEvent('resize', givenElementInViewport(el));
    }


    function _isElementInViewport(el) {
      var rect = el.getBoundingClientRect();

      return (
        rect.top >= 0 &&
          rect.left >= 0 &&
          rect.bottom <= (window.innerHeight || document. documentElement.clientHeight) && /*or $(window).height() */
          rect.right <= (window.innerWidth || document. documentElement.clientWidth) /*or $(window).width() */
        );
    }
  }

  function buildDOM(htmlStr) {
    var tmpElm = document.createElement('div');
    tmpElm.innerHTML = htmlStr;
    var domFrag = document.createDocumentFragment();
    for (var i = 0; i < tmpElm.children.length; i++) {
      domFrag.appendChild(tmpElm.children[i]);
    }
    return domFrag;
  }

  function on(elm, events, callback) {
    events.split(',').forEach(function(event) {
      if (elm.addEventListener) {
        elm.addEventListener(event.trim(), callback, false);
      } else {
        elm.attachEvent('on' + event.trim(), callback);
      }
    });
  }

  // http://stackoverflow.com/a/11508164
  function _hexToRgb(hex) {
    var bigint = parseInt(hex, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;

    return r + "," + g + "," + b + ",";
  }

  function getGradientImg(width, colour, startPos, opacity) {
    var canvas = document.createElement('canvas');
    if (!canvas.getContext) {
      return generateOverlay();
    }

    var hexColourRegex = /#([a-f]|[A-F]|[0-9]){3}(([a-f]|[A-F]|[0-9]){3})?/g;
    var rgbRegex = /^.+\((.+)\)/;
    var gradWidth = width || 100;
    var gradStartPos =  startPos || 1;
    var gradOpacity = opacity || 1;
    var gradColor = '0, 0, 0,';

    if (colour !== undefined && typeof colour === 'string') {

      if (colour.match(rgbRegex) !== null) {
        gradColor = colour.match(rgbRegex)[1] + ',';
      }


      if (colour.match(hexColourRegex) !== null) {
        var hexCode = colour.match(hexColourRegex)[0].substr(1);
        gradColor = _hexToRgb(hexCode);
      }

    }

    canvas.width = gradWidth;
    canvas.height = gradWidth;
    var ctx = canvas.getContext('2d');

    var linGrad = ctx.createLinearGradient(0, 0, gradWidth, 0);
    linGrad.addColorStop(0, 'rgba(' + gradColor + ' 0)');
    linGrad.addColorStop(gradStartPos, 'rgba(' + gradColor + gradOpacity +')');
    ctx.fillStyle = linGrad;
    ctx.fillRect(0, 0, gradWidth, gradWidth);

    var dataURL = canvas.toDataURL('image/png');

        var img = document.createElement('img');
    img.setAttribute('src', dataURL);
    img.setAttribute('width', gradWidth);
    img.setAttribute('height', gradWidth);
    img.setAttribute('class', 'gradient-image');

    return img;
  }

  function generateOverlay(opacity) {
    var overlayEl = document.createElement('div');
    overlayEl.classList.add('overlay');
    overlayEl.style.opacity = (opacity) ? opacity * 0.8 :  0.8;
    return overlayEl;
  }

  function trackEvent(action, label, value) {
    // ga('send', 'event', 'button', 'click', 'nav buttons', 4);
    __analytics('send', 'event', action, label, value);
  }


  return {
    waypoint: waypoint,
    buildDOM: buildDOM,
    on: on,
    getGradientImg: getGradientImg,
    generateOverlay: generateOverlay,
    trackEvent: trackEvent
  };

});