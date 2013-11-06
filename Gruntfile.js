module.exports = function(grunt) {
  var pkg = grunt.file.readJSON('package.json');

  function getRequirePaths(useLiveData) {
    return {
      'mustache': 'lib/mustache',
      'almond': 'lib/almond',
      'templates': '../../tmp/templates',
      'tabletop': 'lib/tabletop',
      'marked': 'lib/marked',
      'tween': 'lib/tween',
      'requestAnimPolyfill': 'lib/requestAnimPolyfill',
      'text': 'lib/text',
      'svgDir': '../svg/',
      'PubSub': 'lib/pubsub',
      'classlist': 'lib/classList',
      'es5-shim': 'lib/es5-shim',
      'd3': 'lib/d3',
      'history': 'lib/history.iegte8',
      'modernizr': 'lib/modernizr',
      'togeojson': 'lib/togeojson',
      'svgView': (useLiveData) ? 'app/views/googleSVGView' : 'app/views/staticSVGView',
      // Dev gets data directly from Google spreadsheet, prod bakes it in
      'data': (useLiveData) ? 'app/models/contentData' : 'app/models/fetchedData'
    };
  }

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    requirejs: {
      options: {
        baseUrl: "src/js/",
        out: "dest/<%= pkg.version %>/main.js",
        paths: getRequirePaths(false),
        shim: {
          'tabletop': { 'exports': 'Tabletop' },
          'tween': { 'exports': 'TWEEN' },
          'requestAnimPolyfill' : { 'exports': 'requestAnimPolyfill' },
          'classlist': { 'exports:': 'classlist' },
          'es5-shim': { 'exports:': 'es5-shim' },
          'd3': { 'exports:': 'DD3' , 'deps': [ 'es5-shim' ] },
          'togeojson': { 'exports:': 'toGeoJSON' },
          'modernizr': { 'exports': 'modernizr'}
        },

        name: "app/app",

        //namespace: '<%= pkg.namespace %>',
        include: ['almond', 'modernizr', 'history', 'es5-shim', 'templates', 'classlist', 'requestAnimPolyfill'],
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
      dev: {
        options: {
          paths: getRequirePaths(true),
          //generateSourceMaps: true,
          //useSourceUrl: true,
          optimize: 'none'
        }
      },
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
        tasks: ["requirejs:dev", "replace:dev"]
      },
      templates: {
        files: ["src/templates/*.mustache"],
        tasks: ["mustache", "requirejs:dev", "replace:dev"]
      },
      css: {
        files: ["src/css/*"],
        tasks: ["sass","replace:dev"]
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
        tasks: ["mustache", "requirejs:dev", "replace:dev"]
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
          dest: "dest/<%= pkg.version %>/"
        }]
      },
      bootjs: {
        files: [{
          expand: true,
          flatten: true,
          cwd: "src/",
          src: ["js/boot.js"],
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
          'dest/<%= pkg.version %>/main.css': 'src/css/main.scss'
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
            src: 'dest/*',
            dest: '<%= pkg.s3Folder %>'
          },
          {
            src: 'dest/<%= pkg.version %>/*',
            dest: '<%= pkg.s3Folder %>/<%= pkg.version %>'
          },
          {
            src: 'dest/<%= pkg.version %>/imgs/*',
            dest: '<%= pkg.s3Folder %>/<%= pkg.version %>/imgs'
          }
        ]
      },

      test: {
        options: {
          debug: true
        },
        upload: [
          {
            src: 'dest/*',
            dest: '<%= pkg.s3Folder %>'
          },
          {
            src: 'dest/<%= pkg.version %>/*',
            dest: '<%= pkg.s3Folder %>/<%= pkg.version %>'
          },
          {
            src: 'dest/<%= pkg.version %>/imgs/*',
            dest: '<%= pkg.s3Folder %>/<%= pkg.version %>/imgs'
          }
        ]
      }
    },

    replace: {
      dev: {
        src: ['dest/boot.js', 'dest/<%= pkg.version %>/main.js', 'dest/<%= pkg.version %>/main.css'],
        overwrite: true, // overwrite matched source files
        replacements: [{
          from: '{{ versionedProjectPath }}',
          to: '/' + pkg.version
        }]
      },

      prod: {
        src: ['dest/boot.js', 'dest/<%= pkg.version %>/main.js', 'dest/<%= pkg.version %>/main.css'],
        overwrite: true, // overwrite matched source files
        replacements: [{
          from: '{{ versionedProjectPath }}',
          to: pkg.remoteUrl + pkg.s3Bucket + '/' + pkg.s3Folder + '/' + pkg.version
        }]
      }
    }


  });

  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-text-replace');
  grunt.loadNpmTasks('grunt-mustache');
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-s3');


  grunt.registerTask("default", ["clean", "copy", "mustache", "requirejs:dev", "sass", "replace:dev", "connect", "watch"]);
  grunt.registerTask("build", ["clean", "copy", "mustache", "requirejs:dev", "sass", "replace:prod"]);
  grunt.registerTask("deploy", ["build", "s3:production"]);
  grunt.registerTask("test-deploy", ["fetch-data", "fetch-svg", "build", "s3:test"]);


  grunt.registerTask("fetch-svg", [], function() {
    var fetchSVG = require('./src/fetch_and_bake_svgs');
    var done = this.async();
    fetchSVG.run(done);
  });

  grunt.task.registerTask('fetch-data', 'Fetch data from Google spreadsheet.', function() {
    var done = this.async();
    console.log('Fetching Google Spreadsheet...');
    var Tabletop = require('tabletop');
    Tabletop.init( {
      key: '0AjNAJ9Njg5YTdGtEZVdreHpBN3ZFOFJVVDdLUXhEcmc',
      callback: _handleData,
      simpleSheet: false
    });

    function _handleData(data) {
      console.log('Saving Google Spreadsheet...');
      grunt.file.write('src/js/app/models/fetchedData.js', 'define([],function() { return ' + JSON.stringify(data, null, "  ") + '; });');
      done();
    }
  });
};
