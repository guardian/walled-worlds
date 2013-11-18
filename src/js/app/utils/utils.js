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

  //http://detectmobilebrowsers.com/
  var isMobile = (function () {
    var a = navigator.userAgent || navigator.vendor || window.opera;
    return (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)));
  }());


  var isIOS = (function () {
    return !!navigator.userAgent.match(/(iPad|iPhone|iPod)/i);
  }());

  var isIPad = (function () {
    return !!navigator.userAgent.match(/(iPad)/i);
  }());

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

  // Underscore debounce https://github.com/jashkenas/underscore/blob/master/underscore.js#L701
  function debounce(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  }


  return {
    waypoint: waypoint,
    buildDOM: buildDOM,
    on: on,
    getGradientImg: getGradientImg,
    generateOverlay: generateOverlay,
    trackEvent: trackEvent,
    isMobile: isMobile,
    isIOS: isIOS,
    isIPad: isIPad,
    debounce: debounce
  };

});