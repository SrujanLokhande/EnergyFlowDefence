export const GRID_CONFIG = {
    CELL_SIZE: 64,
    WIDTH: 50,
    HEIGHT: 50,
    LINE_COLOR: 0x4a7546,  
    LINE_ALPHA: 0.4,       
    BACKGROUND_COLOR: 0x2d5a27,
    LINE_WIDTH: 2    
};

export const CORE_CONFIG = {
    BASE_COLOR: 0x3498db,
    INNER_COLOR: 0x74b9ff,
    BASE_RADIUS: 0.8,  // Multiplied by grid cell size
    INNER_RADIUS: 0.5, // Multiplied by grid cell size
    PULSE_SPEED: 3,
    PULSE_MAGNITUDE: 0.05,
    MAX_HEALTH: 100
};

export const TOWER_CONFIG = {
    COST: 100,
    BASE_DAMAGE: 10,
    BASE_RANGE: 3,
    BASE_ATTACK_SPEED: 1,
    ENERGY_CONNECTION_RANGE: 4, // Maximum distance for energy connection
    PLACEMENT_RULES: {
        MIN_DISTANCE_FROM_CORE: 2,
        MIN_DISTANCE_BETWEEN_TOWERS: 1
    }
};