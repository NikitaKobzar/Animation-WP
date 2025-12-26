const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const del = require('del');

const paths = {
  scss: {
    src: 'assets/scss/style.scss',
    dest: 'assets/dist/css'
  },
  js: {
    src: 'assets/js/**/*.js',
    dest: 'assets/dist/js'
  }
};

// Очистка перед сборкой
function clean() {
  return del(['assets/dist/css/**/*', 'assets/dist/js/**/*']);
}

// Компиляция стилей
function styles() {
  return gulp.src(paths.scss.src)
      .pipe(sourcemaps.init())
      .pipe(sass().on('error', sass.logError))
      .pipe(autoprefixer())
      .pipe(cleanCSS())
      .pipe(rename('theme-style.min.css'))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(paths.scss.dest));
}

// Склейка и минимизация скриптов
function scripts() {
  return gulp.src(paths.js.src)
      .pipe(sourcemaps.init())
      .pipe(concat('main.min.js'))
      .pipe(uglify())
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(paths.js.dest));
}

// Слежка за файлами
function watchFiles() {
  gulp.watch('assets/scss/**/*.scss', styles);
  gulp.watch(paths.js.src, scripts);
}

// Экспорты
exports.clean = clean;
exports.styles = styles;
exports.scripts = scripts;
exports.watch = gulp.series(styles, scripts, watchFiles);
exports.default = gulp.series(clean, gulp.parallel(styles, scripts));
