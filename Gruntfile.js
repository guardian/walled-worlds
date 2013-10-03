module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    requirejs: {
      compile: {
        options: {
          baseUrl: "src/",
          out: "dest/walled-worlds.js",

          paths: {
            'mustache': 'js/lib/mustache',
            'requireLib': 'js/lib/require',
            'templates': '../tmp/templates'

          },
          name: "js/walled-worlds",
          namespace: '<%= pkg.namespace %>',
          include: ['requireLib', 'templates']
        }
      }
    },

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy HH:MM:ss") %> */\n'
      },
      dist: {
        files: {
          'dest/walled-worlds.js': ['<%= concat.dist.dest %>']
        }
      }
    },

    watch: {
      files: ["src/**/*"],
      tasks: ["rebuild"]
    },

    copy: {
      main: {
        files: [
          {expand: true, cwd: "src/", src: ["**", "!**/templates/**", "!**/lib/**", "!**/js/**"], dest: "dest/"}
        ]
      }
    },

    clean: {
      build: ["dest"]
    },

    connect: {
      server: {
        options: {
          port: 9001,
          base: 'dest'
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
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks('grunt-requirejs');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-mustache');

  grunt.registerTask("rebuild", ["copy", "mustache", "requirejs", "watch"]);
  grunt.registerTask("default", ["copy", "mustache", "requirejs", "connect", "watch"]);
};
