/**
 * Sirve dist/ en producción (Render). Usa PORT del entorno o 4173 en local.
 * Evita vite preview en prod y evita problemas de expansión de $PORT en Windows.
 */
const { spawnSync } = require('node:child_process')
const path = require('node:path')

const port = process.env.PORT || '4173'
const serveBin = path.join(__dirname, '..', 'node_modules', '.bin', 'serve')
const args = ['dist', '-s', '-l', `tcp://0.0.0.0:${port}`]

const result = spawnSync(serveBin, args, {
  stdio: 'inherit',
  shell: process.platform === 'win32',
  cwd: path.join(__dirname, '..'),
})

process.exit(result.status === null ? 1 : result.status)
