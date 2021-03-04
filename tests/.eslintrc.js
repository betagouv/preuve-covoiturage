module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'cypress', 'prettier'],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  extends: [
    'plugin:@typescript-eslint/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    'plugin:cypress/recommended',
    'prettier',
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
  },
  rules: {
    'prettier/prettier': 'error',
    'max-len': ['warn', { code: 120 }],
    '@typescript-eslint/indent': 'off',
    '@typescript-eslint/no-use-before-define': 'warn',
    '@typescript-eslint/camelcase': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-inferrable-types': [
      'warn',
      {
        ignoreProperties: true,
        ignoreParameters: true,
      },
    ],
  },
};
