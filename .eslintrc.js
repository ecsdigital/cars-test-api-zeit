module.exports = {
  parserOptions: {
    ecmaVersion: 2019,
  },

  env: {
    node: true,
  },
  extends: ['eslint:recommended', 'plugin:node/recommended', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': ['error'],
  },
};
