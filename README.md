# stylelint-formatter-pretty

> A pretty formatter for [Stylelint](https://stylelint.io/)

![Update Status for Dependencies](https://img.shields.io/david/dreamseer/stylelint-formatter-pretty.svg)
![Update Status for Dev Dependencies](https://img.shields.io/david/dev/dreamseer/stylelint-formatter-pretty.svg)
[![Build Status](https://travis-ci.org/Dreamseer/stylelint-formatter-pretty.svg?branch=main)](https://travis-ci.org/Dreamseer/stylelint-formatter-pretty)
[![Coverage Status](https://coveralls.io/repos/github/Dreamseer/stylelint-formatter-pretty/badge.svg?branch=main)](https://coveralls.io/github/Dreamseer/stylelint-formatter-pretty?branch=main)
![Snyk Vulnerabilities for GitHub Repo](https://img.shields.io/snyk/vulnerabilities/github/dreamseer/stylelint-formatter-pretty)
[![Install size](https://packagephobia.now.sh/badge?p=stylelint-formatter-pretty)](https://packagephobia.now.sh/result?p=stylelint-formatter-pretty)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)
[![MIT license](https://img.shields.io/github/license/dreamseer/stylelint-formatter-pretty.svg)](https://github.com/Dreamseer/stylelint-formatter-pretty/blob/main/LICENSE.md)

![Screesnhot](screenshot.png)

## Install

Using [npm](https://www.npmjs.com/get-npm):

```bash
npm install --save-dev stylelint-formatter-pretty
```

Using [yarn](https://yarnpkg.com/):

```bash
yarn add stylelint-formatter-pretty --dev
```

## Usage

### Stylelint CLI

```bash
stylelint file.css --custom-formatter=node_modules/stylelint-formatter-pretty
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
