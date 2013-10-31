define(['app/models/svgs'],function(svgData) {
  'use strict';
  return function() {
    function render(ID, el, callback){
      el.classList.add('svg_wall');
      el.innerHTML = svgData[ID];

      callback();
    }

    return  {
      render: render
    };
  };
});