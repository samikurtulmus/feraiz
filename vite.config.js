import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Allow building under a sub-path like /v1/ by setting env:
//   PowerShell:  $env:VITE_BASE='/v1/' ; npm run build
//   bash/zsh:    VITE_BASE='/v1/' npm run build
const base = process.env.VITE_BASE || '/'

export default defineConfig({
  base,
  plugins: [react()],
})
