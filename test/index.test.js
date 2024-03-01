import process from 'node:process';
import test from 'node:test';
import assert from 'node:assert';
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

test('output', () => {
	disableHyperlinks();
	const output = m(defaultFixture);
	assert.match(stripAnsi(output), /first\.css:3:12\n/);
	assert.match(stripAnsi(output), /✖ {3}3:12 {2}Unexpected leading zero {26}number-leading-zero/);
});

test('deprecations', () => {
	disableHyperlinks();
	const output = m(deprecationsFixture);
	assert.match(stripAnsi(output), /Stylelint Configuration\n/);
	assert.match(stripAnsi(output), /ℹ time-no-imperceptible has been deprecated and in 8.0 will be removed. Instead use time-min-milliseconds with 100 as its primary option./);
	assert.match(stripAnsi(output), /ℹ block-no-single-line has been deprecated and in 8.0 will be removed. Instead use block-opening-brace-newline-after and block-closing-brace-newline-before with the always option./);
	assert.match(stripAnsi(output), /2 deprecations/);
});

test('invalid options', () => {
	disableHyperlinks();
	const output = m(invalidOptionsFixture);
	assert.match(stripAnsi(output), /Stylelint Configuration\n/);
	assert.match(stripAnsi(output), /✖ Invalid option value snakeCase for rule value-keyword-case/);
	assert.match(stripAnsi(output), /✖ Unexpected option value always for rule no-unknown-animations/);
	assert.match(stripAnsi(output), /2 invalid options/);
});

test('parse errors', () => {
	disableHyperlinks();
	const output = m(parseErrorFixture);
	assert.match(stripAnsi(output), /first\.css:7:12\n/);
	assert.match(stripAnsi(output), /✖ {2}7:12 {2}Unexpected token {2}parseError/);
	assert.match(stripAnsi(output), /1 error/);
});

test('empty results', () => {
	disableHyperlinks();
	const output = m([]);
	assert.equal(stripAnsi(output), '');
});

test('invalid Stylelint output', () => {
	disableHyperlinks();
	const output = m('foobar');
	assert.equal(stripAnsi(output), '');
});

test('linked rules', () => {
	enableHyperlinks();
	const output = m(defaultFixture, linterResultFixture);
	assert.ok(output.includes(ansiEscapes.link('number-leading-zero', 'https://stylelint.io/user-guide/rules/number-leading-zero')));
});

test('no errors when no URL is found to link a rule', () => {
	enableHyperlinks();
	const output = m(defaultFixture, linterResultFixture);
	assert.ok(output.includes('number-no-trailing-zeros'));
});
