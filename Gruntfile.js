module.exports = function (grunt) {
  'use strict';

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks("grunt-ts");

  grunt.initConfig({
    ts: {
      compile_lib: {
        tsconfig: false,
        options: {
          module: 'commonjs',
          moduleResolution: 'node',
          strict: false,
          target: 'es5',
          inlineSourceMap: false,
          rootDir: 'src'
        },
        src: [
          "src/adapters/server/DAVFileSystemResource.ts",
          "src/exports.ts"
        ],
        outDir: 'build'
      }
    },
    copy: {
      dist: {
        files: [{
          expand: true,
          cwd: 'build/',
          src: ['**'],
          dest: 'dist'
        }]
      }

    },
    clean: {
      build: ['build/']
    },
    appcache: {
      options: {
        basePath: 'tests/client'
      },
      all: {
        dest: 'tests/client/app.appcache',
        cache: {
          patterns: ['tests/client/app.js', 'dist/**/*.js']
        },
        network: '*',
        xfallback: '/ /offline.html'
      }
    }
  });

  // Default task
  grunt.task.registerTask('default', [
    'ts:compile_lib',
    'copy:dist'
  ]);

};
