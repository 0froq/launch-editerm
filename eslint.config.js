import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  ignores: ['dist', 'README.md', 'pnpm-lock.yaml'],
  node: true,
  rules: {
    'no-console': 'off',
    'import/no-mutable-exports': 'off',
    'node/prefer-global/process': 'off',
  },
})
