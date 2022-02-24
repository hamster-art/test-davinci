const gulp = require('gulp'),
    scss = require('gulp-sass')(require('sass')),
    scssGroupMedia = require('gulp-group-css-media-queries'),
    scssAutoprefixer = require('gulp-autoprefixer'),
    sourcemap = require('gulp-sourcemaps'),
    scssCleanMin = require('gulp-clean-css'),
    jsUglify = require('gulp-uglify-es').default,
    webpack = require('webpack-stream'),
    imagemin = require('gulp-imagemin'),
    imageWebp = require('gulp-webp'),
    newer = require("gulp-newer"),
    webpCss = require('gulp-webp-css'),
    webpHtml = require('gulp-webp-html'),
    ttf2woff = require('gulp-ttf2woff'),
    ttf2woff2 = require('gulp-ttf2woff2'),
    fileInclude = require('gulp-file-include'),
    rename = require('gulp-rename'),
    clean = require('gulp-clean'),
    svgSprite = require('gulp-svg-sprite'),
    sync = require('browser-sync'),
    favicons = require('gulp-favicons'),
    deleteFile = require('del');

const src = 'src';
const build = 'build';
const path = {
    html : {
        src: src + '/*.html',
        build: build + '/',
        watch: [src + '/**/*.html'],
    },
    css: {
        src: src + '/styles/scss/styles.scss',
        build: build + '/styles/',
        watch: [src + '/styles/scss/**/*.scss', src + '/components/**/*.scss'],
    },
    fonts: {
        src: src + '/styles/fonts/*.ttf',
        build: build + '/styles/fonts/',
    },
    js: {
        src: src + '/js/*.js',
        build: build + '/js/',
        watch: [src + '/js/**/*.js'],
    },
    img: {
        src: src + '/img/**/*.{png,jpg,jpeg,svg}',
        build: build + '/img/',
        watch: [src + '/img/**/*'],
    },
    icons: {
        src: src + '/styles/icons/*.svg',
        build: build + '/styles/icons/',
        watch: [src + '/styles/icons/*.svg'],
    },
    favicons: {
        src: src + '/favicon.svg',
        build: build + '/'
    }
};

/* --- HTML ==================================================================================== */
const html = () => {
    return gulp.src(path.html.src)
        .pipe(fileInclude())
        .pipe(webpHtml())
        .pipe(gulp.dest(path.html.build))
        .on('end', sync.reload);
};

/* --- SCSS ==================================================================================== */
const css = () => {
    return gulp
        .src(path.css.src)
        .pipe(sourcemap.init())
        .pipe(scss())
        .pipe(scssGroupMedia())
        .pipe(scssAutoprefixer())
        .pipe(webpCss())
        .pipe(gulp.dest(path.css.build))
        .pipe(scssCleanMin())
        .pipe(rename({ extname: '.min.css' }))
        .pipe(sourcemap.write('.'))
        .pipe(gulp.dest(path.css.build))
        .on('end', sync.reload);
};

/* --- JS ==================================================================================== */
const js = () => {
    return gulp
        .src(path.js.src)
        .pipe(webpack(require('./webpack.config.js')))
        .pipe(gulp.dest(path.js.build))
        .pipe(jsUglify())
        .pipe(rename({ extname: '.min.js' }))
        .pipe(gulp.dest(path.js.build))
        .on('end', sync.reload);
};

/* --- IMG ==================================================================================== */
const img = () => {
    return gulp
        .src(path.img.src)
        .pipe(
            imagemin([
                imagemin.optipng({ optimizationLevel: 5 }),
                imagemin.mozjpeg({ quality: 75, progressive: true }),
                imagemin.svgo({
                    plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
                }),
            ]),
        )
        .pipe(gulp.dest(path.img.build))
        .on('end', sync.reload);
};

/* --- WEBP ==================================================================================== */
const webp = () => {
    return  gulp.src(path.img.src)
        .pipe(newer(path.img.build))
        .pipe(imageWebp())
        .pipe(gulp.dest(path.img.build))
        .on('end', sync.reload);
};

/* --- SVG Sprite ==================================================================================== */
const genSvgSpriteIcons = () => {
    return gulp
        .src(path.icons.src)
        .pipe(
            svgSprite({
                mode: {
                    symbol: true,
                },
            }),
        )
        .pipe(gulp.dest(src + '/styles/'));
};
const moveSvgSpriteIcons = () => {
    gulp
        .src(src + '/styles/symbol/svg/sprite.symbol.svg')
        .pipe(rename('sprite.svg'))
        .pipe(gulp.dest(path.icons.build));
    return gulp.src('src/styles/symbol/', { read: false }).pipe(clean()).on('end', sync.reload);
};
const sprite = gulp.series(genSvgSpriteIcons, moveSvgSpriteIcons);

/* --- Favicon ==================================================================================== */
const favicon = () => {
    return gulp.src(path.favicons.src)
        .pipe(favicons({
            icons: {
                appleIcon: false,
                favicons: true,
                online: false,
                appleStartup: false,
                android: false,
                firefox: false,
                yandex: false,
                windows: false,
                coast: false
            }
        }))
        .pipe(gulp.dest(path.favicons.build));
};

/* --- TTF to WOFF/WOFF2 ==================================================================================== */
const fonts = () => {
    gulp.src(path.fonts.src).pipe(ttf2woff()).pipe(gulp.dest(path.fonts.build));
    return gulp.src(path.fonts.src).pipe(ttf2woff2()).pipe(gulp.dest(path.fonts.build));
};

/* --- WATCH ==================================================================================== */
const watcher = () => {
    gulp.watch(path.html.watch, html);
    gulp.watch(path.css.watch, css);
    gulp.watch(path.js.watch, js);
    gulp.watch(path.img.watch, img);
};

/* --- BUILD ==================================================================================== */
const deleteBuild = () => {
    return deleteFile([build + '/*.html', path.css.build, path.img.build]);
};
exports.deleteBuild = deleteBuild;

const builder = gulp.series(deleteBuild, gulp.parallel(html, css, js, img, webp, fonts, sprite, favicon));
exports.builder = builder;

/* --- Server ==================================================================================== */
const server = () => {
    sync.init({
        server: {
            baseDir: './' + build + '/',
        },
        notify: false,
    });
};

const run = gulp.parallel(gulp.series(builder, server), watcher);
exports.run = run;
