import process from 'node:process';
import test from 'ava';
import stripAnsi from 'strip-ansi';
import ansiEscapes from 'ansi-escapes';

import m from '../index.js';

import defaultFixture from './fixtures/default.js';
import deprecationsFixture from './fixtures/deprecations.js';
import invalidOptionsFixture from './fixtures/invalid-options.js';
import parseErrorFixture from './fixtures/parse-error.js';
import linterResultFixture from './fixtures/linter-result.js';

const enableHyperlinks = () => {
	process.env.FORCE_HYPERLINK = '1';
};

const disableHyperlinks = () => {
	process.env.FORCE_HYPERLINK = '0';
};

test('output', t => {
	disableHyperlinks();
	const output = m(defaultFixture);
	t.regex(stripAnsi(output), /first\.css:3:12\n/);
	t.regex(stripAnsi(output), /✖ {3}3:12 {2}Unexpected leading zero {26}number-leading-zero/);
});

test('deprecations', t => {
	disableHyperlinks();
	const output = m(deprecationsFixture);
	t.regex(stripAnsi(output), /Stylelint Configuration\n/);
	t.regex(stripAnsi(output), /ℹ time-no-imperceptible has been deprecated and in 8.0 will be removed. Instead use time-min-milliseconds with 100 as its primary option./);
	t.regex(stripAnsi(output), /ℹ block-no-single-line has been deprecated and in 8.0 will be removed. Instead use block-opening-brace-newline-after and block-closing-brace-newline-before with the always option./);
	t.regex(stripAnsi(output), /2 deprecations/);
});

test('invalid options', t => {
	disableHyperlinks();
	const output = m(invalidOptionsFixture);
	t.regex(stripAnsi(output), /Stylelint Configuration\n/);
	t.regex(stripAnsi(output), /✖ Invalid option value snakeCase for rule value-keyword-case/);
	t.regex(stripAnsi(output), /✖ Unexpected option value always for rule no-unknown-animations/);
	t.regex(stripAnsi(output), /2 invalid options/);
});

test('parse errors', t => {
	disableHyperlinks();
	const output = m(parseErrorFixture);
	t.regex(stripAnsi(output), /first\.css:7:12\n/);
	t.regex(stripAnsi(output), /✖ {2}7:12 {2}Unexpected token {2}parseError/);
	t.regex(stripAnsi(output), /1 error/);
});

test('empty results', t => {
	disableHyperlinks();
	const output = m([]);
	t.is(stripAnsi(output), '');
});

test('invalid Stylelint output', t => {
	disableHyperlinks();
	const output = m('foobar');
	t.is(stripAnsi(output), '');
});

test('linked rules', t => {
	enableHyperlinks();
	const output = m(defaultFixture, linterResultFixture);
	t.true(output.includes(ansiEscapes.link('number-leading-zero', 'https://stylelint.io/user-guide/rules/number-leading-zero')));
});

test('no errors when no URL is found to link a rule', t => {
	enableHyperlinks();
	const output = m(defaultFixture, linterResultFixture);
	t.true(output.includes('number-no-trailing-zeros'));
});
