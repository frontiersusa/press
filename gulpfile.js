// ======================
// DEPENDENCIES
// ======================

var gulp = require('gulp'),
  sass = require('gulp-ruby-sass'),
  sourcemaps = require('gulp-sourcemaps'),
  rename = require('gulp-rename'),
  concat = require('gulp-concat'),
  notify = require('gulp-notify'),
  watch = require('gulp-watch'),
  gutil = require('gulp-util'),
  plumber = require('gulp-plumber'),
  browserSync = require('browser-sync'),
  nunjucksRender = require('gulp-nunjucks-render'),
  prettify = require('gulp-prettify'),
  runSequence = require('run-sequence').use(gulp),
  symdiff = require('gulp-symdiff'),
  symdiffhtml = require('symdiff-html'),
  symdiffcss = require('symdiff-css'),
  fs = require('fs'),
  del = require('del'),
  postcss = require('gulp-postcss'),
  autoprefixer = require('autoprefixer'),
  cssnano = require('cssnano'),
  pxtorem = require('postcss-pxtorem'),
  lazypipe = require('lazypipe'),
  fileExists = require('file-exists'),
  gulpif = require('gulp-if'),
  jsonToSass = require('gulp-json-to-sass');

// ======================
// AUTOMATION
// ======================

var onError = function(err) {
  notify.onError({
    title: "Gulp",
    subtitle: "Failure!",
    message: "Error: <%= error.message %>",
    sound: "Beep"
  })(err);
  this.emit('end');
};

var reload = browserSync.reload;

gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: "./test"
    }
  });
});

gulp.task('bs-reload', function() { browserSync.reload(); });

gulp.task('watch', ['browser-sync'], function() {
  // HTML Files
  gulp.watch('./test/**/*.html'), ['bs-reload'];
  // Project Styles
  gulp.watch('styles/**/*.scss', ['test'])
});

// ======================
// STYLES
// ======================

// // Find Config.json file
// var boltConfig = "./bower_components/bolt/styles/config.json";
// var localConfig = "./styles/config.json";
//
// if(fileExists(localConfig)) {
//   var foundLocal = true;
// } else {
//   var foundLocal = false;
// }
//
// var findConfig = lazypipe()
// .pipe(function () {
//   return gulpif(foundLocal,
//     jsonToSass({
//       jsonPath: localConfig,
//       scssPath: 'styles/test-config.scss'
//     }),
//     jsonToSass({
//       jsonPath: boltConfig,
//       scssPath: 'styles/test-config.scss'
//     })
//   )
// })

// Dev Styles
gulp.task('styles-dev', function() {
  sass('test/styles/test.scss')
    .pipe(plumber({ errorHandler: onError }))
    .pipe(findConfig())
    .pipe(postcss([
      autoprefixer({browsers: ['last 2 version']}),
      pxtorem({
        rootValue: 16,
        replace: true,
        propWhiteList: [],
        mediaQuery: false
      })
    ]))
    .pipe(sourcemaps.init())
    .pipe(concat('main.dev.css'))
    .pipe(gulp.dest('./test/styles'))
    .pipe(browserSync.reload({ stream: true }))
    .pipe(notify({ message: 'DEVELOPMENT STYLES task complete'}))
});


// Styles Production
gulp.task('styles-prod', function() {
  return sass('test/styles/test.scss', { style: 'nested' })
    .pipe(plumber({ errorHandler: onError }))
    .pipe(postcss([
      autoprefixer({browsers: ['last 2 version']}),
      pxtorem({
        rootValue: 16,
        replace: true,
        propWhiteList: [],
        mediaQuery: false
      })
    ]))
    .pipe(postcss([cssnano({discardComments: {removeAll: true}})]))
    .pipe(concat('main.min.css'))
    .pipe(gulp.dest('./test/styles'))
    .pipe(browserSync.reload({ stream: true }))
    .pipe(notify({ message: 'PRODUCTION STYLES task complete' }));
});

// IE Styles
// gulp.task('styles-ie', function() {
//   return sass(['styles/ie.scss'], { style: 'nested' })
//     .pipe(plumber({ errorHandler: onError }))
//     .pipe(postcss([autoprefixer({browsers: [
//       'last 2 version',
//       'ie 7',
//       'ie 8',
//       'ie 9'
//     ]})]))
//     .pipe(concat('ie.main.css'))
//     .pipe(gulp.dest('./test/styles'))
//     .pipe(browserSync.reload({ stream: true }))
//     .pipe(notify({ message: 'IE STYLES task complete' }));
// });

// ======================
// IMAGES
// ======================

gulp.task('images', ['clean:images'], function() {
  return gulp.src([
    './bower_components/final/images/**/*',
    './src/images/**/*'
  ])
    .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
    .pipe(gulp.dest('./test/images'))
});

// ======================
// CLEAN
// ======================

// Clean Styles
gulp.task('clean:styles', function () {
  return del('test/styles/**/*.css');
});

// ======================
// BUILD
// ======================

gulp.task('test', function(callback) {
  runSequence(
    'clean:styles',
    'styles-dev',
    'styles-prod',
    callback
  );
});
