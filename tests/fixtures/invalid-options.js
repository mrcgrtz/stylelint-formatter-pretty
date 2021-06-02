const fixture = [
	{
		source: '/Users/test/Sites/example.com/css/first.css',
		errored: false,
		warnings: [],
		deprecations: [],
		invalidOptionWarnings: [
			{text: 'Unexpected option value "always" for rule "no-unknown-animations"'},
			{text: 'Invalid option value "snakeCase" for rule "value-keyword-case"'}
		],
		ignored: false
	}, {
		source: '/Users/test/Sites/example.com/css/second.css',
		errored: false,
		warnings: [],
		deprecations: [],
		invalidOptionWarnings: [
			{text: 'Unexpected option value "always" for rule "no-unknown-animations"'},
			{text: 'Invalid option value "snakeCase" for rule "value-keyword-case"'}
		],
		ignored: false
	}, {
		source: '/Users/test/Sites/example.com/css/third.css',
		errored: false,
		warnings: [],
		deprecations: [],
		invalidOptionWarnings: [
			{text: 'Unexpected option value "always" for rule "no-unknown-animations"'},
			{text: 'Invalid option value "snakeCase" for rule "value-keyword-case"'}
		],
		ignored: false
	}
];

export default fixture;
