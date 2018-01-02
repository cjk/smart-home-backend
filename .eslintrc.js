module.exports = {
  parser: 'babel-eslint',
  parserOptions: { ecmaVersion: 6 },
  env: {
    browser: false,
    node: true,
  },
  extends: ['airbnb-base', 'plugin:flowtype/recommended'],
  plugins: ['flowtype'],
  globals: {
    APP_NAME: true,
    APP_VERSION: true,
    window: true,
    // Flow. Probably bug, should not be detected.
    $Keys: true,
    $Exact: true,
    Event: true,
    EventHandler: true,
  },
  // AirBnb is great, but very strict. Feel free to add anything.
  rules: {
    'arrow-parens': 0, // Does not work with Flow generic types.
    'comma-dangle': 0, // Because some files are still in ES5.
    'import/first': 0, // Este sorts by atom/sort lines natural order.
    'import/prefer-default-export': 0, // Actions can have just one action.
    indent: 0, // Prettier.
    'function-paren-newline': 0, // Prettier.
    'object-curly-newline': 0, //Prettier.
    'no-confusing-arrow': 0, // This rule is confusing.
    'no-mixed-operators': 0, // Prettier.
    'space-before-function-paren': 0, // Prettier.
    'no-nested-ternary': 0, // Buggy for functional componenents.
    'no-param-reassign': 0, // We love param reassignment. Naming is hard.
    'no-shadow': 0, // Shadowing is a nice language feature. Naming is hard.
    'no-underscore-dangle': 0, // Control freaky.
    // misc (CjK)
    'comma-dangle': ['error', 'only-multiline'],
    'max-len': ['error', 120, { ignoreComments: true }],
    'no-return-assign': ['error', 'except-parens'],
    'one-var': 0,
  },
};
