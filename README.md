# stylelint-formatter-pretty

> A pretty formatter for [Stylelint](https://stylelint.io/)

[![Test](https://github.com/mrcgrtz/stylelint-formatter-pretty/actions/workflows/test.yml/badge.svg)](https://github.com/mrcgrtz/stylelint-formatter-pretty/actions/workflows/test.yml)
[![Coverage Status](https://coveralls.io/repos/github/mrcgrtz/stylelint-formatter-pretty/badge.svg?branch=main)](https://coveralls.io/github/mrcgrtz/stylelint-formatter-pretty?branch=main)
[![Install size](https://packagephobia.now.sh/badge?p=stylelint-formatter-pretty)](https://packagephobia.now.sh/result?p=stylelint-formatter-pretty)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/xojs/xo)
[![MIT license](https://img.shields.io/github/license/mrcgrtz/stylelint-formatter-pretty.svg)](https://github.com/mrcgrtz/stylelint-formatter-pretty/blob/main/LICENSE.md)

![Screenshot](screenshot.png)

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
import stylelintFormatter from 'stylelint-formatter-pretty';

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
import gulp from 'gulp';
import stylelint from 'gulp-stylelint';
import stylelintFormatter from 'stylelint-formatter-pretty';

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
import styleLintPlugin from 'stylelint-webpack-plugin';
import stylelintFormatter from 'stylelint-formatter-pretty';

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
