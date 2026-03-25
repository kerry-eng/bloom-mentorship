import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
    root: __dirname,
    envDir: path.resolve(__dirname, '..'),
    plugins: [react()],
    server: {
        port: 4174,
        fs: {
            allow: [path.resolve(__dirname, '..')]
        }
    },
    build: {
        outDir: path.resolve(__dirname, 'dist'),
        emptyOutDir: true
    }
})
