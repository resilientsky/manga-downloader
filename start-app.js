const { spawn } = require('child_process');
const path = require('path');

const BACKEND_PORT = 5004;
const FRONTEND_PORT = 5177;

const startApp = async () => {
    try {
        console.log(`Starting app on fixed ports: Backend ${BACKEND_PORT}, Frontend ${FRONTEND_PORT}`);

        // Start Backend
        const backend = spawn('node', ['backend/server.js'], {
            env: { ...process.env, PORT: BACKEND_PORT },
            stdio: 'inherit',
            shell: true
        });

        // Start Frontend
        const frontend = spawn('npm', ['run', 'dev'], {
            cwd: path.join(__dirname, 'frontend'),
            env: { ...process.env, VITE_API_URL: `http://localhost:${BACKEND_PORT}` },
            stdio: 'inherit',
            shell: true
        });

        const cleanup = () => {
            console.log('Stopping processes...');
            backend.kill();
            frontend.kill();
            process.exit();
        };

        process.on('SIGINT', cleanup);
        process.on('SIGTERM', cleanup);

    } catch (error) {
        console.error('Failed to start app:', error);
    }
};

startApp();
