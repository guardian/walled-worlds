define(['templates', 'mustache', 'app/utils/utils', 'app/models/data', 'PubSub'],
  function(templates, mustache, Utils, DataModel, PubSub)
{
  var el;
  var chapterNavElms = {};


  function _isFixed() {
    var bounds = el.parentNode.getBoundingClientRect();

    if (bounds.top < 0) {
      if (!el.parentNode.classList.contains('fixed')) {
        _setNavWidth();
        el.parentNode.classList.add('fixed');
      }
    } else {
      el.parentNode.classList.remove('fixed');
      el.removeAttribute('style');
    }
  }

  function _setNavWidth() {
    var width = el.parentNode.clientWidth;
    el.setAttribute('style', 'width: ' + width + 'px');
  }

  function _activateNavigation(msg, data) {
    chapterNavElms[data.id].classList.add('active');
    history.pushState(null, null, data.id);
  }

  function _deactivateNavigation(msg, data) {
    chapterNavElms[data.id].classList.remove('active');
  }


  function _buildChapterLinks(chapters) {
    var wrapperElm = document.createDocumentFragment();
    chapters.forEach(function(chapter) {
      var el = Utils.buildDOM(mustache.render(templates.navigation_link, chapter)).firstChild;
      wrapperElm.appendChild(el);
      el.onclick = _navigationClickHandler;
      chapterNavElms[chapter.chapterid] = el;
    });
    return wrapperElm;
  }

  function _navigationClickHandler(e) {
    e.preventDefault();
    var target;
    target = (e.srcElement.className === "gi-nav-link") ? target = e.srcElement.hash : e.srcElement.parentElement.hash;
    window.scrollTo(0, parseInt(document.querySelector(target).offsetTop, 10) + 10);
  }

  function render() {
    var chapterData = DataModel.get('chapters');
    var html = mustache.render(templates.navigation, {links: chapterData});
    el = Utils.buildDOM(html).firstChild;

    el.querySelector('.gi-nav').insertBefore(
      _buildChapterLinks(chapterData),
      el.querySelector('.gi-nav-link-all')
    );

    PubSub.subscribe('chapterActive', _activateNavigation);
    PubSub.subscribe('chapterDeactivate', _deactivateNavigation);

    Utils.on(window, 'scroll', _isFixed);
    Utils.on(window, 'resize', _setNavWidth);

    return el;
  }

  function getHeight() {
    return el.clientHeight;
  }

  return {
    getHeight: getHeight,
    render: render
  };
});

