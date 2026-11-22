const fixture = [
	{
		source: '/Users/test/Sites/example.com/css/first.css',
		errored: false,
		warnings: [],
		deprecations: [],
		invalidOptionWarnings: [],
		parseErrors: [
			{
				line: 7,
				column: 12,
				rule: 'parseError',
				severity: 'error',
				text: 'Unexpected token (7:12)',
			},
		],
		ignored: false,
	},
];

export default fixture;
