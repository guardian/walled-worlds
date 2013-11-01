  return { 'setup': function(el) {
    require(['app/app'], function(App) {
        App.setup(el);
      });
    }
  };
});
