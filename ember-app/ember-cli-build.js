/* global require, module */

var EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults){

  var app = new EmberApp(defaults, {
    storeConfigInMeta: false,
    fingerprint: {
      enabled: false
    }
  });

  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.

  app.import('bower_components/spin.js/spin.js')
  app.import('bower_components/underscore/underscore.js')
  app.import('bower_components/fuse.js/src/fuse.js')
  app.import('bower_components/marked/marked.min.js')
  app.import('bower_components/jquery-textcomplete/dist/jquery.textcomplete.js')
  app.import('bower_components/jquery-color/jquery.color.js')
  app.import('vendor/jquery.color.contrast.js')
  app.import('vendor/task-list.js')
  app.import('vendor/autoresize.js')

  //Extensions
  app.import('vendor/utilities/core_extensions/regexp.js');

  return app.toTree();
}
