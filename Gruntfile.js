module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';',
        stripBanners: true
      },
      dist: {
        src: [
          "src/lib/jquery.js",
          "src/lib/underscore.js",
          "src/lib/backbone.js",
          "src/lib/onepagescroll.js",
          "src/js/walled-worlds.js",
        ],
        dest: 'dest/walled-worlds.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
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
          {expand: true, cwd: "src/", src: ["**", "!**/lib/**", "!**/js/**"], dest: "dest/"}
        ]
      }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-contrib-concat");
  grunt.loadNpmTasks("grunt-contrib-uglify");

  grunt.registerTask("rebuild", ["copy", "watch"]);
  grunt.registerTask("default", ["concat", "copy", "uglify", "watch"]);

};