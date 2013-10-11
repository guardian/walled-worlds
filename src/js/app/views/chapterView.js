define(['mustache', 'app/views/mapView', 'templates', 'app/utils/utils', 'app/models/data', 'PubSub'],
  function(mustache, MapView, templates, Utils, DataModel, PubSub)
{
  return function(chapterData) {

    var el = document.createElement('div');
    var model = chapterData;
    var mapView = new MapView(model);
    var mapElm;

    function _buildCopyAsset(id) {
      var data = _getAssetData(id, DataModel.get('copy'));
      var html = mustache.render(templates.chapter_asset_copy, data);
      return Utils.buildDOM(html);
    }

    function _buildImageAsset(id) {
      var data = _getAssetData(id, DataModel.get('images'));



      var html = mustache.render(templates.chapter_asset_image, data);
      var domFrag = Utils.buildDOM(html);

      if (data.hasOwnProperty('marker') && data.marker === 'TRUE') {
        var bob = domFrag.firstChild;
        _addWaypoint(bob, id);

      }

      return domFrag;
    }

    function _addWaypoint(el,ID) {
      window.addEventListener('scroll', function() {
        var elPos = el.getBoundingClientRect();

        if (elPos.bottom < 0 || elPos.top > window.innerHeight) {
          return;
        }

        if (elPos.top - (window.innerHeight/2) < 0) {
          PubSub.publish(ID, { id: ID, show: true });
        }

        if (elPos.top - (window.innerHeight/2) > 0) {
          PubSub.publish(ID, { id: ID, show: false });
        }

      });
    }


    function addMarker(markerID) {

//      window.addEventListener('scroll', function() {
//        var selector = '#' + markerID;
//        var elm = document.querySelector(selector);
//        if ((elm.getBoundingClientRect().top < 0)) {
//
//        }
//      })
    }

    function _buildVideoAsset(id) {
      var data = _getAssetData(id, DataModel.get('video'));
      var html = mustache.render(templates.chapter_asset_video, data);
      return Utils.buildDOM(html);
    }

    function _buildAssets() {
      var ids = model.assets.trim().split(',');
      var domFrag = document.createDocumentFragment();

      ids.forEach(function(id) {
        var assetElm = _getAssetContent(id);
        if (assetElm) {
          domFrag.appendChild(assetElm);
        }
      });

      var assetContainer = el.querySelector('.chapter_copy');
      assetContainer.appendChild(domFrag);
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

    function isInView(elm) {
      return (elm.getBoundingClientRect().top < 0);
    }

    function _addMap() {
      mapElm = mapView.render();
      if (mapElm) {
        el.appendChild(mapElm);
      }
    }

    function render() {
      el = Utils.buildDOM(mustache.render(templates.chapter, model)).firstChild;
      _buildAssets();
      _addMap();
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
