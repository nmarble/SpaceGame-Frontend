import { state } from './state.js';

const BASE_URL = 'http://localhost:8080/api';

export async function loadOrbitData(canvasWidth, canvasHeight) {
    try {
        const response = await fetch(`http://localhost:8080/api/ships/positions/planet/{id}?id=${state.selectedCelestial}`, {
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
        state.shipIds = [];

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
                    y: -shipData.yCoordinates[i] * scale,
                });
            }

            state.shipIds.push(shipData.id);
            state.shipOrbits.push(singleShipTrack);
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
        const response = await fetch(`http://localhost:8080/api/planets/{id}?id=${state.selectedCelestial}`, {
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

export async function loadPlanetSummaries() {
    try {
        const response = await fetch('http://localhost:8080/api/planets/summaries', {
            credentials: 'include'
        });
        if (!response.ok) throw new Error(`HTTP error status: ${response.status}`);

        const data = await response.json();
        state.planetsList = data; // Store the array directly

        // Auto-select the first planet (Earth) if nothing is selected yet
        if (!state.selectedPlanetId && data.length > 0) {
            state.selectedPlanetId = data[0].id;
        }
    } catch (err) {
        console.error("Failed to load planets list:", err);
    }
}

export async function transferShip(payload) {
    try {
        const response = await fetch(`http://localhost:8080/api/ships/command/move`, { // Ensure this matches your POST URL path
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Transfer failed: ${response.status}`);
        }

        return true;
    } catch (err) {
        console.error("Transmission Error:", err);
        alert("Failed to process orbital transition: " + err.message);
        return false;
    }
}