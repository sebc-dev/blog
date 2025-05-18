// .prettierrc.mjs
/** @type {import("prettier").Config} */
export default {
	plugins: ['prettier-plugin-astro'],
	tabWidth: 2,
	semi: true,
	singleQuote: true,
	trailingComma: 'es5',
	printWidth: 100,
	overrides: [
		{
			files: '*.astro',
			options: {
				parser: 'astro',
			},
		},
	],
};