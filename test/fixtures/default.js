const fixture = [
	{
		source: '/Users/test/Sites/example.com/css/first.css',
		errored: true,
		warnings: [
			{
				line: 3,
				column: 12,
				rule: 'number-leading-zero',
				severity: 'error',
				text: 'Unexpected leading zero (number-leading-zero)',
			}, {
				line: 7,
				column: 3,
				rule: 'declaration-block-no-shorthand-property-overrides',
				severity: 'error',
				text: 'Unexpected shorthand "padding" after "padding-left" (declaration-block-no-shorthand-property-overrides)',
			}, {
				line: 8,
				column: 13,
				rule: undefined,
				severity: 'error',
				text: 'An undefined rule just for the fixture',
			},
		],
		deprecations: [],
		invalidOptionWarnings: [],
		ignored: false,
	}, {
		source: '/Users/test/Sites/example.com/css/second.css',
		errored: false,
		warnings: [
			{
				line: 4,
				column: 11,
				rule: 'number-no-trailing-zeros',
				severity: 'warning',
				text: 'Unexpected trailing zero(s) (number-no-trailing-zeros)',
			},
		],
		deprecations: [],
		invalidOptionWarnings: [],
		ignored: false,
	}, {
		source: '/Users/test/Sites/example.com/css/third.css',
		errored: true,
		warnings: [
			{
				line: 22,
				column: 3,
				rule: 'property-no-vendor-prefix',
				severity: 'error',
				text: 'Unexpected vendor-prefix "-webkit-border-radius" (property-no-vendor-prefix)',
			}, {
				line: 24,
				column: 1,
				rule: 'max-empty-lines',
				severity: 'warning',
				text: 'Expected no more than 1 empty line(s) (max-empty-lines)',
			},
		],
		deprecations: [],
		invalidOptionWarnings: [],
		ignored: false,
	},
];

export default fixture;
