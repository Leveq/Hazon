// scripts/build-electron.js
import { build } from 'esbuild'

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

  console.log('✅ Electron build complete!')
}

buildElectron().catch((e) => {
  console.error(e)
  process.exit(1)
})