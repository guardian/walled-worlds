define(['mustache', 'templates', 'tabletop', 'app/models/config', 'app/views/map', 'jquery', 'app/utils/utils', 'app/views/chapter', 'app/models/data'],
  function(mustache, templates, Tabletop, config, MapView, $, Utils, ChapterView, DataModel)
  {

    var tabletop;
    // TODO: Store elm passed by boot.js
    var $el = $('.gi-interactive');
    var $chaptersWrapper;
    var chaptersViews = [];

    function setupPage(data) {
      $chaptersWrapper = $(templates.structure);
      $el.append($chaptersWrapper);

      buildNavigation(DataModel.tabletop.sheets('chapters').all());
      buildChapters(DataModel.tabletop.sheets('chapters').all());
    }

    function buildChapters(chapters) {
      chapters.forEach(function(chapterData) {
        var chapter = new ChapterView(chapterData);
        chaptersViews.push(chapter);
        $chaptersWrapper.append(chapter.render().$el);
      });
    }


    function buildNavigation(chapterData) {
      var html = mustache.render(templates.navigation, {links: chapterData});
      $el.prepend($(html));
    }

    function init() {
      DataModel.fetch(setupPage);
    }

    return {
      init: init
    };
  });


