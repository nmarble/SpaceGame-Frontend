import { state } from './state.js';
import { loadPlanetData, loadOrbitData } from './api.js';
import { resizeCanvas, renderGame } from './renderer.js';
import './style.css'

const loginContainer = document.getElementById('login-container');
const appContainer = document.getElementById('app-container');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('btn-logout');

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

loginForm.addEventListener('submit', async(e) => {
    e.preventDefault();
    loginError.classList.add('hidden');

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const credentialsObject = {
        username: username,
        password: password
    }

    try {
        const response = await fetch('http://localhost:8080/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentialsObject),
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (response.ok) {
            const responseData = await response.text();
            showGameDashboard();
        } else {
            loginError.classList.remove('hidden');
        }
    } catch (error) {
        console.error("Connection failed:", error);
        loginError.classList.remove('hidden');
    }
});

async function showGameDashboard() {
    console.log("Attempting UI switch...");
    console.log("Login Element:", loginContainer);
    console.log("App Element:", appContainer);
    loginContainer.classList.add('hidden');
    appContainer.classList.remove('hidden');

    resizeCanvas(canvas);

    window.addEventListener('resize', resizeCanvas);

    state.isRunning = true;
    await bootstrap();
}

window.addEventListener('resize', async () => {
    resizeCanvas(canvas);
    await loadOrbitData(canvas.width, canvas.height);
});

resizeCanvas(canvas);

function gameLoop(currentTime) {
    // 1. If data isn't loaded yet, just skip tracking time and skip the frame
    if (state.shipOrbits.length === 0) {
        requestAnimationFrame(gameLoop);
        return;
    }

    renderGame(canvas, ctx, currentTime);
    requestAnimationFrame(gameLoop);
}

// 3. Initialize App
async function bootstrap() {
    // Core data load sequence
    await loadPlanetData();
    requestAnimationFrame(async () => {
        // Sync layout pixels to the actual CSS layout
        resizeCanvas(canvas);

        // Fetch the orbits using the guaranteed true width/height
        await loadOrbitData(canvas.width, canvas.height);

        // Reset time tracking state cleanly
        state.lastTime = 0;


        // Start the engine loop
        requestAnimationFrame(gameLoop);
    });
    gameLoop();
}

logoutBtn.addEventListener('click', () => {
    state.isRunning = false;
    appContainer.classList.add('hidden');
    loginContainer.classList.remove('hidden');
    loginForm.reset();
})
