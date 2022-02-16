const gulp = require('gulp');
const del = require('del');
const include = require('gulp-file-include');
const plumber = require('gulp-plumber');
const uglify = require('gulp-uglify');
const scss = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const groupMedia = require('gulp-group-css-media-queries');
const cleanCss = require('gulp-clean-css');
const rename = require('gulp-rename');
const newer = require('gulp-newer');
const imagemin = require('gulp-imagemin');
const htmlmin = require('gulp-htmlmin');
const { src, dest } = require('gulp');
const browserSyncModule = require('browser-sync').create();

const projectFolder = 'build';
const sourceFolder = 'src';

const path = {
  build: {
    html: projectFolder + '/',
    css: projectFolder + '/',
    js: projectFolder + '/js/',
    img: projectFolder + '/img/',
    fonts: projectFolder + '/fonts/',
  },
  src: {
    html: sourceFolder + '/*.html',
    css: sourceFolder + '/scss/*.scss',
    js: sourceFolder + '/js/*.js',
    img: sourceFolder + '/img/**/*.{jpg,png,svg,gif,ico,webp}',
    fonts: sourceFolder + '/fonts/*.*',
  },
  watch: {
    html: sourceFolder + '/**/*.html',
    css: sourceFolder + '/scss/**/*.scss',
    js: sourceFolder + '/js/*.js',
    img: sourceFolder + '/img/**/*.{jpg,png,svg,gif,ico,webp}',
  },
  clean: projectFolder + '/**',
};

const browserSyncTask = function () {
  browserSyncModule.init({
    server: {
      baseDir: './' + projectFolder + '/',
    },
    port: 3000,
    notify: false,
  });
};

const htmlTask = function () {
  return src(path.src.html)
    .pipe(
      include({
        prefix: '@@',
        basepath: '@file',
      }),
    )
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest(path.build.html))
    .pipe(browserSyncModule.stream());
};

const jsTask = function () {
  return src(path.src.js)
    .pipe(plumber())
    .pipe(
      include({
        prefix: '@@',
        basepath: '@file',
      }),
    )
    .pipe(uglify())
    .pipe(dest(path.build.js))
    .pipe(browserSyncModule.stream());
};

const cssTask = function () {
  return src([path.src.css])
    .pipe(
      scss({
        outputStyle: 'expanded',
      }),
    )
    .pipe(plumber())
    .pipe(groupMedia())
    .pipe(
      autoprefixer({
        overrideBrowserslist: ['last 5 versions'],
        cascade: true,
      }),
    )
    .pipe(cleanCss())
    .pipe(rename('style.css'))
    .pipe(dest(path.build.css))
    .pipe(browserSyncModule.stream());
};

const imagesTask = function () {
  return src(path.src.img)
    .pipe(newer(path.build.img))
    .pipe(
      imagemin({
        progressive: true,
        svgoPlugins: [{ removeViewBox: false }, { cleanupIDs: false }],
        interPlaced: true,
        optimizationLevel: 3,
      }),
    )
    .pipe(dest(path.build.img))
    .pipe(browserSyncModule.stream());
};

const faviconImagesTask = function () {
  return src(sourceFolder + '/*.{jpg,png,svg,gif,ico,webp}').pipe(
    dest(projectFolder + '/'),
  );
};

const fontsTask = function () {
  return src(path.src.fonts)
    .pipe(dest(path.build.fonts))
    .pipe(browserSyncModule.stream());
};

const watchFiles = function () {
  gulp.watch([path.watch.html], htmlTask);
  gulp.watch([path.watch.css], cssTask);
  gulp.watch([path.watch.js], jsTask);
  gulp.watch([path.watch.img], imagesTask);
};

const cleanTask = function () {
  return del(path.clean, { force: true });
};

const buildFiles = gulp.series(
  cleanTask,
  gulp.parallel(
    htmlTask,
    jsTask,
    cssTask,
    imagesTask,
    faviconImagesTask,
    fontsTask,
  ),
);

const watch = gulp.parallel(buildFiles, watchFiles, browserSyncTask);

exports.html = htmlTask;
exports.js = jsTask;
exports.css = cssTask;
exports.images = imagesTask;
exports.fonts = fontsTask;
exports.faviconImagesTask = faviconImagesTask;

exports.build = buildFiles;
exports.watch = watch;
exports.default = watch;