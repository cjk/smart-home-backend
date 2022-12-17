module.exports = {
  root: true,
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    requireConfigFile: 'false',
    babelOptions: { configFile: './.babelrc' },
  },
  env: {
    es2022: true,
    node: true,
    jest: true,
  },
  plugins: ['flowtype', 'unicorn', 'import', 'fp'],
  extends: ['eslint:recommended', 'plugin:n/recommended', 'plugin:import/recommended', 'plugin:unicorn/recommended'],
  ignorePatterns: ['flow-typed/**/*', 'node-modules/**/*'],
  // AirBnb is great, but very strict. Feel free to add anything.
  rules: {
    'arrow-parens': 0, // Does not work with Flow generic types.
    'import/extensions': ['error', 'ignorePackages'],
    'import/first': 0, // We sort by atom/sort lines natural order.
    'import/prefer-default-export': 0, // Actions can have just one action.
    'sort-imports': 'off',
    // 'import/order': ['error', { alphabetize: { order: 'asc', caseInsensitive: true } }],
    indent: 0, // Prettier.
    'function-paren-newline': 0, // Prettier.
    'object-curly-newline': 0, //Prettier.
    'no-confusing-arrow': 0, // This rule is confusing.
    'no-mixed-operators': 0, // Prettier.
    'space-before-function-paren': 0, // Prettier.
    'no-nested-ternary': 0, // Buggy for functional components.
    'no-param-reassign': 0, // We love param reassignment. Naming is hard.
    'no-shadow': 0, // Shadowing is a nice language feature. Naming is hard.
    'no-underscore-dangle': 0, // Control freaky.
    // misc (CjK)
    'no-unused-vars': ['error', { argsIgnorePattern: '^_', ignoreRestSiblings: true }],
    'comma-dangle': ['error', 'only-multiline'],
    'max-len': ['error', 150, { ignoreComments: true, ignoreUrls: true }],
    'no-return-assign': ['error', 'except-parens'],
    'one-var': 0,
    'unicorn/filename-case': 0,
    'unicorn/prevent-abbreviations': 0,
    'unicorn/no-array-reduce': 0,
    'unicorn/no-array-for-each': 0,
    // This rule gives false-positives with e.g. Rx#map second parameter and we mostly don't use Array#map et.al.
    // directly anyways
    'unicorn/no-array-method-this-argument': 0,
    // Currently breaks at runtime when using Babel; seems to require "type": "module" in package.json but then we'd
    // need to get rid of 'require' et.al.
    'unicorn/prefer-node-protocol': 0,
  },
}
