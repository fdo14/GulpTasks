const gulp = require("gulp");
const uglify = require("gulp-uglify");
const livereload = require("gulp-livereload");
const concat = require("gulp-concat");
const minifyCss = require("gulp-minify-css");
const autoprefixer = require("gulp-autoprefixer");
const plumber = require("gulp-plumber");
const sourcemaps = require("gulp-sourcemaps");
const sass = require("gulp-sass");
const babel = require("gulp-babel");
const del = require("del");
const zip = require("gulp-zip");

const SCRIPTS_PATH = "public/scripts/**/*.js";
const CSS_PATH = "public/css/**/*.css";
const DIST_PATH = "public/dist";
const TEMPLATES_PATH = "templates/**/*.hbs";
const IMAGES_PATH = "public/images/**/*.{png.jpeg,jpg,svg,gif}";

const handlebars = require("gulp-handlebars");
const handlebarsLib = require("handlebars");
const declare = require("gulp-declare");
const wrap = require("gulp-wrap");

const imagemin = require("gulp-imagemin");
var imageminPngquant = require("imagemin-pngquant");
const imageminJpegRecompress = require("imagemin-jpeg-recompress");

// //Styles
// gulp.task("styles", async function() {
//   console.log("starting styles task");
//   return gulp
//     .src(["public/css/reset.css", CSS_PATH])
//     .pipe(
//       plumber(function(err) {
//         console.log("Styles Task Error");
//         console.log(err);
//         this.emit("end");
//       })
//     )
//     .pipe(sourcemaps.init())
//     .pipe(autoprefixer())
//     .pipe(concat("styles.css"))
//     .pipe(
//       minifyCss({
//         browsers: ["last 2 versions", "ie 8"]
//       })
//     )
//     .pipe(sourcemaps.write())
//     .pipe(gulp.dest(DIST_PATH))
//     .pipe(livereload());
// });

//Styles for SCSS
gulp.task("styles", async function() {
  console.log("starting styles task");
  return gulp
    .src("public/scss/style.scss")
    .pipe(
      plumber(function(err) {
        console.log("Styles Task Error");
        console.log(err);
        this.emit("end");
      })
    )
    .pipe(sourcemaps.init())
    .pipe(autoprefixer())
    .pipe(
      sass({
        outputStyle: "compressed"
      })
    )
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(DIST_PATH))
    .pipe(livereload());
});

gulp.task("scripts", async function() {
  console.log("starting scripts task");

  return gulp
    .src(SCRIPTS_PATH)
    .pipe(
      plumber(function(err) {
        console.log("Styles Task Error");
        console.log(err);
        this.emit("end");
      })
    )
    .pipe(sourcemaps.init())
    .pipe(
      babel({
        presets: ["@babel/env"]
      })
    )
    .pipe(uglify())
    .pipe(concat("scripts.js"))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(DIST_PATH))
    .pipe(livereload());
});

gulp.task("images", async function() {
  return gulp
    .src(IMAGES_PATH)
    .pipe(
      imagemin([
        imagemin.gifsicle(),
        imagemin.jpegtran(),
        imagemin.optipng(),
        imagemin.svgo(),
        imageminPngquant(),
        imageminJpegRecompress()
      ])
    )
    .pipe(gulp.dest(DIST_PATH + "/images"));
});

gulp.task("templates", async function() {
  return gulp
    .src(TEMPLATES_PATH)
    .pipe(
      handlebars({
        handlebars: handlebarsLib
      })
    )
    .pipe(wrap("Handlebars.template(<%= contents %>)"))
    .pipe(
      declare({
        namespace: "templates",
        noRedeclare: true
      })
    )
    .pipe(concat("templates.js"))
    .pipe(gulp.dest(DIST_PATH))
    .pipe(livereload());
});

gulp.task("clean", async function() {
  return del.sync([DIST_PATH]);
});

gulp.task(
  "default",
  gulp.series("images", async function() {
    console.log("default task started");
  })
);

gulp.task("export", async function() {
  return gulp
    .src("public/**/*")
    .pipe(zip("website.zip"))
    .pipe(gulp.dest("./"));
});

gulp.task(
  "watch",
  gulp.series("default", async function() {
    require("./server.js");
    livereload.listen();
    gulp.watch(SCRIPTS_PATH, gulp.series("scripts"));
    gulp.watch(CSS_PATH, gulp.series("styles"));
    gulp.watch("public/scss/**/*.scss", gulp.series("styles"));
    gulp.watch(TEMPLATES_PATH, gulp.series("templates"));
  })
);
