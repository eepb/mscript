/* const gulp = require( 'gulp' );
const connect = require( 'gulp-connect' );
const files = [ 'index.html', 'm-script.js', 'm-script.css' ];

gulp.task( 'files', function() {
  gulp.src( files ).pipe( connect.reload() );
});

gulp.task( 'watch', function(done) {
  gulp.watch(files, ['files']);
  done();
});

gulp.task( 'connect', function(done) {
  connect.server({ livereload: true });
  done();
});

gulp.task('default', gulp.parallel('connect','watch')) */

const { parallel, src, watch } = require('gulp')
const connect = require('gulp-connect')

function serveTask (done) {
  connect.server({    
    root: 'src',
    livereload: true,
    port: 8000,
  }, function () { this.server.on('close', done) })
} 

function watchTask (done) {
  watch('src').on('change', (filepath) =>
    src(filepath, { read: false }).pipe(connect.reload()))
  done()
} 

module.exports.default = parallel(serveTask, watchTask)