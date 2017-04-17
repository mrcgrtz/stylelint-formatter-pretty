import test from 'ava';
import stripAnsi from 'strip-ansi';
import m from '../';
import defaultFixture from './fixtures/default';

test('output', t => {
  const output = m(defaultFixture);
  console.log(output);
  t.regex(stripAnsi(output), /first\.css:3:12\n/);
  t.regex(stripAnsi(output), /✖[ ]{3}3:12[ ]{2}Unexpected leading zero[ ]{26}number-leading-zero/);
});
