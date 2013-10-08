define(['mustache', 'app/views/map', 'jquery', 'app/models/data', 'templates', 'app/utils/utils'], function(mustache, MapView, $, DataModel, templates, Utils) {
  return function(data) {

    this.$el;
    var el;
    var model = data;
    var mapView = new MapView(model);
    var tabletop = DataModel.tabletop;

    function _buildCopyAsset(id) {
      var data = _getAssetData(id, tabletop.sheets('copy').all());
      return mustache.render('<div class="copy">{{{ content }}}</div>', data);
    }

    function _buildImageAsset(id) {
      var data = _getAssetData(id, tabletop.sheets('images').all());
      return mustache.render(templates.chapter_image, data);
    }

    function _buildVideoAsset(id) {
      var data = _getAssetData(id, tabletop.sheets('video').all());
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
      this.$el = $(mustache.render(templates.chapter, model));
      //console.log($el);

      this.$el.prepend(mapView.render());

      //var target = this.$el.find('.chapter_title').get()[0];
      mapView.animate();
      return this;
    }

    return {
      $el: this.$el,
      render: render
    }
  }

});
