define(['app/models/config', 'mustache'], function(Config) {
 'use strict';
 return {

  el: document.createDocumentFragment(),
  gaNamespace: '__analytics',

  handleLoadEvent: function() {
    __analytics('create', Config.google_analytics_uid);
    __analytics('send', 'pageview');
  },

  setupGoogleAnalytics: function() {
    window.GoogleAnalyticsObject = this.gaNamespace;
    window[this.gaNamespace] = function() {
      window[this.gaNamespace].q = [].push(arguments);
    };
    window[this.gaNamespace].l = 1 * new Date();
  },

  render: function() {
    this.setupGoogleAnalytics();

    var scriptTag = document.createElement('script');
    scriptTag.addEventListener('load', this.handleLoadEvent.bind(this), false);
    scriptTag.setAttribute('async', true);
    scriptTag.setAttribute('src', '//www.google-analytics.com/analytics.js');

    this.el.appendChild(scriptTag);

    return this;
  }

 };
});
