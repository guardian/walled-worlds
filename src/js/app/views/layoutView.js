define(['mustache', 'templates'], function(mustashe, templates) {
  return function(model) {
    this.model = model;
    var el = null;

    function render() {
      var html = mustashe.render({}, templates.structure);
      var tmpElm = document.createElement('div');
      tmpElm.innerHTML = html;
      el =  tmpElm.firstChild;
      return this;
    }

    return {
      render: render
    };
  };
});
