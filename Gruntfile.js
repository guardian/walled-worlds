module.exports = function(grunt) {

  var isProd = grunt.option('prod') || false;

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    requirejs: {
      compile: {
        options: {
          baseUrl: "src/js/",
          out: "dest/main.js",

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
            'es5-shim': 'lib/es5-shim'
          },

          shim: {
            'tabletop': { 'exports': 'Tabletop' },
            'tween': { 'exports': 'TWEEN' },
            'requestAnimPolyfill' : { 'exports': 'requestAnimPolyfill' },
            'classlist': { 'exports:': 'classlist' },
            'es5-shim': { 'exports:': 'es5-shim' }
          },

          name: "app/app",

          //namespace: '<%= pkg.namespace %>',
          include: ['almond', 'templates', 'classlist', 'es5-shim', 'requestAnimPolyfill'],
          findNestedDependencies: true,
          inlineText: true,
          stubModules: ['text'],
          optimize: (isProd) ? 'uglify' : 'none',
          wrap: {
            start: "define([], function() {",
            endFile: "src/require_end.frag"
          }
        }
      }
    },

    watch: {
      js: {
        files: ["src/js/**/*.js"],
        tasks: ["requirejs"]
      },
      templates: {
        files: ["src/templates/*.mustache"],
        tasks: ["mustache", "requirejs"]
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
        tasks: ["mustache", "requirejs"]
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
    }

  });

  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-mustache');
  grunt.loadNpmTasks('grunt-sass');

  grunt.registerTask("default", ["clean", "copy", "mustache", "requirejs", "sass", "connect", "watch"]);
};
