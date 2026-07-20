import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['packages/collaboration/**/*.ts'],
    ignores: ['**/dist/**'],
    languageOptions: {
      parserOptions: {
        project: 'packages/collaboration/tsconfig.build.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
  }
);
