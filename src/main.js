import './style.css'
import javascriptLogo from './assets/javascript.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import { setupCounter } from './counter.js'

const loginContainer = document.getElementById('login-container');
const appContainer = document.getElementById('app-container');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('btn-logout');

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let isRunning = false;

// Change global variable to store an array of ship tracks
let shipOrbits = [];
// Track multiple frames (one per ship)
let shipFrames = [];

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
            await loadOrbitData();
            showGameDashboard();
        } else {
            loginError.classList.remove('hidden');
        }
    } catch (error) {
        console.error("Connection failed:", error);
        loginError.classList.remove('hidden');
    }
});

function showGameDashboard() {
    console.log("Attempting UI switch...");
    console.log("Login Element:", loginContainer);
    console.log("App Element:", appContainer);
    loginContainer.classList.add('hidden');
    appContainer.classList.remove('hidden');

    resizeCanvas();

    window.addEventListener('resize', resizeCanvas);

    isRunning = true;
    requestAnimationFrame(renderLoop);
}

function drawShip(ctx) {
    ctx.beginPath();
    ctx.moveTo(0, -15);   // Nose of the ship
    ctx.lineTo(-10, 10);  // Bottom left
    ctx.lineTo(10, 10);   // Bottom right
    ctx.closePath();

    ctx.fillStyle = '#f43f5e'; // Rose/Red color for the ship
    ctx.fill();
}

function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function renderLoop() {
    if (!isRunning) return;
    ctx.clearRect(0,0, canvas.width, canvas.height);

    // 1. Define the planet's position (always dynamic/current screen middle)
    const planetX = canvas.width / 2;
    const planetY = canvas.height / 2;

    // 2. Draw Planet
    ctx.beginPath();
    ctx.arc(planetX, planetY, 30, 0, 2 * Math.PI);
    ctx.fillStyle = '#38bdf8';
    ctx.fill();

    // Iterate through all ships
    shipOrbits.forEach((orbitCoordinates, index) => {
        if (orbitCoordinates.length === 0) return;

        // Get this specific ship's current step frame index
        const currentFrame = shipFrames[index];
        const nextFrame = (currentFrame + 1) % orbitCoordinates.length;

        const currentPt = orbitCoordinates[currentFrame];
        const nextPt = orbitCoordinates[nextFrame];

        // Calculate velocity vector heading angle
        const angle = Math.atan2(nextPt.y - currentPt.y, nextPt.x - currentPt.x);

        ctx.save();

        // 1. Position world at the planet center
        ctx.translate(planetX, planetY);

        // 2. Offset world by the ship's relative localized position coordinates
        ctx.translate(currentPt.x, currentPt.y);

        // 3. Orient heading direction
        ctx.rotate(angle + Math.PI / 2);

        // Draw the local 0,0 ship assets
        drawShip(ctx);

        ctx.restore();

        // Progress this specific ship's timeline frame position index independently
        shipFrames[index] = nextFrame;
    })

    requestAnimationFrame(renderLoop);
}

async function loadOrbitData() {
    try {
        const response = await fetch('http://localhost:8080/api/ships/positions/planet/{id}?id=6a4f33adc80b5c93971b69d2', {
            method: 'GET',
            credentials: 'include'
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Reset tracking structures
        shipOrbits = [];
        shipFrames = [];

        // 2. Determine scale factor
        // The raw numbers go up to ~6800. Let's scale them down so the orbit radius
        // sits nicely on the screen (e.g., maximum radius of ~200 pixels).
        const maxRawValue = 6800;
        const targetRadiusPixels = 200;
        const scale = targetRadiusPixels / maxRawValue;

        // 3. Center point of your viewport
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // Loop through every ship returned by the backend
        data.forEach((shipData, index) => {
            const singleShipTrack = [];

            for (let i = 0; i < shipData.xCoordinates.length; i++) {
                singleShipTrack.push({
                    x: shipData.xCoordinates[i] * scale,
                    y: -shipData.yCoordinates[i] * scale // Safe Cartesian Y inversion
                });
            }

            shipOrbits.push(singleShipTrack);

            // Stagger starting frames so ships don't stack directly on top of each other
            // (e.g., Ship 0 starts at frame 0, Ship 1 starts at frame 40, etc.)
            shipFrames.push((index * 40) % singleShipTrack.length);
        });

        console.log(`Successfully loaded ${orbitCoordinates.length} orbital path nodes!`);

    } catch (error) {
        console.error("Failed to fetch orbital positions from backend:", error);
        // Fallback: If backend is down, keep rendering loop running but empty
    }
}

logoutBtn.addEventListener('click', () => {
    isRunning = false;
    appContainer.classList.add('hidden');
    loginContainer.classList.remove('hidden');
    loginForm.reset();
})
