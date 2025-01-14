export const ENEMY_TYPES = {
    GRUNT: 'GRUNT',
    SPEEDER: 'SPEEDER',
    TANK: 'TANK',
    BOSS: 'BOSS'
};

export const ENEMY_CONFIG = {
    [ENEMY_TYPES.GRUNT]: {
        health: 100,
        speed: 2,
        value: 10,
        color: 0xe74c3c,
        size: 0.3
    },
    [ENEMY_TYPES.SPEEDER]: {
        health: 50,
        speed: 4,
        value: 15,
        color: 0x2ecc71,
        size: 0.25
    },
    [ENEMY_TYPES.TANK]: {
        health: 200,
        speed: 1,
        value: 20,
        color: 0x3498db,
        size: 0.4
    },
    [ENEMY_TYPES.BOSS]: {
        health: 500,
        speed: 0.8,
        value: 30,
        color: 0x9b59b6,
        size: 0.5
    }
};