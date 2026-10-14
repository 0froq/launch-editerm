import { describe, expect, it } from 'vitest'
import { buildEditorCommand } from '../src/editors/index.js'

const pos = { file: '/proj/foo.ts', line: 10, column: 3 }

describe('editor commands', () => {
  it('nvim local', () => {
    const c = buildEditorCommand('nvim', pos, {})
    expect(c.argv).toEqual(['nvim', '+10', '/proj/foo.ts'])
  })

  it('nvim remote', () => {
    const c = buildEditorCommand('nvim', pos, { remoteNvim: { server: '/tmp/nvim.sock' } })
    expect(c.argv).toContain('--server')
    expect(c.argv).toContain('--remote')
  })

  it('vim remote', () => {
    const c = buildEditorCommand('vim', pos, { remoteVim: { servername: 'VIM' } })
    expect(c.argv[0]).toBe('vim')
    expect(c.argv).toContain('--remote')
  })

  it('helix', () => {
    const c = buildEditorCommand('helix', pos, {})
    expect(c.argv).toEqual(['hx', '/proj/foo.ts:10:3'])
  })

  it('emacs', () => {
    const c = buildEditorCommand('emacs', pos, {})
    expect(c.argv).toEqual(['emacsclient', '-n', '+10:3', '/proj/foo.ts'])
  })
})
