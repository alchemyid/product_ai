import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Load env file based on `mode` in the current working directory.
    // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
    const env = loadEnv(mode, process.cwd(), '');

    return {
        server: {
            port: 3000,
            host: '0.0.0.0',
        },
        plugins: [react()],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            }
        },
        // We expose the API key safely to the client
        // define: {
        //   'process.env': env
        // }
        // Best practice in Vite is using import.meta.env, but we can also map specific vars if needed.
        // We will rely on VITE_GEMINI_API_KEY in the .env file.
    };
});