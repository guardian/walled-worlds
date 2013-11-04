define([], function() {
  'use strict';

  return {
    /**
     *
     * @param el        : The Element of the interactive that is being progressively enhanced.
     * @param context   : The DOM context this module must work within.
     * @param config    : The configuration object for this page.
     *
     **/
    boot: function (el, context, config) {
      var cfg = {
        context: 'interactive',
        baseUrl: '{{ versionedProjectPath }}'
      };

      if ( typeof require() === 'function' ) {
        var req2 = require.config(cfg);
        req2(['main'], function(Main) {
          Main.setup(el);
        });
      } else {
        // curl, i.e. next-gen
        require(cfg, ['main']).then(function(Main) {
          Main.setup(el);
        });
      }
    }
  };

});
