module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    // OpsCore ERP Specific Rules
    'no-console': 'warn', // Allow console.warn/error for debugging
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'prefer-const': 'error',
    'no-var': 'error',
    
    // Code Style
    'max-len': ['error', { code: 120, ignoreComments: true }],
    'indent': ['error', 2],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'comma-dangle': ['error', 'always-multiline'],
    
    // Node.js/Express Specific
    'global-require': 'off',
    'import/no-dynamic-require': 'off',
    'no-param-reassign': ['error', { props: false }],
    
    // Sequelize/Database Specific
    'camelcase': ['error', { properties: 'never' }], // Allow snake_case for DB fields
    
    // Security
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    
    // Error Handling
    'prefer-promise-reject-errors': 'error',
    
    // File Structure
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],
    'space-before-function-paren': ['error', 'never'],
    
    // Import Rules
    'import/order': ['error', {
      'groups': [
        'builtin',
        'external',
        'internal',
        'parent',
        'sibling',
        'index'
      ],
      'newlines-between': 'always',
    }],
  },
  overrides: [
    {
      files: ['**/*.test.js', '**/*.spec.js'],
      env: {
        jest: true,
      },
      rules: {
        'no-unused-expressions': 'off',
      },
    },
    {
      files: ['migrations/**/*.js', 'seeders/**/*.js'],
      rules: {
        'camelcase': 'off', // Allow snake_case in migrations
        'no-unused-vars': 'off',
      },
    },
  ],
};
