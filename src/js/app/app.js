define(['mustache', 'templates', 'app/utils/utils', 'app/views/chapterView', 'app/models/data'],
  function(mustache, templates, Utils, ChapterView, DataModel)
  {
    'use strict';

    // TODO: Store elm passed by boot.js
    //var $el = $('.gi-interactive');
    var el = document.querySelector('.gi-interactive');
    var chaptersWrapper;
    var chaptersViews = [];

    function setupPage() {
      var tmpElm = document.createElement('div');
      tmpElm.innerHTML = templates.structure;
      chaptersWrapper = tmpElm.firstChild;
      el.appendChild(chaptersWrapper);

      buildNavigation();
      buildChapters();
    }

    function buildChapters() {
      var chapters = DataModel.get('chapters');
      chapters.forEach(function(chapterData) {
        var chapter = new ChapterView(chapterData);
        chaptersViews.push(chapter);
        chapter.render();
        chaptersWrapper.appendChild(chapter.getEl());
      });
    }

    function buildNavigation() {
      var chapterData = DataModel.get('chapters');
      var html = mustache.render(templates.navigation, {links: chapterData});
      var tempElm = document.createElement('div');
      tempElm.innerHTML = html;
      el.appendChild(tempElm.firstChild);
    }

    function init() {
      DataModel.fetch(setupPage);
    }

    return {
      init: init
    };
  });


