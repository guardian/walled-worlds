define(['templates', 'mustache', 'app/utils/utils', 'app/models/data'], function(templates, mustache, Utils, DataModel) {
  function render() {
    var chapterData = DataModel.get('chapters');
    var html = mustache.render(templates.navigation, {links: chapterData});
    return Utils.buildDOM(html).firstChild;

  }
  return {
    render: render
  };
});

