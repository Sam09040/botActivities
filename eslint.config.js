module.exports = [
  {
    files: ["src/**/*.ts"],
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
      'prettier': require('eslint-plugin-prettier'),
      '@eslint/js': require('@eslint/js'),
    },
    rules: {
      "object-shorthand": ["error", "always"],
    },
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      ecmaVersion: 2018,
      sourceType: 'module',
    },
    settings: {
      prettier: true,
    },
  },
 ];
