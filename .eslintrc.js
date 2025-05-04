module.exports = {
  extends: ['./eslint.ci.config.js'],
  rules: {
    // Type safety rules
    '@typescript-eslint/no-explicit-any': 'warn', // Start with warn before making error
    '@typescript-eslint/no-empty-object-type': 'error',
    '@typescript-eslint/ban-ts-comment': 'error',
    '@typescript-eslint/no-require-imports': 'error',
    
    // React hooks rules
    'react-hooks/exhaustive-deps': 'warn', // Start with warn before making error
    
    // Fast refresh compatibility
    'react-refresh/only-export-components': 'warn',
    
    // Other rules
    'prefer-const': 'error',
    'no-case-declarations': 'warn'
  },
  overrides: [
    // Configuration for gradually introducing stricter rules
    {
      // Apply to new files first
      files: ['src/components/new/**/*.{ts,tsx}', 'src/features/new/**/*.{ts,tsx}'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'error', // Stricter for new code
        'react-hooks/exhaustive-deps': 'error'
      }
    }
  ]
}; 