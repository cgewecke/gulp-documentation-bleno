var documentation = require('documentation-bleno');
var through2 = require('through2');
var File = require('vinyl');

/**
 * Documentation stream intended for use within the gulp system.
 *
 * @name documentation
 * @param {string} [format=md] 'md'
 * @param {Object} options documentation options - the same as given to [documentation](https://github.com/documentationjs/documentation)
 * @param {string} options.filename custom filename for md or json output
 * @param {Object} formatterOptions output options - same as given to documentation
 * @param {Object} formatterOptions.name if format is HTML, specifies the name of the project
 * @returns {stream.Transform}
 * @example
 * var gulpDocumentation = require('gulp-documentation'),
 * var gulp = require('gulp');
 * //  Out of the box, you can generate JSON, HTML, and Markdown documentation
 * gulp.task('documentation-readme-example', function () {
 *   // Generating README documentation
 *   return gulp.src('./index.js')
 *     .pipe(gulpDocumentation('md'))
 *     .pipe(gulp.dest('md-documentation'));
 * });
 */
module.exports = function (format, options, formatterOptions) {
  options = options || {};
  formatterOptions = formatterOptions || {};
  var files = [];
  format = format || 'md';
  var formatter = documentation.formats[format];
  if (!formatter) {
    throw new Error('invalid format given: valid options are ' + Object.keys(documentation.formats).join(', '));
  }
  return through2.obj(function document(file, enc, cb) {
    files.push(file);
    cb();
  }, function (cb) {
    documentation.build(files.map(function(file) {
      return file.path;
    }), options, function(err, comments) {
      formatter(comments, formatterOptions, function (err, output) {
        if (format === 'json' || format === 'md') {
          this.push(new File({
            path: options.filename || 'API.' + format,
            contents: new Buffer(output)
          }));
        } else if (format === 'html') {
          output.forEach(function(file) {
            this.push(file);
          }.bind(this));
        }
        cb();
      }.bind(this));
    }.bind(this));
  });
};
