import test from 'ava';
import stripAnsi from 'strip-ansi';
import m from '../';
import defaultFixture from './fixtures/default';
import deprecationsFixture from './fixtures/deprecations';

test('output', t => {
  const output = m(defaultFixture);
  console.log(output);
  t.regex(stripAnsi(output), /first\.css:3:12\n/);
  t.regex(stripAnsi(output), /✖[ ]{3}3:12[ ]{2}Unexpected leading zero[ ]{26}number-leading-zero/);
});

test('deprecations', t => {
  const output = m(deprecationsFixture);
  console.log(output);
  t.regex(stripAnsi(output), /Stylelint Configuration\n/);
  t.regex(stripAnsi(output), /ℹ time-no-imperceptible has been deprecated and in 8.0 will be removed. Instead use time-min-milliseconds with 100 as its primary option./);
  t.regex(stripAnsi(output), /ℹ block-no-single-line has been deprecated and in 8.0 will be removed. Instead use block-opening-brace-newline-after and block-closing-brace-newline-before with the always option./);
  t.regex(stripAnsi(output), /2 deprecations/);
});
