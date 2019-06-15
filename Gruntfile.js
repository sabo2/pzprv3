/* jshint node: true, browser: false, es3:false */
module.exports = function(grunt){
  var pkg = grunt.file.readJSON('package.json'), deps = pkg.devDependencies;
  for(var plugin in deps){ if(plugin.match(/^grunt\-/)){ grunt.loadNpmTasks(plugin);}}
  
  var pzprversion = require('./node_modules/pzpr/package.json').version;
  
  var fs = require('fs');
  var banner_min  = fs.readFileSync('./src/js/common/banner_min.js',  'utf-8');
  var banner_full = fs.readFileSync('./src/js/common/banner_full.js', 'utf-8');

  var PRODUCTION = (grunt.cli.tasks.indexOf('release') >= 0);

  grunt.initConfig({
    pkg: pkg,
    pzpr: {
      version: pzprversion
    },

    copy: {
      pzpr: {
        files : [
          { expand: true, cwd: 'node_modules/pzpr/dist/pzpr-variety', src: ['*.js'], dest: 'dist/js/pzpr-variety' },
          { src: 'node_modules/pzpr/dist/pzpr.js', dest: 'dist/js/pzpr.js' }
        ]
      },
      ui: {
        options: {
          process: function(content, srcpath){ return grunt.template.process(content);},
          noProcess: ['**/*.{png,gif,ico}'],
          mode: true
        },
        files : [
          { expand: true, cwd: 'src/css', src: ['*.css'], dest: 'dist/css' },
          { expand: true, cwd: 'src',     src: ['*'],     dest: 'dist'     },
          { src: 'LICENSE.txt',          dest: 'dist/LICENSE.txt'      }
        ]
      }
    },

    concat: {
      options: {
        banner: banner_full,
        process: true,
      },
      ui: {
        options:{
          sourceMap: !PRODUCTION
        },
        files: [
          { src: require('./src/js/pzprv3-ui.js').files, dest: 'dist/js/pzprv3-ui.concat.js' }
        ]
      }
    },

    uglify: {
      options: {
        banner: banner_min,
        report: 'min',
      },
      ui: {
        options: (PRODUCTION ? {} : {
          sourceMap : 'dist/js/pzprv3-ui.js.map',
          sourceMapIn : 'dist/js/pzprv3-ui.concat.js.map',
          sourceMapIncludeSources : true
        }),
        files: [
          { src: 'dist/js/pzprv3-ui.concat.js', dest: 'dist/js/pzprv3-ui.js' },
          { src: 'src/js/v3index.js',           dest: 'dist/js/v3index.js' }
        ]
      }
    },

    jshint: {
      options: {
        jshintrc: true
      },
      all: {
        src: [
          'Gruntfile.js',
          'src/js/*.js',
          'src/js/ui/*.js',
          'tests/**/*.js'
        ]
      },
      source:{
        src: [
          'src/js/*.js',
          'src/js/ui/*.js'
        ]
      }
    }
  });
  
  grunt.registerTask('lint', ['newer:jshint:all']);
  grunt.registerTask('default', ['lint:source', 'build']);
  grunt.registerTask('release', ['lint:source', 'build']);
  grunt.registerTask('build',   ['newer:copy:ui', 'newer:copy:pzpr', 'newer:concat:ui', 'newer:uglify:ui']);
};
