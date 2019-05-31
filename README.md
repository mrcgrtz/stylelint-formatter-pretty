# stylelint-formatter-pretty [![Build Status](https://travis-ci.org/Dreamseer/stylelint-formatter-pretty.svg?branch=master)](https://travis-ci.org/Dreamseer/stylelint-formatter-pretty) [![Coverage Status](https://coveralls.io/repos/github/Dreamseer/stylelint-formatter-pretty/badge.svg?branch=master)](https://coveralls.io/github/Dreamseer/stylelint-formatter-pretty?branch=master) [![Greenkeeper badge](https://badges.greenkeeper.io/Dreamseer/stylelint-formatter-pretty.svg)](https://greenkeeper.io/)

> A pretty formatter for [Stylelint](https://stylelint.io/)

![](screenshot.png)

## Install

Using [npm](https://www.npmjs.com/get-npm):

```
$ npm install --save-dev stylelint-formatter-pretty
```

Using [yarn](https://yarnpkg.com/):

```
$ yarn add stylelint-formatter-pretty --dev
```

## Usage

### Stylelint CLI

```
$ stylelint file.css --custom-formatter=node_modules/stylelint-formatter-pretty
```

### [grunt-stylelint](https://github.com/wikimedia/grunt-stylelint)

```js
const stylelintFormatter = require('stylelint-formatter-pretty');

grunt.initConfig({
  stylelint: {
    options: {
      formatter: stylelintFormatter
    },
    all: ['css/**/*.css']
  }
});

grunt.loadNpmTasks('grunt-stylelint');
grunt.registerTask('default', ['stylelint']);
```

### [gulp-stylelint](https://github.com/olegskl/gulp-stylelint)

```js
const gulp = require('gulp');
const stylelint = require('gulp-stylelint');
const stylelintFormatter = require('stylelint-formatter-pretty');

gulp.task('lint', () =>
  gulp.src('file.css')
    .pipe(stylelint({
      reporters: [ {
        formatter: stylelintFormatter,
        console: true
      } ]
    }));
);
```

### [Webpack](https://github.com/JaKXz/stylelint-webpack-plugin)

```js
const styleLintPlugin = require('stylelint-webpack-plugin');
const stylelintFormatter = require('stylelint-formatter-pretty');

module.exports = {
  // ...
  plugins: [
    new styleLintPlugin({
      formatter: stylelintFormatter
    }),
  ],
  // ...
}
```

## Tip

In iTerm, <kbd>Cmd</kbd>+Click the filename header to open the file in your editor.

## Related

* [eslint-formatter-pretty](https://github.com/sindresorhus/eslint-formatter-pretty) – a pretty ESLint formatter

## License

MIT © [Sindre Sorhus](https://sindresorhus.com/), [Marc Görtz](https://marcgoertz.de/)
