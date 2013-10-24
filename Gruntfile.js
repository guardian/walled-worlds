module.exports = function(grunt) {
  var pkg = grunt.file.readJSON('package.json');
  var isDev = grunt.option('dev') || false;
  var useGoogleSpreadsheet = true;


  grunt.task.registerTask('fetch', 'Fetch data from Google spreadsheet.', function() {
    var done = this.async();
    var Tabletop = require('tabletop');
    Tabletop.init( {
      key: '0AjNAJ9Njg5YTdGtEZVdreHpBN3ZFOFJVVDdLUXhEcmc',
      callback: _handleData,
      simpleSheet: false
    });

    function _handleData(data) {
      grunt.file.write('tmp/data.js', 'define([],function() { return ' + JSON.stringify(data, null, "  ") + '; });');
      done();
    }
  });

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    requirejs: {
      options: {
        baseUrl: "src/js/",
        out: "dest/boot.js",

        paths: {
          'mustache': 'lib/mustache',
          'almond': 'lib/almond',
          'templates': '../../tmp/templates',
          'tabletop': 'lib/tabletop',
          'marked': 'lib/marked',
          'tween': 'lib/tween.min',
          'requestAnimPolyfill': 'lib/requestAnimPolyfill',
          'text': 'lib/text',
          'svgDir': '../svg/',
          'PubSub': 'lib/pubsub',
          'classlist': 'lib/classList',
          'es5-shim': 'lib/es5-shim',
          'd3': 'lib/d3.v3.min',
          'togeojson': 'lib/togeojson',

          // Dev gets data directly from Google spreadsheet, prod bakes it in
          'data': (useGoogleSpreadsheet) ? 'app/models/contentData' : '../../tmp/data'
        },

        shim: {
          'tabletop': { 'exports': 'Tabletop' },
          'tween': { 'exports': 'TWEEN' },
          'requestAnimPolyfill' : { 'exports': 'requestAnimPolyfill' },
          'classlist': { 'exports:': 'classlist' },
          'es5-shim': { 'exports:': 'es5-shim' },
          'd3': { 'exports:': 'DD3' },
          'togeojson': { 'exports:': 'toGeoJSON' }
        },

        name: "app/app",

        //namespace: '<%= pkg.namespace %>',
        include: ['almond', 'templates', 'classlist', 'es5-shim', 'requestAnimPolyfill'],
        findNestedDependencies: true,
        inlineText: true,
        stubModules: ['text'],
        optimize: 'none',
        wrap: {
          start: "define([], function() {",
          endFile: "src/require_end.frag"
        },

        // Set asset path based on environment
        onBuildWrite: function (moduleName, path, contents) {
          var assetUrl = '/';
          return contents.replace(/\{\{ assetUrl }}/g, assetUrl);
        }
      },
      dev: {},
      prod: {
        options: {
          optimize: 'uglify',
          // Set asset path based on environment
          onBuildWrite: function (moduleName, path, contents) {
            var assetUrl = pkg.remoteUrl + pkg.s3Bucket + '/' + pkg.s3Folder;
            return contents.replace(/\{\{ assetUrl }}/g, assetUrl);
          }
        }
      }
    },

    watch: {
      js: {
        files: ["src/js/**/*.js"],
        tasks: ["requirejs:dev"]
      },
      templates: {
        files: ["src/templates/*.mustache"],
        tasks: ["mustache", "requirejs:dev"]
      },
      css: {
        files: ["src/css/*"],
        tasks: ["sass"]
      },
      html: {
        files: ["src/*.html"],
        tasks: ["copy:html"]
      },
      images: {
        files: ["src/imgs/**"],
        tasks: ["copy:images"]
      },
      svg: {
        files: ["src/svg/**"],
        tasks: ["mustache", "requirejs:dev"]
      }
    },

    copy: {
      html: {
        files: [{
          expand: true,
          cwd: "src/",
          src: ["*.html"],
          dest: "dest/"
        }]
      },
      images: {
        files: [{
          expand: true,
          cwd: "src/",
          src: ["imgs/**"],
          dest: "dest/"
        }]
      }
    },

    clean: {
      build: ["dest"]
    },

    connect: {
      server: {
        options: {
          port: 9001,
          base: 'dest',
          hostname: '*'
        }
      }
    },

    mustache: {
      templates: {
        src: 'src/templates/',
        dest: 'tmp/templates.js',
        options: {
          prefix: 'define(',
          verbose: true
        }
      }
    },

    sass: {
      dist: {
        options: {
          includePaths: ['src/css/'],
          outputStyle: 'nested'
        },
        files: {
          'dest/main.css': 'src/css/main.scss'
        }
      }
    },


    s3: {
      options: {
        region: '<%= pkg.s3Region %>',
        bucket: 'gdn-stage',
        access: 'public-read',
        headers: {
          "Cache-Control": "max-age=10, public",
          "Expires": new Date(Date.now() + 10).toUTCString()
        },
        gzip: true,
        gzipExclude: ['.jpg', '.jpeg', '.png']
      },

      production: {
        upload: [
          {
            src: 'dest/**/*',
            dest: '<%= pkg.s3Folder %>'
          }
        ]
      },

      test: {
        options: {
          debug: true
        },
        upload: [
          {
            src: 'dest/**/*',
            dest: '<%= pkg.s3Folder %>'
          }
        ]
      }
    }


  });

  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-mustache');
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-s3');


  grunt.registerTask("default", ["clean", "copy", "mustache", "requirejs:dev", "sass", "connect", "watch"]);

  grunt.registerTask("build", ["clean", "copy", "mustache", "requirejs:prod", "sass"]);
  grunt.registerTask("deploy", ["build", "s3:production"]);
  grunt.registerTask("test-deploy", ["build", "s3:test"]);
};
