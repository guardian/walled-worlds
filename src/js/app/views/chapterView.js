define(['mustache', 'app/views/mapView', 'templates', 'app/utils/utils', 'app/models/data'],
  function(mustache, MapView, templates, Utils, DataModel)
{
  return function(chapterData) {

    var el = document.createElement('div');
    var model = chapterData;
    var mapView = new MapView(model);

    function _buildCopyAsset(id) {
      var data = _getAssetData(id, DataModel.get('copy'));
      return mustache.render(templates.chapter_asset_copy, data);
    }

    function _buildImageAsset(id) {
      var data = _getAssetData(id, DataModel.get('images'));
      return mustache.render(templates.chapter_asset_image, data);
    }

    function _buildVideoAsset(id) {
      var data = _getAssetData(id, DataModel.get('video'));
      return mustache.render(templates.chapter_asset_video, data);
    }

    function _buildAssets(assetsIDs) {
      var assetHTML = '';
      var ids = assetsIDs.trim().split(',');

      ids.forEach(function(id) {
        assetHTML += _getAssetContent(id);
      });

      return assetHTML;
    }

    function _getAssetContent(id) {
      var type = id.split('_')[0];
      switch (type) {
        case 'copy':
          return _buildCopyAsset(id);
          break;
        case 'image':
          return _buildImageAsset(id);
          break;
        case 'video':
          return _buildVideoAsset(id);
          break;
      }
    }

    function _getAssetData(id, data) {
        return data.filter(function(el) {
          return el.assetid === id;
        })[0];
      }

    function render() {
      model.compiledAssets = _buildAssets(model.assets);
      el.innerHTML = mustache.render(templates.chapter, model);
      el = el.firstChild;
      var mapElm = mapView.render();
      if (mapElm) {
        el.appendChild(mapElm);
      }

      mapView.animate();
      return this;
    }

    function getEl() {
      return el;
    }

    return {
      getEl: getEl,
      render: render
    };
  };
});
