define(['mustache', 'templates', 'app/utils/utils', 'PubSub'], function(mustache, templates, Utils, PubSub) {

  var elm;

  function _remove() {
    elm.parentNode.removeChild(elm);
  }

  function render() {
    PubSub.subscribe('loadSuccess', _remove);

    var html = mustache.render(templates.loading);
    elm = Utils.buildDOM(html).firstChild;
    return elm;
  }

  return {
    render: render
  };
});
