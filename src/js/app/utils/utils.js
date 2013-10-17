define([], function() {

  function waypoint(el, callback) {
    function givenElementInViewport (el) {
      return function () {
        console.log(_isElementInViewport(el));
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

  function getGradientImg(width, colour, startPos, opacity) {
    var rgbRegex = /^.+\((.+)\)/;
    var gradWidth = width || 100;
    var gradStartPos =  startPos || 1;
    var gradOpacity = opacity || 1;
    var gradColor = '0, 0, 0,';
    if (colour && typeof colour === 'string' && colour.match(rgbRegex)[1]) {
      gradColor = colour.match(rgbRegex)[1] + ',';
    }

    var canvas = document.createElement('canvas');
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


  return {
    waypoint: waypoint,
    buildDOM: buildDOM,
    on: on,
    getGradientImg: getGradientImg
  };

});