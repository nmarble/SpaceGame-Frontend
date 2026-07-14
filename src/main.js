import { state } from './state.js';
import {loadPlanetData, loadOrbitData, loadPlanetSummaries} from './api.js';
import { resizeCanvas, renderGame } from './renderer.js';
import './style.css'

const loginContainer = document.getElementById('login-container');
const appContainer = document.getElementById('app-container');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('btn-logout');

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const cycleBtn = document.getElementById('cyclePlanetBtn');

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

// Attach the click event listener to our UI button element
cycleBtn.addEventListener('click', cyclePlanet);

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

async function cyclePlanet() {
    if (state.planetsList.length === 0) return;

    // 1. Find where the current planet sits in the master array list
    const currentIndex = state.planetsList.findIndex(p => p.id === state.selectedCelestial);

    console.log("Current Planet Index Found:", state.selectedCelestial);

    // 2. Jump to the next index, wrapping smoothly back to 0 using the modulo operator
    const nextIndex = (currentIndex + 1) % state.planetsList.length;

    // 3. Update the global active tracking pointer
    const nextPlanet = state.planetsList[nextIndex];
    state.selectedCelestial = nextPlanet.id;

    // Optional: Update button text to display what planet is coming up next
    cycleBtn.innerText = `Next: ${nextPlanet.name}`;

    // 4. Temporarily flag orbits as empty so the render loop safely idles while downloading
    state.shipOrbits = [];

    // 5. Fetch fresh properties and trajectories for the new choice
    await loadPlanetData();
    await loadOrbitData(canvas.width, canvas.height);

    // 6. Reset delta time so the ships don't abruptly teleport across the screen
    state.lastTime = 0;
}

window.addEventListener('resize', async () => {
    resizeCanvas(canvas);
    await loadOrbitData(canvas.width, canvas.height);
});

resizeCanvas(canvas);

function gameLoop(currentTime) {
    // 1. If data isn't loaded yet, just skip tracking time and skip the frame
    if (state.shipOrbits.length === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // OPTIONAL: Re-draw just the planet if planet data is already ready
        const planetX = canvas.width / 2;
        const planetY = canvas.height / 2;
        ctx.beginPath();
        ctx.arc(planetX, planetY, state.celestialData.pixelRadius, 0, 2 * Math.PI);
        ctx.fillStyle = state.celestialData.color;
        ctx.fill();

        requestAnimationFrame(gameLoop);
        return;
    }

    renderGame(canvas, ctx, currentTime);
    requestAnimationFrame(gameLoop);
}

// 3. Initialize App
async function bootstrap() {
    // Core data load sequence
    await loadPlanetSummaries();
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
