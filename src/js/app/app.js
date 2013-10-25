define(['mustache', 'templates', 'app/utils/utils', 'app/views/chapterView', 'app/views/navigationView', 'app/views/loadingView', 'app/models/data'],
  function(mustache, templates, Utils, ChapterView, NavigationView, LoadingView, DataModel)
  {
    'use strict';

    var el;
    var assetUrl = '{{ assetUrl }}';
    var chaptersWrapper;
    var chaptersViews = [];
    var MIN_WIDTH = 940;

    function setupPage() {
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

      requestAnimationFrame(_anim);
    }

    function _anim() {
      TWEEN.update();
      requestAnimationFrame(_anim);
    }

    function addStyles() {
      var styleElm = document.createElement('link');
      styleElm.setAttribute('rel', 'stylesheet');
      styleElm.setAttribute('type', 'text/css');
      styleElm.setAttribute('href', assetUrl + 'main.css');
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

    function boot(element) {
      el = element;
      el.appendChild(LoadingView.render());
      addStyles();
      DataModel.fetch(setupPage);
    }

    return {
      init: boot
    };
  });


