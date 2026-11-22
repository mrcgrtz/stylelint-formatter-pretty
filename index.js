import path from 'node:path';
import process from 'node:process';
import {stripVTControlCharacters, styleText} from 'node:util';
import logSymbols from 'log-symbols';
import stringWidth from 'string-width';
import {createSupportsHyperlinks} from 'supports-hyperlinks';

/**
 Look up the documentation URL of a rule in the Stylelint rule metadata.
 @param {string|undefined} rule ID of the rule, e.g. `color-hex-length`
 @param {import('stylelint').LinterResult} linterResult Result object holding the rule metadata
 @returns {string|undefined} Documentation URL, if the rule provides one
 */
function getRuleUrl(rule, linterResult) {
	let ruleUrl;

	try {
		ruleUrl = linterResult.ruleMetadata[rule].url;
	} catch {
		// Do nothing.
	}

	return ruleUrl;
}

/**
 Pluralize a word based on a count.
 @param {string} word Singular word
 @param {number} count Number of items the word refers to
 @returns {string} Word, pluralized if needed
 */
const plur = (word, count) => (count === 1 ? word : `${word}s`);

/**
 Create an OSC 8 terminal hyperlink.
 @param {string} text Visible text of the link
 @param {string} url Target the link points to
 @returns {string} Terminal hyperlink
 */
const link = (text, url) => `\u{1B}]8;;${url}\u{7}${text}\u{1B}]8;;\u{7}`;

/**
 Respect the `color` option passed by Stylelint, otherwise detect color support.
 @param {import('stylelint').LinterResult|undefined} linterResult Result object holding the `color` option
 @returns {{style: (format: Parameters<typeof styleText>[0], text: string) => string, symbols: typeof logSymbols}} Style function and symbols
 */
function getColors(linterResult) {
	const color = linterResult?.color;

	if (color === false) {
		return {
			style: (_format, text) => text,
			symbols: Object.fromEntries(Object.entries(logSymbols).map(([key, value]) => [key, stripVTControlCharacters(value)])),
		};
	}

	return {
		// Force color when it's on, otherwise let Node.js detect whether the terminal supports it
		style: (format, text) => styleText(format, text, {validateStream: color !== true}),
		symbols: logSymbols,
	};
}

/**
 Format Stylelint results for the terminal.
 @type {import('stylelint').Formatter}
 */
export default function formatter(results, returnValue) {
	if (Array.isArray(results) && results.length > 0) {
		const {style, symbols} = getColors(returnValue);
		const lines = [];
		let errorCount = 0;
		let warningsCount = 0;
		let deprecationsCount = 0;
		let invalidOptionWarningsCount = 0;
		let maxLineWidth = 0;
		let maxColumnWidth = 0;
		let maxMessageWidth = 0;
		let isShowLineNumbers = false;
		let deprecations = [];
		let invalidOptionWarnings = [];

		const cleanUpAdditionals = items => items
			.toSorted((a, b) => a.text.localeCompare(b.text))
			.filter((item, index, array) => array.findIndex(d => d.text === item.text) === index)
			.map(item => ({
				text: item.text.replaceAll(/\B"(?<double>.*?)"\B|\B'(?<single>.*?)'\B/gv, (m, double, single) => style('bold', double || single)),
			}));

		results
			.toSorted((a, b) => a.warnings.length - b.warnings.length)
			.forEach(result => {
				const {warnings} = result;

				for (const x of result.deprecations) {
					deprecations.push(x);
				}

				for (const x of result.invalidOptionWarnings) {
					invalidOptionWarnings.push(x);
				}

				if (Array.isArray(result.parseErrors)) {
					for (const x of result.parseErrors) {
						warnings.push(x);
					}
				}

				if (warnings.length === 0) {
					return;
				}

				if (lines.length > 0) {
					lines.push({type: 'separator'});
				}

				const filePath = result.source;

				lines.push({
					type: 'header',
					filePath,
					relativeFilePath: path.relative('.', filePath),
					firstLineCol: warnings[0].line + ':' + warnings[0].column,
				});

				warnings
					.toSorted((a, b) => {
						if (a.severity === b.severity) {
							if (a.line === b.line) {
								return a.column < b.column ? -1 : 1;
							}

							return a.line < b.line ? -1 : 1;
						}

						return a.severity === 2 && b.severity !== 2 ? 1 : -1;
					})
					.forEach(x => {
						let message = x.text;

						// Remove rule ID from message
						message = message.replaceAll(/\s\(.+\)$/gv, '');

						// Stylize inline code blocks
						message = message.replaceAll(/\B"(?<double>.*?)"\B|\B'(?<single>.*?)'\B/gv, (m, double, single) => style('bold', double || single));

						const line = String(x.line || 0);
						const column = String(x.column || 0);
						const lineWidth = stringWidth(line);
						const columnWidth = stringWidth(column);
						const messageWidth = stringWidth(message);
						let severity = 'warning';
						if (x.severity === 2 || x.severity === 'error') {
							severity = 'error';
							errorCount++;
						} else {
							warningsCount++;
						}

						maxLineWidth = Math.max(lineWidth, maxLineWidth);
						maxColumnWidth = Math.max(columnWidth, maxColumnWidth);
						maxMessageWidth = Math.max(messageWidth, maxMessageWidth);
						isShowLineNumbers ||= x.line || x.column;

						lines.push({
							type: 'message',
							severity,
							line,
							lineWidth,
							column,
							columnWidth,
							message,
							messageWidth,
							ruleId: x.rule || '',
							ruleUrl: getRuleUrl(x.rule, returnValue),
						});
					});
			});

		deprecations = cleanUpAdditionals(deprecations);
		deprecationsCount = deprecations.length;

		invalidOptionWarnings = cleanUpAdditionals(invalidOptionWarnings);
		invalidOptionWarningsCount = invalidOptionWarnings.length;

		let output = '\n';

		if (process.stdout.isTTY && !process.env.CI) {
			// Make relative paths Cmd+click'able in iTerm
			output += `\u{1B}]50;CurrentDir=${process.cwd()}\u{7}`;
		}

		output += lines.map(x => {
			if (x.type === 'header') {
				// Add the line number so it's Cmd+click'able in some terminals
				// Use dim & gray for terminals like iTerm that doesn't support `hidden`
				const position = isShowLineNumbers ? style(['hidden', 'dim', 'gray'], `:${x.firstLineCol}`) : '';

				return '  ' + style('underline', x.relativeFilePath + position);
			}

			if (x.type === 'message') {
				const supportsHyperlinks = createSupportsHyperlinks(process.stdout);
				const rule = (supportsHyperlinks && x.ruleUrl ? link(x.ruleId, x.ruleUrl) : x.ruleId);
				const line = [
					'',
					x.severity === 'warning' ? symbols.warning : symbols.error,
					' '.repeat(maxLineWidth - x.lineWidth) + style('dim', x.line + style('gray', ':') + x.column),
					' '.repeat(maxColumnWidth - x.columnWidth) + x.message,
					' '.repeat(maxMessageWidth - x.messageWidth) + style('dim', rule),
				];

				if (!isShowLineNumbers) {
					line.splice(2, 1);
				}

				return line.join('  ');
			}

			return '';
		}).join('\n');

		if (warningsCount + errorCount > 0) {
			output += '\n\n';
		}

		if (deprecationsCount + invalidOptionWarningsCount > 0) {
			output += `  ${style('underline', 'Stylelint Configuration')}\n`;
		}

		output += deprecations.map(x => '  ' + symbols.info + ' ' + x.text).join('\n');

		if (deprecationsCount > 0) {
			output += '\n';
		}

		output += invalidOptionWarnings.map(x => '  ' + symbols.error + ' ' + x.text).join('\n');

		if (invalidOptionWarningsCount > 0) {
			output += '\n';
		}

		if (deprecationsCount + invalidOptionWarningsCount > 0) {
			output += '\n';
		}

		if (warningsCount > 0) {
			output += '  ' + style('yellow', `${warningsCount} ${plur('warning', warningsCount)}`) + '\n';
		}

		if (errorCount > 0) {
			output += '  ' + style('red', `${errorCount} ${plur('error', errorCount)}`) + '\n';
		}

		if (deprecationsCount > 0) {
			output += '  ' + style('blue', `${deprecationsCount} ${plur('deprecation', deprecationsCount)}`) + '\n';
		}

		if (invalidOptionWarningsCount > 0) {
			output += '  ' + style('red', `${invalidOptionWarningsCount} invalid ${plur('option', invalidOptionWarningsCount)}`) + '\n';
		}

		return (errorCount + warningsCount + deprecationsCount + invalidOptionWarningsCount) > 0 ? output : '';
	}

	return '';
}
