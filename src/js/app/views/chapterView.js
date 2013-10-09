define(['mustache', 'app/views/mapView', 'templates', 'app/utils/utils', 'app/models/data'],
  function(mustache, MapView, templates, Utils, DataModel)
{
  return function(chapterData) {

    var el = document.createElement('div');
    var model = chapterData;
    var mapView = new MapView(model);
    var mapElm;

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

    function isFixed() {
      var boundingBox = el.getBoundingClientRect();

      if (boundingBox.top < 0) {
        el.classList.add('fixed-background');
        el.style.backgroundPosition = boundingBox.left + 'px 0';
        if (mapElm) {
          mapElm.style.position = 'fixed';
          mapElm.style.left = boundingBox.left + 'px';
          mapView.animate();
        }
      } else {
        el.classList.remove('fixed-background');
        el.setAttribute('style', '');
        if (mapElm) {
          mapElm.setAttribute('style', '');
        }
      }

    }

    function render() {
      model.compiledAssets = _buildAssets(model.assets);
      el.innerHTML = mustache.render(templates.chapter, model);
      el = el.firstChild;
      mapElm = mapView.render();
      if (mapElm) {
        el.appendChild(mapElm);
      }

      return this;
    }

    function getEl() {
      return el;
    }



    window.addEventListener('scroll', isFixed, false);
    window.addEventListener('resize', isFixed, false);

    return {
      getEl: getEl,
      render: render
    };
  };
});
