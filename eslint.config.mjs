import unicornPlugin from 'eslint-plugin-unicorn'
import importPlugin from 'eslint-plugin-import'
import nodePlugin from 'eslint-plugin-n'
import globals from 'globals'
import babelParser from '@babel/eslint-parser'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

export default [
  js.configs.recommended,
  nodePlugin.configs['flat/recommended-script'],
  {
    rules: {
      'n/exports-style': ['error', 'module.exports'],
    },
  },
  importPlugin.flatConfigs.recommended,
  unicornPlugin.configs['flat/recommended'],
  {
    rules: {
      'unicorn/better-regex': 'warn',
    },
  },
  {
    ignores: ['**/flow-typed/', '**/node-modules/', '**/app/'],
  },
  {
    plugins: {
      // unicorn: unicornPlugin,
    },

    languageOptions: {
      globals: {
        ...globals.builtin,
        ...globals.node,
        ...globals.jest,
      },

      parser: babelParser,
      ecmaVersion: 2022,
      sourceType: 'module',

      parserOptions: {
        requireConfigFile: 'false',

        babelOptions: {
          configFile: './.babelrc',
        },
      },
    },

    settings: {
      'import/resolver': 'node',
    },

    rules: {
      'arrow-parens': 0,
      'import/extensions': ['error', 'ignorePackages'],
      'import/first': 0,
      'import/prefer-default-export': 0,
      'sort-imports': 'off',
      indent: 0,
      'function-paren-newline': 0,
      'object-curly-newline': 0,
      'no-confusing-arrow': 0,
      'no-mixed-operators': 0,
      'space-before-function-paren': 0,
      'no-nested-ternary': 0,
      'no-param-reassign': 0,
      'no-shadow': 0,
      'no-underscore-dangle': 0,

      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],

      'comma-dangle': ['error', 'only-multiline'],

      'max-len': [
        'error',
        150,
        {
          ignoreComments: true,
          ignoreUrls: true,
          ignoreTemplateLiterals: true,
        },
      ],

      'no-return-assign': ['error', 'except-parens'],
      'one-var': 0,
      'unicorn/filename-case': 0,
      'unicorn/prevent-abbreviations': 0,
      'unicorn/no-array-reduce': 0,
      'unicorn/no-array-for-each': 0,
      'unicorn/no-array-method-this-argument': 0,
      'unicorn/prefer-node-protocol': 0,
    },
  },
]
