module.exports = {
    parser: 'babel-eslint',
    env: {
      browser: true,
      node: true,
      es6: true,
    },
    extends: ['eslint:recommended', 'plugin:react/recommended'],
    plugins: ['react'],
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
      ecmaVersion: 2018,
      sourceType: 'module',
    },
    rules: {
      // your rules here
    },
  };
  