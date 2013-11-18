define(['mustache', 'templates', 'app/models/config', 'app/utils/utils', 'app/views/chapterView', 'app/views/navigationView', 'app/views/loadingView', 'app/views/analyticsView', 'app/models/data', 'es5-shim'],
  function(mustache, templates, Config, Utils, ChapterView, NavigationView, LoadingView, analyticsView, DataModel)
  {
    'use strict';

    var el;
    var assetUrl = '{{ versionedProjectPath }}';
    var chaptersWrapper;
    var chaptersViews = [];
    var MIN_WIDTH = 835;
    var ticking = false;

    function setupPage() {
      // Are we on a wide page?
      // <figure> elm has lots of margin which causes issues when calc width.
      el.style.margin = 0;

      makeWideScreen();
      Config.width = el.offsetWidth;
      Config.top = el.getBoundingClientRect().top;

      if (el.offsetWidth >= MIN_WIDTH) {
        el.classList.add('wide');
        Config.wide = true;
      } else {
        el.classList.add('responsive');
        Config.wide = false;
      }

      //el.removeAttribute('style');

      el.appendChild(NavigationView.render());
      chaptersWrapper = Utils.buildDOM(templates.structure).firstChild;
      el.appendChild(chaptersWrapper);

      buildChapters();

      el.appendChild(analyticsView.render().el);


      // TODO: replace with content ready event
      setTimeout(function() {
        if (window.location.hash) {
          NavigationView.scrollToChapter(location.hash);
          onScroll();

        }
        onResize();
      }, 400);
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

    function onScroll() {
      requestTick();
    }

    function requestTick() {
      if(!ticking) {
        requestAnimationFrame(updateChapters);
        ticking = true;
      }
    }

    function updateChapters() {
      Config.scrollY = window.scrollY;

      chaptersViews.forEach(function( chapter ){
        chapter.checkIfActive();
      });

      NavigationView.isFixed();

      ticking = false;
    }

    function onResize() {

      makeWideScreen();

      if (el.offsetWidth >= MIN_WIDTH) {
        el.classList.add('wide');
        el.classList.remove('responsive');
        Config.wide = true;
      } else {
        el.classList.remove('wide');
        el.classList.add('responsive');
        Config.wide = false;
      }

      chaptersViews.forEach(function(chapter) {
        chapter.updateView();
      });

      // Fix for when responsive wiggling class isn't removed
      if (!Utils.isMobile) {
        var chapters = document.querySelectorAll('.gi-chapters .chapter');
        for (var i = 0; i < chapters.length; i++) {
          chapters[i].classList.remove('fixed-background');
        }
      }

      onScroll();
    }

    function makeWideScreen() {
      if (document.body.clientWidth < 940) {
        el.style.marginLeft = (el.parentElement.getBoundingClientRect().left * -1) + 'px';
        el.style.marginRight = ((document.body.clientWidth -el.parentElement.getBoundingClientRect().right) * -1) + 'px';
        el.style.width = 'auto';

        chaptersViews.forEach(function(chapter) {
          chapter.getEl().querySelector('.chapter_copy').style.width = '';
        });


      } else {
        //el.style.margin = '0 auto';
        el.removeAttribute('style');

        chaptersViews.forEach(function(chapter) {
          chapter.getEl().querySelector('.chapter_copy').style.width = '500px';
        });
      }
    }



    function setup(element) {
      el = element;
      el.appendChild(LoadingView.render());
      addStyles();
      DataModel.fetch(setupPage);
      Utils.on(window, 'scroll', onScroll);
      Utils.on(window, 'resize', onResize);
      Utils.on(window, 'orientationchange', onResize);
    }

    return {
      setup: setup
    };
  });


