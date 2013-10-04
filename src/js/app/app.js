define(['mustache', 'templates', 'tabletop', 'app/models/config'], function(mustache, templates, Tabletop, config) {

  var tabletop;

  function setupPage(data) {
//    var view = { 'header': 'Hello world' };
//    var output = mustache.render(templates.structure, view);
//    var elm = document.createElement('div');
//    elm.innerHTML = output;
//    document.querySelector('.test').appendChild(elm);
    buildNavigation(tabletop.sheets('chapters').all());
    buildChapters(tabletop.sheets('chapters').all());
  }

  function buildChapters(chapters) {
    chapters.forEach(buildChapter);
  }

  function buildChapter(chapterData) {
    chapterData.compiledAssets = buildAssets(chapterData.assets);
    var chapterHtml = mustache.render(templates.chapter, chapterData);
    var elm = document.createElement('div');
    elm.innerHTML = chapterHtml;
    document.querySelector('.test').appendChild(elm);
  }

  function buildNavigation(chapterData) {
    var chapterHtml = mustache.render(templates.navigation, {links: chapterData});
    var elm = document.createElement('div');
    elm.innerHTML = chapterHtml;
    document.querySelector('.test').appendChild(elm);
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
    console.log(data);
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
