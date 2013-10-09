define(['tabletop', 'app/models/config'], function(Tabletop, Config) {
  var data = 'bob';
  var callback;
  this.tabletop = null;

  function fetch(cb) {
    callback = cb;

    this.tabletop = Tabletop.init( {
      key: Config.google_spreadsheet_key,
      callback: _successFetch.bind(this),
      simpleSheet: false
    });
  }

  function _successFetch(response) {
    this.data = response;
    callback();
  }

  function get(attribute) {
    return this.tabletop.sheets(attribute).all();
  }

  return {
    fetch: fetch,
    data: data,
    get: get
  };
});
