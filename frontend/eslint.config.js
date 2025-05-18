import config from 'eslint-config-xo';
import {defineConfig} from 'eslint/config';

export default defineConfig([
	config,
	{
		env: {
			browser: true,
			es2024: true,
		},
		plugins: ['astro'],
		extends: ['plugin:astro/recommended'],
		overrides: [
			{
				files: ['*.astro'],
				parser: 'astro-eslint-parser',
				parserOptions: {
					parser: '@typescript-eslint/parser',
				},
				rules: {
					// Add or override any Astro-specific rules here
				},
			},
		],
	}
]);