import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig(({ command }) => {
  // Vercel builds at the domain root into dist/; GitHub Pages serves from
  // /DayTrackV3/ and commits the build into docs/.
  const isVercel = Boolean(process.env.VERCEL);
  return {
    // GitHub Pages project site is served from /DayTrackV3/. Keep dev at root.
    base: command === 'build' ? (isVercel ? '/' : '/DayTrackV3/') : '/',
    plugins: [
      figmaAssetResolver(),
      // The React and Tailwind plugins are both required for Make, even if
      // Tailwind is not being actively used – do not remove them
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        // Alias @ to the src directory
        '@': path.resolve(__dirname, './src'),
      },
    },

    // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
    assetsInclude: ['**/*.svg', '**/*.csv'],

    build: {
      outDir: isVercel ? 'dist' : 'docs',
      emptyOutDir: true,
    },
  };
})
