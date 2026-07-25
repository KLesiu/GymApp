import js from '@eslint/js'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import vue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'

const browserGlobals = {
  window: 'readonly',
  document: 'readonly',
  navigator: 'readonly',
  localStorage: 'readonly',
  fetch: 'readonly',
  Headers: 'readonly',
  Response: 'readonly',
  RequestInit: 'readonly',
  AbortSignal: 'readonly',
  setTimeout: 'readonly',
  console: 'readonly',
  process: 'readonly',
  module: 'readonly',
}

export default [
  { ignores: ['dist', 'node_modules', 'src/api/generated'] },
  js.configs.recommended,
  ...vue.configs['flat/recommended'],
  {
    languageOptions: { globals: browserGlobals },
    rules: { 'no-undef': 'off' },
  },
  {
    files: ['**/*.{ts,vue}'],
    languageOptions: { globals: browserGlobals, parser: vueParser, parserOptions: { parser: tsParser, ecmaVersion: 'latest', sourceType: 'module' } },
    plugins: { '@typescript-eslint': tseslint },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      'no-undef': 'off',
      'no-unused-vars': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/html-closing-bracket-spacing': 'off',
      'vue/html-self-closing': 'off',
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },
]
