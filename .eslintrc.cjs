module.exports = {
  parser: "@babel/eslint-parser",
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parserOptions: {
    "requireConfigFile": false,
    "babelOptions": {
      "presets": ["@babel/preset-react"]
    }
  },
  settings: { react: { version: 'detect' } },
  plugins: ['react-refresh'],
  rules: {
    'react-hooks/exhaustive-deps':'off',
    'react-refresh/only-export-components':'off',
    'react-hooks/exhaustive-deps': 'off',
    'react/no-unknown-property': 'off',
    'react-hooks/rules-of-hooks': 'off',
    'react-hooks/rules-of-hooks': 'off',
    'no-useless-escape': 'off',
    ' react/no-unescaped-entities': 'off',
    'no-undef': 'off',
    'react/no-unescaped-entities': 'off',
    'no-unused-vars': 'off',
    'react/prop-types': 'off',
    'react/jsx-no-target-blank': 'off',
    
  },
}
