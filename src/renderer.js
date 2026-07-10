import { state } from './state.js';

export function resizeCanvas(canvas) {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
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

export function renderGame(canvas, ctx, currentTime) {
    if (!state.isRunning) return;

    if (!state.lastTime) state.lastTime = currentTime;
    const deltaTime = (currentTime - state.lastTime) / 1000; // e.g., 0.0166 for 60fps
    state.lastTime = currentTime;

    // Cap deltaTime to prevent massive jumps if the user switches tabs and comes back
    const safeDelta = Math.min(deltaTime, 0.1);
    ctx.clearRect(0,0, canvas.width, canvas.height);

    // 1. Define the planet's position (always dynamic/current screen middle)
    const planetX = canvas.width / 2;
    const planetY = canvas.height / 2;

    // 2. Draw Planet
    ctx.beginPath();
    ctx.arc(planetX, planetY, state.celestialData.pixelRadius, 0, 2 * Math.PI);
    ctx.fillStyle = state.celestialData.color;
    ctx.fill();

    // Iterate through all ships
    state.shipOrbits.forEach((orbitCoordinates, index) => {
        if (orbitCoordinates.length === 0) return;

        // 2. Get the current precise float frame and find the integer indices
        const preciseFrame = state.shipFrames[index];
        const totalPoints = orbitCoordinates.length;
        const currentIdx = Math.min(Math.floor(preciseFrame) % totalPoints, totalPoints - 1);
        const nextIdx = (currentIdx + 1) % orbitCoordinates.length;

        const currentPt = orbitCoordinates[currentIdx];
        const nextPt = orbitCoordinates[nextIdx];

        if (!currentPt || !nextPt) return;

        // 3. Calculate accurate heading direction vector
        const angle = Math.atan2(nextPt.y - currentPt.y, nextPt.x - currentPt.x);

        ctx.save();
        ctx.translate(planetX, planetY);
        ctx.translate(currentPt.x, currentPt.y);
        ctx.rotate(angle + Math.PI / 2);

        drawShip(ctx);

        ctx.restore();

        // 4. Progress the frame based entirely on TIME, not refresh rate
        // speed (indices/sec) * safeDelta (seconds passed) = indices to move
        const updatedFrame = preciseFrame + (state.speed * safeDelta);
        state.shipFrames[index] = updatedFrame % orbitCoordinates.length;
    });
}