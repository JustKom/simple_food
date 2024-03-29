const { src, dest, gulp, watch, parallel, series } = require('gulp');
const scss         = require('gulp-sass')(require('sass'));
const concat       = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const uglify       = require('gulp-uglify');
const imagemin     = require('gulp-imagemin');
const del          = require('del');
const browserSync  = require('browser-sync').create();
const svgSprite    = require('gulp-svg-sprite');
const fileInclude  = require('gulp-file-include');
const ghpages      = require('gh-pages');


function browsersync() {
    browserSync.init({
        server: {
            baseDir: 'app/'
        },
        notify: false
    })
}


function styles() {
  return src('app/scss/style.scss')
    .pipe(scss({outputStyle: 'compressed'}))
    .pipe(concat('style.min.css'))
    .pipe(autoprefixer({
        overrideBrowserslist: ['last 10 versions'],
        grid: true
    }))
    .pipe(dest('app/css'))
    .pipe(browserSync.stream())
}


function scripts() {
    return src([
        'node_modules/jquery/dist/jquery.js',
        'node_modules/mixitup/dist/mixitup.js',
        'node_modules/slick-carousel/slick/slick.js',
        // 'node_modules/@fancyapps/fancybox/dist/jquery.fancybox.js',
        'node_modules/@fancyapps/ui/dist/fancybox.umd.js',
        'node_modules/ion-rangeslider/js/ion.rangeSlider.js',
        'node_modules/rateyo/src/jquery.rateyo.js',
        'node_modules/jquery-form-styler/dist/jquery.formstyler.js',
        'app/js/main.js'
    ])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js'))
    .pipe(browserSync.stream())
}


function images() {
    return src('app/images/**/*.*')
    .pipe(imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ quality: 75, progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
            plugins: [
                { removeViewBox: true },
                { cleanupIDs: false }
            ]
        })
    ]))
    .pipe(dest('dist/images'))
}


function fonts() {
  return src('app/fonts/**/*.{woff,woff2}')
    .pipe(dest('dist/fonts'));
};


function build() {
  return src ([
    'app/**/*.html',
    'app/css/style.min.css',
    'app/js/main.min.js'
  ], {base: 'app'})
  .pipe(dest('dist'))
}


function cleanDist() {
  return del('dist')
}


const htmlInclude = () => {
  return src(['app/html/*.html'])
    .pipe(fileInclude({
      prefix: '@',
      basepath: '@file',
    }))
    .pipe(dest('app'))
    .pipe(browserSync.stream());
}


function svgSprites() {
  return src('app/images/icons/*.svg')
    .pipe(
      svgSprite({
        mode: {
          stack: {
            sprite: '../sprite.svg',
          },
        },
      })
    )
    .pipe(dest('app/images'));
}


ghpages.publish('dist', function (err) {});

function watching() {
    watch(['app/scss/**/*.scss'], styles);
    watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
    watch(['app/**/*.html']).on('change', browserSync.reload);
    watch(['app/images/icons/*.svg'], svgSprites);
    watch(['app/html/**/*.html'], htmlInclude);
}


exports.styles = styles;
exports.scripts = scripts;
exports.browsersync = browsersync;
exports.images = images;
exports.svgSprites = svgSprites;
exports.htmlInclude = htmlInclude;
exports.fonts = fonts;
exports.cleanDist = cleanDist;
exports.build = build;
exports.distBuild = series(cleanDist, images, fonts, build);

exports.watching = watching;
exports.default = parallel(htmlInclude, svgSprites, styles, scripts, browsersync, watching);