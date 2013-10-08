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

    console.log(tabletop);
  }

  function _successFetch(response) {
    console.log(this.tabletop);
    this.data = response;
    callback();
  }

  return {
    fetch: fetch,
    data: data,
    tabletop: this.tabletop
  };

});
