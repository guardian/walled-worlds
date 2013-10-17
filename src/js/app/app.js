define(['mustache', 'templates', 'app/utils/utils', 'app/views/chapterView', 'app/views/navigationView', 'app/models/data'],
  function(mustache, templates, Utils, ChapterView, NavigationView, DataModel)
  {
    'use strict';

    // TODO: Store elm passed by boot.js
    var el = document.querySelector('.gi-interactive');
    var chaptersWrapper;
    var chaptersViews = [];
    var MIN_WIDTH = 940;

    function setupPage() {
      addStyles();

      // Are we on a wide page?
      // <figure> elm has lots of margin which causes issues when calc width.
      el.style.margin = 0;
      if (el.offsetWidth >= MIN_WIDTH) {
        el.classList.add('wide');
      }

      el.appendChild(NavigationView.render());

      chaptersWrapper = Utils.buildDOM(templates.structure).firstChild;
      el.appendChild(chaptersWrapper);

      buildChapters();
    }

    function addStyles() {
      var styleElm = document.createElement('link');
      styleElm.setAttribute('rel', 'stylesheet');
      styleElm.setAttribute('type', 'text/css');
      styleElm.setAttribute('href', 'main.css');
      document.querySelector('head').appendChild(styleElm);
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

    function init() {
      DataModel.fetch(setupPage);
    }

    return {
      init: init
    };
  });


