module.exports = function(grunt) {

  var isDev = grunt.option('dev') || false;

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    requirejs: {
      compile: {
        options: {
          baseUrl: "src/js/",
          out: "dest/walled-worlds.js",

          paths: {
            'mustache': 'lib/mustache',
            'requireLib': 'lib/require',
            'templates': '../../tmp/templates',
            'tabletop': 'lib/tabletop'
          },

          shim: {
            'tabletop': {
              'exports': 'Tabletop'
            }
          },

          name: "main",
          namespace: '<%= pkg.namespace %>',
          include: ['requireLib', 'templates'],
          optimize: (isDev) ? 'none': 'uglify'
        }
      }
    },

    watch: {
      js: {
        files: ["src/js/**/*.js", "src/templates/**"],
        tasks: ["mustache", "requirejs"]
      },
      css: {
        files: ["src/css/*"],
        tasks: ["copy:css"]
      },
      html: {
        files: ["src/index.html"],
        tasks: ["copy:html"]
      },
      images: {
        files: ["src/imgs/**"],
        tasks: ["copy:images"]
      }

    },

    copy: {
      css: {
        files: [{
          expand: true,
          cwd: "src/",
          src: ["css/**"],
          dest: "dest/"
        }]
      },
      html: {
        files: [{
          expand: true,
          cwd: "src/",
          src: ["index.html"],
          dest: "dest/"
        }]
      },
      imgs: {
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
      files : {
        src: 'src/templates/',
        dest: 'tmp/templates.js',
        options: {
          prefix: 'define(',
          verbose: true
        }
      }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks('grunt-requirejs');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-mustache');

  grunt.registerTask("rebuild", ["copy", "mustache", "requirejs", "watch"]);
  grunt.registerTask("default", ["clean", "copy", "mustache", "requirejs", "connect", "watch"]);
};
