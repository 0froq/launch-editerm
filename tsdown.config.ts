import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: [
    'src/cli.ts',
    'src/index.ts',
    'src/integrations/vite.ts',
    'src/integrations/nuxt.ts',
  ],
  format: 'esm',
  platform: 'node',
  target: 'node20',
  clean: true,
  shims: true,
})
