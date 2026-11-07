import { build } from 'vite'
import { pathToFileURL } from 'node:url'
import path from 'node:path'
const output = path.resolve('node_modules/.cache/ubicate-ui-smoke')
await build({ build: { ssr: 'tools/ui-smoke.jsx', outDir: output, emptyOutDir: true } })
await import(pathToFileURL(path.join(output, 'ui-smoke.js')).href)
