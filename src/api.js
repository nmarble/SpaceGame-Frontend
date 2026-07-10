import { state } from './state.js';

const BASE_URL = 'http://localhost:8080/api';

export async function loadOrbitData(canvasWidth, canvasHeight) {
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
        state.shipOrbits = [];
        state.shipFrames = [];

        // 2. Determine scale factor
        // The raw numbers go up to ~6800. Let's scale them down so the orbit radius
        // sits nicely on the screen (e.g., maximum radius of ~200 pixels).
        const maxRawValue = 6800;
        const targetRadiusPixels = Math.min(canvasWidth, canvasHeight) * 0.35;
        const scale = targetRadiusPixels / maxRawValue;


        state.celestialData.pixelRadius = state.celestialData.radius * scale;

        // Loop through every ship returned by the backend
        data.forEach((shipData, index) => {
            const singleShipTrack = [];

            for (let i = 0; i < shipData.xCoordinates.length; i++) {
                singleShipTrack.push({
                    x: shipData.xCoordinates[i] * scale,
                    y: -shipData.yCoordinates[i] * scale // Safe Cartesian Y inversion
                });
            }

            state.shipOrbits.push(singleShipTrack);

            // Stagger starting frames so ships don't stack directly on top of each other
            // (e.g., Ship 0 starts at frame 0, Ship 1 starts at frame 40, etc.)
            state.shipFrames.push((index * 40) % singleShipTrack.length);
        });

        console.log(`Successfully loaded ${state.shipOrbits.length} orbital path nodes!`);

    } catch (error) {
        console.error("Failed to fetch orbital positions from backend:", error);
        // Fallback: If backend is down, keep rendering loop running but empty
    }
}

export async function loadPlanetData() {
    try {
        const response = await fetch('http://localhost:8080/api/planets/{id}?id=6a4f33adc80b5c93971b69d2', {
            credentials: 'include'
        });
        if (!response.ok) throw new Error(`HTTP error status: ${response.status}`);

        const data = await response.json();

        // Map backend properties directly to your local state
        // (Adjust property names like 'data.radius' to match whatever your API returns!)
        state.celestialData = {
            radius: data.gravitational.volumetricMeanRadius_km || 30,
            color: data.color || '#38bdf8',
            name: data.name || 'Unknown'
        };

        console.log(`Loaded planet configuration: ${state.celestialData.name}`);

    } catch (error) {
        console.error("Failed to fetch planet details:", error);
    }
}