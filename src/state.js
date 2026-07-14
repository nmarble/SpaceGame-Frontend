export const state = {
    isRunning: true,
    shipOrbits: [],
    shipFrames: [],
    planetsList: [],
    selectedCelestial: "6a4f33adc80b5c93971b69d2",
    celestialData: {
        radius: 0,
        pixelRadius: 30,
        color: '#38bdf8',
        name: 'Default'
    },
    lastTime: 0,
    speed: 60 // Number of orbital array indices the ship moves per second
};