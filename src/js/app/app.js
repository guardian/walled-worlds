define(['mustache', 'templates', 'tabletop', 'app/models/config', 'app/views/map', 'jquery'], function(mustache, templates, Tabletop, config, MapView, $) {

  var tabletop;
  // TODO: Store elm passed by boot.js
  var $el = $('.gi-interactive');
  var $chaptersWrapper;

  function setupPage(data) {
    $chaptersWrapper = $(templates.structure);
    $el.append($chaptersWrapper);

    buildNavigation(tabletop.sheets('chapters').all());
    buildChapters(tabletop.sheets('chapters').all());
  }

  function buildChapters(chapters) {
    chapters.forEach(buildChapter);
  }

  function buildChapter(chapterData) {
    chapterData.compiledAssets = buildAssets(chapterData.assets);
    var $chapter = $(mustache.render(templates.chapter, chapterData));

    var mapView = new MapView(chapterData);
    $chapter.prepend(mapView.render());
    $chaptersWrapper.append($chapter);

    setTimeout(function() { mapView.animate(); }, 300);
  }

  function buildNavigation(chapterData) {
    var html = mustache.render(templates.navigation, {links: chapterData});
    $el.prepend($(html));
  }

  function getAssetData(id, data) {
    return data.filter(function(el) {
      return el.assetid === id;
    })[0];
  }

  function buildCopyAsset(id) {
    var data = getAssetData(id, tabletop.sheets('copy').all());
    return mustache.render('<div class="copy">{{{ content }}}</div>', data);
  }

  function buildImageAsset(id) {
    var data = getAssetData(id, tabletop.sheets('images').all());
    return mustache.render(templates.chapter_image, data);
  }

  function buildVideoAsset(id) {
    var data = getAssetData(id, tabletop.sheets('video').all());
    return mustache.render(templates.chapter_asset_video, data);
  }

  function buildAssets(assetsIDs) {
    var assetHTML = '';
    var ids = assetsIDs.trim().split(',');

    ids.forEach(function(id) {
      assetHTML += getAssetContent(id);
    });

    return assetHTML;
  }

  function getAssetContent(id) {
    var type = id.split('_')[0];
    switch (type) {
      case 'copy':
        return buildCopyAsset(id);
        break;
      case 'image':
        return buildImageAsset(id);
        break;
      case 'video':
        return buildVideoAsset(id);
        break;
    }
  }

  function init() {
    tabletop = Tabletop.init( {
      key: config.google_spreadsheet_key,
      callback: setupPage,
      simpleSheet: false
    });
  }

  return {
    init: init
  };
});
