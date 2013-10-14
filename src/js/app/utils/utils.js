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

  function on(elm, event, callback) {
    if (elm.addEventListener) {
      elm.addEventListener(event, callback, false);
    } else {
      elm.attachEvent('on' + event, callback);
    }
  }

  return {
    waypoint: waypoint,
    buildDOM: buildDOM,
    on: on
  };

});