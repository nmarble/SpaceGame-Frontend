export const state = {
    isRunning: true,
    shipOrbits: [],
    shipFrames: [],
    celestialData: {
        radius: 0,
        pixelRadius: 30,
        color: '#38bdf8',
        name: 'Default'
    },
    lastTime: 0,
    speed: 60 // Number of orbital array indices the ship moves per second
};