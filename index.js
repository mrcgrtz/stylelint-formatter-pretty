'use strict';

const path = require('path');
const chalk = require('chalk');
const logSymbols = require('log-symbols');
const plur = require('plur');
const stringWidth = require('string-width');
const ansiEscapes = require('ansi-escapes');

module.exports = results => {
  if (Array.isArray(results) && results.length > 0) {
    const lines = [];
    let errorCount = 0;
    let warningsCount = 0;
    let deprecationsCount = 0;
    let invalidOptionWarningsCount = 0;
    let maxLineWidth = 0;
    let maxColumnWidth = 0;
    let maxMessageWidth = 0;
    let showLineNumbers = false;
    let deprecations = [];
    let invalidOptionWarnings = [];

    const cleanUpAdditionals = items => {
      const cleanItems = [];
      items = items
        .sort((a, b) => a.text === b.text)
        .filter((item, idx, array) => array.findIndex(d => d.text === item.text) === idx);
      items.forEach(x => cleanItems.push({
        text: x.text.replace(/\B"(.*?)"\B|\B'(.*?)'\B/g, (m, p1, p2) => chalk.bold(p1 || p2))
      }));
      return cleanItems;
    };

    results
      .sort((a, b) => a.warnings.length - b.warnings.length)
      .forEach(result => {
        const {warnings} = result;

        if (result.deprecations.length > 0) {
          result.deprecations.forEach(x => deprecations.push(x));
        }

        if (result.invalidOptionWarnings.length > 0) {
          result.invalidOptionWarnings.forEach(x => invalidOptionWarnings.push(x));
        }

        if (result.parseErrors && result.parseErrors.length > 0) {
          result.parseErrors.forEach(x => warnings.push(x));
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
          firstLineCol: warnings[0].line + ':' + warnings[0].column
        });

        warnings
          .sort((a, b) => {
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
          })
          .forEach(x => {
            let message = x.text;

            // Remove rule ID from message
            message = message.replace(/\s\(.+\)$/g, '');

            // Stylize inline code blocks
            message = message.replace(/\B"(.*?)"\B|\B'(.*?)'\B/g, (m, p1, p2) => chalk.bold(p1 || p2));

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
            showLineNumbers = showLineNumbers || x.line || x.column;

            lines.push({
              type: 'message',
              severity,
              line,
              lineWidth,
              column,
              columnWidth,
              message,
              messageWidth,
              ruleId: x.rule || ''
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
      output += ansiEscapes.iTerm.setCwd();
    }

    output += lines.map(x => {
      if (x.type === 'header') {
        // Add the line number so it's Cmd+click'able in some terminals
        // Use dim & gray for terminals like iTerm that doesn't support `hidden`
        const position = showLineNumbers ? chalk.hidden.dim.gray(`:${x.firstLineCol}`) : '';

        return '  ' + chalk.underline(x.relativeFilePath + position);
      }

      if (x.type === 'message') {
        const line = [
          '',
          x.severity === 'warning' ? logSymbols.warning : logSymbols.error,
          ' '.repeat(maxLineWidth - x.lineWidth) + chalk.dim(x.line + chalk.gray(':') + x.column),
          ' '.repeat(maxColumnWidth - x.columnWidth) + x.message,
          ' '.repeat(maxMessageWidth - x.messageWidth) + chalk.gray.dim(x.ruleId)
        ];

        if (!showLineNumbers) {
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
      output += `  ${chalk.underline('Stylelint Configuration')}\n`;
    }

    output += deprecations.map(x => '  ' + logSymbols.info + ' ' + x.text).join('\n');

    if (deprecationsCount > 0) {
      output += '\n';
    }

    output += invalidOptionWarnings.map(x => '  ' + logSymbols.error + ' ' + x.text).join('\n');

    if (invalidOptionWarningsCount > 0) {
      output += '\n';
    }

    if (deprecationsCount + invalidOptionWarningsCount > 0) {
      output += '\n';
    }

    if (warningsCount > 0) {
      output += '  ' + chalk.yellow(`${warningsCount} ${plur('warning', warningsCount)}`) + '\n';
    }

    if (errorCount > 0) {
      output += '  ' + chalk.red(`${errorCount} ${plur('error', errorCount)}`) + '\n';
    }

    if (deprecationsCount > 0) {
      output += '  ' + chalk.blue(`${deprecationsCount} ${plur('deprecation', deprecationsCount)}`) + '\n';
    }

    if (invalidOptionWarningsCount > 0) {
      output += '  ' + chalk.red(`${invalidOptionWarningsCount} invalid ${plur('option', invalidOptionWarningsCount)}`) + '\n';
    }

    return (errorCount + warningsCount + deprecationsCount + invalidOptionWarningsCount) > 0 ? output : '';
  }

  return '';
};
