export default {
  extends: ['./.eslintrc.js'],
  rules: {
    // Downgrade error rules to warnings for CI
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/ban-ts-comment': 'warn',
    '@typescript-eslint/no-require-imports': 'warn',
    'no-case-declarations': 'warn',
    'react-refresh/only-export-components': 'off'
  }
}; 