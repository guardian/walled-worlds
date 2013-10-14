define(['mustache', 'templates', 'app/utils/utils', 'app/views/chapterView', 'app/models/data', 'es5-shim'],
  function(mustache, templates, Utils, ChapterView, DataModel)
  {
    'use strict';

    // TODO: Store elm passed by boot.js
    var el = document.querySelector('.gi-interactive');
    var chaptersWrapper;
    var chaptersViews = [];
    var MIN_WIDTH = 940;

    function setupPage() {
      console.log(el);
      addStyles();

      // Are we on a wide page?

      el.style.margin = 0;

      if (el.offsetWidth >= MIN_WIDTH) {
        el.classList.add('wide');
      }

      // TODO: Replace with Util
      var tmpElm = document.createElement('div');
      tmpElm.innerHTML = templates.structure;
      chaptersWrapper = tmpElm.firstChild;

      el.appendChild(chaptersWrapper);

      buildNavigation();
      buildChapters();
    }

    function addStyles() {
      var styleElm = document.createElement('link');
      styleElm.setAttribute('rel', 'stylesheet');
      styleElm.setAttribute('type', 'text/css');
      styleElm.setAttribute('href', 'main.css');
      document.querySelector('body').appendChild(styleElm);
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


