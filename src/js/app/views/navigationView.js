define(['templates', 'mustache', 'app/models/config', 'app/utils/utils', 'app/models/data', 'PubSub'],
  function(templates, mustache, Config, Utils, DataModel, PubSub)
{
  var el;
  var chapterNavElms = {};
  var chapterData;
  var activeChapter;
  var height;
  var fixed = false;
  var timeoutID;


  function isFixed() {
    if (!el) {
      return;
    }

    if (el.parentNode.getBoundingClientRect().top < 0) {
      if (!fixed) {
        setNavWidth();
        el.parentNode.classList.add('fixed');
        fixed = true;
      }
    } else if (fixed) {
      el.parentNode.classList.remove('fixed');
      el.removeAttribute('style');
      fixed = false;
    }
  }

  function setNavWidth() {
    var width = el.parentNode.clientWidth;
    el.setAttribute('style', 'width: ' + width + 'px');
  }

  function _activateNavigation(msg, data) {
    chapterNavElms[data.id].classList.add('active');

    if (timeoutID) {
      clearTimeout(timeoutID);
    }

    timeoutID = setTimeout(function() {
      clearTimeout(timeoutID);
      timeoutID = null;
      history.pushState(null, null, "#" + data.id);
    }.bind(this), 900);

    activeChapter = data.id;
  }

  function _deactivateNavigation(msg, data) {
    chapterNavElms[data.id].classList.remove('active');
  }


  function _buildChapterLinks(chapters) {
    var wrapperElm = document.createDocumentFragment();

    chapters.forEach(function(chapter, index) {
      chapter.currentChapterNum = index + 1;
      chapter.totalChapters = chapters.length;
      var el = Utils.buildDOM(mustache.render(templates.navigation_link, chapter)).firstChild;
      wrapperElm.appendChild(el);
      Utils.on(el, 'click', _navigationClickHandler.bind(chapter));
      chapterNavElms[chapter.chapterid] = el;
    });

    return wrapperElm;
  }

  function _navigationClickHandler(event) {
    event.preventDefault ? event.preventDefault() : event.returnValue = false;
    scrollToChapter('#' + this.chapterid);
    Utils.trackEvent('click', 'nav_link');
  }

  function scrollToChapter(chapter) {
    if (/^#[a-z][a-z0-9]+$/gi.test(chapter)) {
      document.querySelector(".chapter" + chapter).scrollIntoView(true);
    }
  }

  function handleTitleClick(event) {
    event.preventDefault ? event.preventDefault() : event.returnValue = false;
    var target = document.querySelector('.chapter');
    target.scrollIntoView(true);
  }

  function render() {
    chapterData = DataModel.get('chapters');

    var html = mustache.render(templates.navigation, {links: chapterData});
    el = Utils.buildDOM(html).firstChild;
    el.querySelector('.nav-links').insertBefore(
      _buildChapterLinks(chapterData),
      el.querySelector('.gi-nav-link-all')
    );

    Utils.on(el.querySelector('.next'), 'click', nextChapter);
    Utils.on(el.querySelector('.previous'), 'click', previousChapter);
    Utils.on(el.querySelector('.gi-header-text'), 'click', handleTitleClick);


    PubSub.subscribe('chapterActive', _activateNavigation);
    PubSub.subscribe('chapterDeactivate', _deactivateNavigation);

    //Utils.on(window, 'scroll', _isFixed);
    //Utils.on(window, 'resize', _setNavWidth);

    return el;
  }

  function nextChapter() {

    chapterData.forEach(function(chapter, index) {
      if (chapter.chapterid === activeChapter &&
        index + 1 < chapterData.length)
      {
        scrollToChapter('#' + chapterData[index + 1].chapterid);
      }
    });
  }

  function previousChapter() {
    chapterData.forEach(function(chapter, index) {
      if (chapter.chapterid === activeChapter &&
        index - 1 >= 0 )
      {
        scrollToChapter('#' + chapterData[index - 1].chapterid);
      }
    });
  }

  function getHeight() {
    return el.clientHeight;
  }

  return {
    scrollToChapter: scrollToChapter,
    getHeight: getHeight,
    render: render,
    setNavWidth: setNavWidth,
    isFixed: isFixed
  };
});

