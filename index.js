import path from 'node:path';
import process from 'node:process';
import pico from 'picocolors';
import logSymbols from 'log-symbols';
import plur from 'plur';
import stringWidth from 'string-width';
import ansiEscapes from 'ansi-escapes';
import {createSupportsHyperlinks} from 'supports-hyperlinks';

/** @typedef {'warning'|'error'} MessageSeverity */

/**
 * @typedef {object} HeaderLine
 * @property {'header'} type Discriminator for file-header rows
 * @property {string} filePath Absolute file path
 * @property {string} relativeFilePath Path shown in the formatter output
 * @property {string} firstLineCol First warning line and column
 */

/**
 * @typedef {object} MessageLine
 * @property {'message'} type Discriminator for warning/error rows
 * @property {MessageSeverity} severity Warning or error severity
 * @property {string} line Warning line
 * @property {number} lineWidth Display width for line
 * @property {string} column Warning column
 * @property {number} columnWidth Display width for column
 * @property {string} message Formatted warning message
 * @property {number} messageWidth Display width for message
 * @property {string} ruleId Stylelint rule id
 * @property {string|undefined} ruleUrl Stylelint rule URL
 */

/**
 * @typedef {object} SeparatorLine
 * @property {'separator'} type Discriminator for visual spacing rows
 */

/** @typedef {HeaderLine|MessageLine|SeparatorLine} RenderLine */

/**
 * @typedef {object} MessageLineResult
 * @property {MessageLine} line Formatted message line
 * @property {boolean} isError Whether severity is error
 * @property {boolean} hasLineNumber Whether line/column should be shown
 */

/**
 * @typedef {object} MutableFormatterState
 * @property {RenderLine[]} lines Render lines
 * @property {{errorCount: number, warningsCount: number}} counters Error/warning counters
 * @property {{maxLineWidth: number, maxColumnWidth: number, maxMessageWidth: number, showLineNumbers: boolean}} widths Width data and flags
 * @property {{deprecations: Array<{text: string}>, invalidOptionWarnings: Array<{text: string}>}} additionals Additional warnings
 */

/**
 * @typedef {object} FormatterData
 * @property {RenderLine[]} lines Render lines
 * @property {number} errorCount Number of rendered error entries
 * @property {number} warningsCount Warning count
 * @property {number} deprecationsCount Deprecation count
 * @property {number} invalidOptionWarningsCount Invalid option warning count
 * @property {number} maxLineWidth Maximum line width
 * @property {number} maxColumnWidth Maximum column width
 * @property {number} maxMessageWidth Maximum message width
 * @property {boolean} showLineNumbers Whether to show line numbers
 * @property {Array<{text: string}>} deprecations Deprecation warnings
 * @property {Array<{text: string}>} invalidOptionWarnings Deduplicated configuration warnings for invalid options
 */

/**
 * Get the URL for a given Stylelint rule from the linter result.
 * @param {string|undefined} rule Stylelint rule
 * @param {import('stylelint').LinterResult} result Linter result
 * @returns {string|undefined} Stylelint rule URL
 */
function getRuleUrl(rule, result) {
	let ruleUrl;

	try {
		ruleUrl = result.ruleMetadata[rule].url;
	} catch {
		// Do nothing.
	}

	return ruleUrl;
}

/**
 * Stylize quoted text in a string using bold formatting.
 * @param {string} text Linter text
 * @returns {string} Stylized text
 */
function stylizeQuotedText(text) {
	return text.replaceAll(/\B"(?<doubleQuoted>.*?)"\B|\B'(?<singleQuoted>.*?)'\B/gv, (...args) => {
		const groups = args.at(-1);
		return pico.bold(groups.doubleQuoted || groups.singleQuoted);
	});
}

/**
 * Remove duplicate additional warnings and stylize quoted text.
 * @param {{text: string}[]} items Additional warnings
 * @returns {{text: string}[]} Cleaned additional warnings
 */
function cleanUpAdditionals(items) {
	return items
		.toSorted((a, b) => a.text === b.text)
		.filter((item, index, array) => array.findIndex(d => d.text === item.text) === index)
		.map(item => ({
			text: stylizeQuotedText(item.text),
		}));
}

/**
 * Sort warnings by severity, line, and column.
 * @param {import('stylelint').Warning[]} warnings Stylelint warnings
 * @returns {import('stylelint').Warning[]} Sorted warnings
 */
function sortWarnings(warnings) {
	return warnings.toSorted((a, b) => {
		if (a.severity === b.severity) {
			if (a.line === b.line) {
				return a.column < b.column ? -1 : 1;
			}

			return a.line < b.line ? -1 : 1;
		}

		if (a.severity === 2 && b.severity !== 2) {
			return 1;
		}

		return -1;
	});
}

/**
 * Build a single formatted message line from a warning.
 * @param {import('stylelint').Warning} warning Stylelint warning
 * @param {import('stylelint').LinterResult} returnValue Stylelint return value
 * @returns {MessageLineResult} Formatted line metadata
 */
function createMessageLine(warning, returnValue) {
	let message = warning.text;

	// Remove rule ID from message
	message = message.replaceAll(/\s\(.+\)$/gv, '');

	// Stylize inline code blocks
	message = stylizeQuotedText(message);

	const line = String(warning.line || 0);
	const column = String(warning.column || 0);
	const severity = (warning.severity === 2 || warning.severity === 'error') ? 'error' : 'warning';

	return {
		line: {
			type: 'message',
			severity,
			line,
			lineWidth: stringWidth(line),
			column,
			columnWidth: stringWidth(column),
			message,
			messageWidth: stringWidth(message),
			ruleId: warning.rule || '',
			ruleUrl: getRuleUrl(warning.rule, returnValue),
		},
		isError: severity === 'error',
		hasLineNumber: Boolean(warning.line || warning.column),
	};
}

/**
 * Append lines and aggregate counters for one linter result.
 * @param {import('stylelint').LinterResult} result Linter result
 * @param {import('stylelint').LinterResult} returnValue Stylelint return value
 * @param {MutableFormatterState} state Mutable formatter state
 */
function appendResultLines(result, returnValue, state) {
	const {lines, counters, widths, additionals} = state;

	additionals.deprecations.push(...result.deprecations);
	additionals.invalidOptionWarnings.push(...result.invalidOptionWarnings);

	const warnings = [...result.warnings];
	if (Array.isArray(result.parseErrors)) {
		warnings.push(...result.parseErrors);
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

	for (const warning of sortWarnings(warnings)) {
		const formatted = createMessageLine(warning, returnValue);
		counters.errorCount += formatted.isError ? 1 : 0;
		counters.warningsCount += formatted.isError ? 0 : 1;

		widths.maxLineWidth = Math.max(formatted.line.lineWidth, widths.maxLineWidth);
		widths.maxColumnWidth = Math.max(formatted.line.columnWidth, widths.maxColumnWidth);
		widths.maxMessageWidth = Math.max(formatted.line.messageWidth, widths.maxMessageWidth);
		widths.showLineNumbers ||= formatted.hasLineNumber;

		lines.push(formatted.line);
	}
}

/**
 * Collect render data for formatter output.
 * @param {import('stylelint').LinterResult[]} results Stylelint results
 * @param {import('stylelint').LinterResult} returnValue Stylelint return value
 * @returns {FormatterData} Collected formatter data
 */
function collectFormatterData(results, returnValue) {
	const lines = [];
	const counters = {
		errorCount: 0,
		warningsCount: 0,
	};
	const widths = {
		maxLineWidth: 0,
		maxColumnWidth: 0,
		maxMessageWidth: 0,
		showLineNumbers: false,
	};
	const additionals = {
		deprecations: [],
		invalidOptionWarnings: [],
	};

	const sortedResults = results.toSorted((a, b) => a.warnings.length - b.warnings.length);
	for (const result of sortedResults) {
		appendResultLines(result, returnValue, {
			lines,
			counters,
			widths,
			additionals,
		});
	}

	const deprecations = cleanUpAdditionals(additionals.deprecations);
	const invalidOptionWarnings = cleanUpAdditionals(additionals.invalidOptionWarnings);

	return {
		lines,
		errorCount: counters.errorCount,
		warningsCount: counters.warningsCount,
		deprecationsCount: deprecations.length,
		invalidOptionWarningsCount: invalidOptionWarnings.length,
		maxLineWidth: widths.maxLineWidth,
		maxColumnWidth: widths.maxColumnWidth,
		maxMessageWidth: widths.maxMessageWidth,
		showLineNumbers: widths.showLineNumbers,
		deprecations,
		invalidOptionWarnings,
	};
}

/**
 * Render one output line.
 * @param {RenderLine} line Precomputed render token
 * @param {{maxLineWidth: number, maxColumnWidth: number, maxMessageWidth: number, showLineNumbers: boolean}} options Column and visibility settings
 * @returns {string} Rendered line
 */
function renderLine(line, options) {
	if (line.type === 'header') {
		// Add the line number so it's Cmd+click'able in some terminals
		// Use dim & gray for terminals like iTerm that doesn't support `hidden`
		const position = options.showLineNumbers ? pico.hidden(pico.dim(pico.gray(`:${line.firstLineCol}`))) : '';

		return '  ' + pico.underline(line.relativeFilePath + position);
	}

	if (line.type === 'message') {
		const supportsHyperlinks = createSupportsHyperlinks(process.stdout);
		const rule = (line.ruleUrl && supportsHyperlinks ? ansiEscapes.link(line.ruleId, line.ruleUrl) : line.ruleId);
		const outputLine = [
			'',
			line.severity === 'warning' ? logSymbols.warning : logSymbols.error,
			' '.repeat(options.maxLineWidth - line.lineWidth) + pico.dim(line.line + pico.gray(':') + line.column),
			' '.repeat(options.maxColumnWidth - line.columnWidth) + line.message,
			' '.repeat(options.maxMessageWidth - line.messageWidth) + pico.dim(rule),
		];

		if (!options.showLineNumbers) {
			outputLine.splice(2, 1);
		}

		return outputLine.join('  ');
	}

	return '';
}

/**
 * Build final formatter output from collected data.
 * @param {FormatterData} data Collected formatter data
 * @returns {string} Formatted output
 */
function buildOutput(data) {
	let output = '\n';

	if (process.stdout.isTTY && !process.env.CI) {
		// Make relative paths Cmd+click'able in iTerm
		output += ansiEscapes.iTerm.setCwd();
	}

	output += data.lines
		.map(line => renderLine(line, {
			maxLineWidth: data.maxLineWidth,
			maxColumnWidth: data.maxColumnWidth,
			maxMessageWidth: data.maxMessageWidth,
			showLineNumbers: data.showLineNumbers,
		}))
		.join('\n');

	if (data.warningsCount + data.errorCount > 0) {
		output += '\n\n';
	}

	if (data.deprecationsCount + data.invalidOptionWarningsCount > 0) {
		output += `  ${pico.underline('Stylelint Configuration')}\n`;
	}

	output += data.deprecations.map(x => '  ' + logSymbols.info + ' ' + x.text).join('\n');

	if (data.deprecationsCount > 0) {
		output += '\n';
	}

	output += data.invalidOptionWarnings.map(x => '  ' + logSymbols.error + ' ' + x.text).join('\n');

	if (data.invalidOptionWarningsCount > 0) {
		output += '\n';
	}

	if (data.deprecationsCount + data.invalidOptionWarningsCount > 0) {
		output += '\n';
	}

	if (data.warningsCount > 0) {
		output += '  ' + pico.yellow(`${data.warningsCount} ${plur('warning', data.warningsCount)}`) + '\n';
	}

	if (data.errorCount > 0) {
		output += '  ' + pico.red(`${data.errorCount} ${plur('error', data.errorCount)}`) + '\n';
	}

	if (data.deprecationsCount > 0) {
		output += '  ' + pico.blue(`${data.deprecationsCount} ${plur('deprecation', data.deprecationsCount)}`) + '\n';
	}

	if (data.invalidOptionWarningsCount > 0) {
		output += '  ' + pico.red(`${data.invalidOptionWarningsCount} invalid ${plur('option', data.invalidOptionWarningsCount)}`) + '\n';
	}

	return (data.errorCount + data.warningsCount + data.deprecationsCount + data.invalidOptionWarningsCount) > 0 ? output : '';
}

/**
 * Format Stylelint results into a human-readable string.
 * @param {import('stylelint').LinterResult[]} results Stylelint results
 * @param {import('stylelint').LinterResult} returnValue Stylelint return value
 * @returns {import('stylelint').Formatter} Formatted output
 */
function formatter(results, returnValue) {
	if (!Array.isArray(results) || results.length === 0) {
		return '';
	}

	const data = collectFormatterData(results, returnValue);
	return buildOutput(data);
}

export default formatter;
