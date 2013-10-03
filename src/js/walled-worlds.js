require(['mustache', 'templates'], function(mustache, templates) {
  var view = { 'header': 'Hello world' };
  var output = mustache.render(templates.structure, view);
  var elm = document.createElement('div');
  elm.innerHTML = output;
  document.querySelector('.test').appendChild(elm);
});