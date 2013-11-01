define(['mustache', 'templates', 'app/models/config', 'app/utils/utils', 'app/views/chapterView', 'app/views/navigationView', 'app/views/loadingView', 'app/models/data', 'es5-shim'],
  function(mustache, templates, Config, Utils, ChapterView, NavigationView, LoadingView, DataModel)
  {
    'use strict';

    var el;
    var assetUrl = '{{ versionedProjectPath }}';
    var chaptersWrapper;
    var chaptersViews = [];
    var MIN_WIDTH = 940;

    function setupPage() {
      // Are we on a wide page?
      // <figure> elm has lots of margin which causes issues when calc width.
      el.style.margin = 0;

      if (el.offsetWidth >= MIN_WIDTH) {
        el.classList.add('wide');
        Config.wide = true;
      } else {
        el.classList.add('responsive');
        Config.wide = false;
      }

      el.removeAttribute('style');
      el.appendChild(NavigationView.render());

      chaptersWrapper = Utils.buildDOM(templates.structure).firstChild;
      el.appendChild(chaptersWrapper);

      buildChapters();
      requestAnimationFrame(_anim);

      if (window.location.hash) {
        NavigationView.scrollToChapter(window.location.hash);
      }
    }

    function _anim() {
      TWEEN.update();
      requestAnimationFrame(_anim);
    }

    function addStyles() {
      var styleElm = document.createElement('link');
      styleElm.setAttribute('rel', 'stylesheet');
      styleElm.setAttribute('type', 'text/css');
      styleElm.setAttribute('href', assetUrl + '/main.css');
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

    function setup(element) {
      el = element;
      el.appendChild(LoadingView.render());
      addStyles();
      DataModel.fetch(setupPage);
    }

    return {
      setup: setup
    };
  });


