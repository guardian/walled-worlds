  return { 'boot': function(el) {
    require(['app/app'], function(App) {
        App.init(el);
      });
    }
  };
});
