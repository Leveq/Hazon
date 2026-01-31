// scripts/build-electron.js
import { build } from 'esbuild'
import { cpSync, existsSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, '..')

async function buildElectron() {
  // ─── Main process (CJS) ───
  await build({
    entryPoints: ['src/main/main.ts'],
    outfile: 'dist/main.cjs',
    bundle: true,
    platform: 'node',
    format: 'cjs',
    sourcemap: true,
    external: [
      'electron',  // ← tell esbuild to leave require('electron') alone
    ],
  })

  // ─── Preload (thin CJS bridge) ───
  await build({
    entryPoints: ['src/preload/preload.ts'],
    outfile: 'dist/preload.js',
    bundle: false,
    platform: 'node',
    format: 'cjs',
    sourcemap: true,
  })

  // ─── Copy PDFKit font data ───
  const pdfkitDataSrc = join(rootDir, 'node_modules', 'pdfkit', 'js', 'data')
  const pdfkitDataDest = join(rootDir, 'dist', 'data')
  
  if (existsSync(pdfkitDataSrc)) {
    if (!existsSync(pdfkitDataDest)) {
      mkdirSync(pdfkitDataDest, { recursive: true })
    }
    cpSync(pdfkitDataSrc, pdfkitDataDest, { recursive: true })
    console.log('✅ Copied PDFKit font data')
  }

  console.log('✅ Electron build complete!')
}

buildElectron().catch((e) => {
  console.error(e)
  process.exit(1)
})