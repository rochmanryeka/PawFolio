#!/usr/bin/env node
/**
 * PawFolio - Signed APK Build Script
 * 
 * Generates a keystore (if not exists) and builds a signed Android APK.
 * 
 * Usage:
 *   node scripts/build-signed-apk.mjs
 * 
 * Environment variables (optional, will prompt if not set):
 *   PAWFOLIO_KEY_PASSWORD   - Password for the signing key
 *   PAWFOLIO_STORE_PASSWORD - Password for the keystore
 *   PAWFOLIO_KEY_ALIAS      - Key alias (default: pawfolio)
 */

import { execSync, spawnSync } from 'child_process'
import { existsSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import readline from 'readline'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const KEYSTORE_DIR = resolve(ROOT, 'android-signing')
const KEYSTORE_PATH = resolve(KEYSTORE_DIR, 'pawfolio-release.keystore')

const KEY_ALIAS = process.env.PAWFOLIO_KEY_ALIAS || 'pawfolio'
const KEY_PASSWORD = process.env.PAWFOLIO_KEY_PASSWORD
const STORE_PASSWORD = process.env.PAWFOLIO_STORE_PASSWORD

function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise(resolve => rl.question(question, answer => { rl.close(); resolve(answer) }))
}

async function run() {
  console.log('\n� PawFolio Signed APK Builder\n')

  // Ensure keystore dir exists
  mkdirSync(KEYSTORE_DIR, { recursive: true })

  let keyPass = KEY_PASSWORD
  let storePass = STORE_PASSWORD

  // Generate keystore if not present
  if (!existsSync(KEYSTORE_PATH)) {
    console.log('⚠️  Keystore not found. Creating new keystore...\n')

    if (!storePass) {
      storePass = await prompt('Enter keystore password (min 6 chars): ')
    }
    if (!keyPass) {
      keyPass = await prompt('Enter key password (min 6 chars): ')
    }

    const validity = 10000 // days
    // No spaces after commas — keytool on Windows fails with shell:true if dname has spaces
    const dname = "CN=PawFolio,OU=App,O=PawFolio,L=Jakarta,S=Jakarta,C=ID"

    const result = spawnSync('keytool', [
      '-genkey', '-v',
      '-keystore', KEYSTORE_PATH,
      '-alias', KEY_ALIAS,
      '-keyalg', 'RSA',
      '-keysize', '2048',
      '-validity', validity.toString(),
      '-storepass', storePass,
      '-keypass', keyPass,
      '-dname', dname,
      '-storetype', 'PKCS12'
    ], { stdio: 'inherit', shell: true })

    if (result.status !== 0) {
      console.error('❌ Failed to generate keystore. Make sure Java JDK is installed.')
      process.exit(1)
    }

    console.log(`\n✅ Keystore created at: ${KEYSTORE_PATH}`)
    console.log('⚠️  IMPORTANT: Keep this file and passwords safe! You need them to update the app.\n')

    // Save passwords to .env.signing (gitignored)
    const envContent = `# PawFolio Android signing config - DO NOT COMMIT THIS FILE\nPAWFOLIO_KEY_PASSWORD=${keyPass}\nPAWFOLIO_STORE_PASSWORD=${storePass}\nPAWFOLIO_KEY_ALIAS=${KEY_ALIAS}\n`
    const { writeFileSync } = await import('fs')
    writeFileSync(resolve(ROOT, '.env.signing'), envContent)
    console.log('💾 Passwords saved to .env.signing (add to .gitignore!)\n')
  } else {
    console.log(`✅ Using existing keystore: ${KEYSTORE_PATH}`)
    if (!storePass) {
      storePass = await prompt('Keystore password: ')
    }
    if (!keyPass) {
      keyPass = await prompt('Key password: ')
    }
  }

  // Set env vars for Tauri signing
  process.env.ANDROID_SIGNING_STORE_PATH = KEYSTORE_PATH
  process.env.ANDROID_SIGNING_KEY_ALIAS = KEY_ALIAS
  process.env.ANDROID_SIGNING_KEY_PASSWORD = keyPass
  process.env.ANDROID_SIGNING_STORE_PASSWORD = storePass

  console.log('\n🔨 Building signed APK...\n')

  const buildResult = spawnSync('npm', ['run', 'tauri:android:build'], {
    stdio: 'inherit',
    shell: true,
    cwd: ROOT,
    env: {
      ...process.env,
      ANDROID_SIGNING_STORE_PATH: KEYSTORE_PATH,
      ANDROID_SIGNING_KEY_ALIAS: KEY_ALIAS,
      ANDROID_SIGNING_KEY_PASSWORD: keyPass,
      ANDROID_SIGNING_STORE_PASSWORD: storePass,
    }
  })

  if (buildResult.status === 0) {
    console.log('\n✅ Build complete!')
    console.log('📦 APK location:')
    console.log('   src-tauri/gen/android/app/build/outputs/apk/universal/release/')
    console.log('   (file: app-universal-release-unsigned.apk)\n')
    console.log('💡 Tip: With signing env vars set, the APK should be signed automatically by Tauri.')
  } else {
    console.error('\n❌ Build failed. Check the output above for errors.')
    process.exit(1)
  }
}

run().catch(err => {
  console.error('Error:', err)
  process.exit(1)
})
