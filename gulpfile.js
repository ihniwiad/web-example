const gulp          = require('gulp');
const sourcemaps    = require('gulp-sourcemaps');
const sass          = require('gulp-sass');
const autoprefixer  = require('gulp-autoprefixer');
const rename        = require('gulp-rename');
const cleanCSS      = require('gulp-clean-css');
const clean         = require('gulp-clean');
const concat        = require('gulp-concat');
const watch         = require('gulp-watch');
const minify        = require('gulp-minify');

const SCSS_SRC_PATH = './scss';
const CSS_DEST_PATH = './css';
const JS_SRC_PATH   = './js';
const JS_DEST_PATH  = './js/dist';

const VENDOR_FILE_NAME  = 'vendor.js';
const SCRIPTS_FILE_NAME = 'scripts.js';

const FONT_SRC_PATH = './node_modules/roboto-fontface/fonts/roboto';
const FONT_DEST_PATH = './fonts/roboto';

const ICONFONT_SRC_PATH = './node_modules/font-awesome/fonts';
const ICONFONT_DEST_PATH = './fonts/font-awesome';

// copy fonts into local folder
gulp.task( 'font:font', function () {
    gulp.src( FONT_SRC_PATH + '/*' )
        .pipe( gulp.dest( FONT_DEST_PATH ) );
} );
gulp.task( 'font:iconfont', function () {
    gulp.src( ICONFONT_SRC_PATH + '/*' )
        .pipe( gulp.dest( ICONFONT_DEST_PATH ) );
} );

// compile scss to css
gulp.task( 'sass', function () {
    return gulp.src( SCSS_SRC_PATH + '/**/*.scss' )
        .pipe( sourcemaps.init() )
        .pipe( sass().on('error', sass.logError) )
        .pipe( autoprefixer( {
            browsers: [ 'last 2 versions' ],
            cascade: false
        } ) )
        .pipe( sourcemaps.write( '.' ) )
        .pipe( gulp.dest( CSS_DEST_PATH ) );
} );

// delete css folder to avoid duplicatet files
gulp.task( 'css:clean', function () {
    return gulp.src( CSS_DEST_PATH, { read: false } )
        .pipe( clean() );
});

// generate minified css file
gulp.task( 'css:minify', [ 'css:clean', 'sass' ], function() {
    return gulp.src( CSS_DEST_PATH + '/**/*.css' )
        .pipe( cleanCSS( { debug: true }, function( details ) {
            console.log( details.name + ': ' + details.stats.originalSize );
            console.log( details.name + ': ' + details.stats.minifiedSize );
        } ) )
        .pipe( rename( function ( path ) {
            path.basename += '.min';
        } ) )
        .pipe( gulp.dest( CSS_DEST_PATH ) );
} );

gulp.task( 'build', function() {
    gulp.start( [
        'css:minify',
        'js:vendor',
        'js:scripts',
        'font:font',
        'font:iconfont'
    ] );
});

gulp.task( 'js:vendor', function() {
    return gulp.src( [
        JS_SRC_PATH + '/vendor/modernizr-custom.js',
        './node_modules/jquery/dist/jquery.min.js',
        './node_modules/popper.js/dist/umd/popper.min.js',
        './node_modules/bootstrap/dist/js/bootstrap.min.js'
        //JS_SRC_PATH + '/vendor/some-more-files.js',
    ] )
    .pipe( concat( VENDOR_FILE_NAME ) )
    .pipe( minify( {
        ext: {
            src:'.js',
            min:'.min.js'
        },
        exclude: [],
        ignoreFiles: [ '.min.js' ]
    } ) )
    .pipe( gulp.dest( JS_DEST_PATH + '/' ) );
});

gulp.task( 'js:concat', function() {
    return gulp.src( [
        JS_SRC_PATH + '/lib/utils.js',
        JS_SRC_PATH + '/lib/**/!(utils).js',
        JS_SRC_PATH + '/init.js'
    ] )
    .pipe( sourcemaps.init() )
    .pipe( concat( SCRIPTS_FILE_NAME ) )
    .pipe( sourcemaps.write( '.' ) )
    .pipe( gulp.dest( JS_DEST_PATH + '/' ) );
});

gulp.task( 'js:compress', function() {
    gulp.src( JS_DEST_PATH + '/' + SCRIPTS_FILE_NAME )
        .pipe( minify( {
            ext: {
                src:'.js',
                min:'.min.js'
            },
            exclude: [],
            ignoreFiles: [ VENDOR_FILE_NAME, '.min.js' ]
        } ) )
        .pipe( gulp.dest( JS_DEST_PATH + '/' ) );
});

gulp.task( 'js:scripts', [ 'js:concat' ], function() {
    gulp.start( [
        'js:compress'
    ] );
});

// watch scss files, execute task 'css:minify' if found changes
gulp.task( 'sass:watch', function () {
	return watch( SCSS_SRC_PATH + '/**/*.scss', function() {
		gulp.start( 'css:minify' );
	} );
} );