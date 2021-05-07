import test from 'ava';
import stripAnsi from 'strip-ansi';
import defaultFixture from '../fixtures/default.js';
import deprecationsFixture from '../fixtures/deprecations.js';
import invalidOptionsFixture from '../fixtures/invalid-options.js';
import parseErrorFixture from '../fixtures/parse-error.js';
import m from '../index.js';

test('output', t => {
  const output = m(defaultFixture);
  t.regex(stripAnsi(output), /first\.css:3:12\n/);
  t.regex(stripAnsi(output), /✖ {3}3:12 {2}Unexpected leading zero {26}number-leading-zero/);
});

test('deprecations', t => {
  const output = m(deprecationsFixture);
  t.regex(stripAnsi(output), /Stylelint Configuration\n/);
  t.regex(stripAnsi(output), /ℹ time-no-imperceptible has been deprecated and in 8.0 will be removed. Instead use time-min-milliseconds with 100 as its primary option./);
  t.regex(stripAnsi(output), /ℹ block-no-single-line has been deprecated and in 8.0 will be removed. Instead use block-opening-brace-newline-after and block-closing-brace-newline-before with the always option./);
  t.regex(stripAnsi(output), /2 deprecations/);
});

test('invalid options', t => {
  const output = m(invalidOptionsFixture);
  t.regex(stripAnsi(output), /Stylelint Configuration\n/);
  t.regex(stripAnsi(output), /✖ Invalid option value snakeCase for rule value-keyword-case/);
  t.regex(stripAnsi(output), /✖ Unexpected option value always for rule no-unknown-animations/);
  t.regex(stripAnsi(output), /2 invalid options/);
});

test('parse errors', t => {
  const output = m(parseErrorFixture);
  t.regex(stripAnsi(output), /first\.css:7:12\n/);
  t.regex(stripAnsi(output), /✖ {2}7:12 {2}Unexpected token {2}parseError/);
  t.regex(stripAnsi(output), /1 error/);
});

test('empty results', t => {
  const output = m([]);
  t.is(stripAnsi(output), '');
});

test('invalid Stylelint output', t => {
  const output = m('foobar');
  t.is(stripAnsi(output), '');
});
