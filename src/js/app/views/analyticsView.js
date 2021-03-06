define(['app/models/config', 'mustache'], function(Config) {
 'use strict';
 return {

  el: document.createDocumentFragment(),

  handleLoadEvent: function() {
    __analytics('create', Config.google_analytics_uid);
    __analytics('send', 'pageview');
  },

  setupGoogleAnalytics: function() {
    window.GoogleAnalyticsObject = '__analytics';
    window.__analytics = function() {
      window.__analytics.q = [].push(arguments);
    };
    window.__analytics.l = 1 * new Date();
  },

  render: function() {
    this.setupGoogleAnalytics();

    var scriptTag = document.createElement('script');
    if (!scriptTag.addEventListener) {
      scriptTag.attachEvent('onload', this.handleLoadEvent.bind(this));
    } else {
      scriptTag.addEventListener('load', this.handleLoadEvent.bind(this), false);
    }

    scriptTag.setAttribute('async', true);
    scriptTag.setAttribute('src', '//www.google-analytics.com/analytics.js');

    this.el.appendChild(scriptTag);

    return this;
  }

 };
});
