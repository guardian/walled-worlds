define([], function() {
  'use strict';

  return {
    /**
     *
     * @param el        : The Element of the interactive that is being progressively enhanced.
     * @param context   : The DOM context this module must work within.
     * @param config    : The configuration object for this page.
     * @param mediator  : The event system (publish/subscribe) for this page.
     *
     **/
    boot: function (el, context, config, mediator) {
      var cfg = {
        context: 'interactive',
        baseUrl: '<%= projectUrl %><%= versionDir %>'
      };

      if ( typeof require() === 'function' ) {
        var req2 = require.config(cfg);
        req2(['js/game'], function(Game) {
          Game.setup(el);
        });
      } else {
        // curl, i.e. next-gen
        require(cfg, ['main']).then(function(Main) {
          Main.setup(el);
        });
      }
    }
  }
});