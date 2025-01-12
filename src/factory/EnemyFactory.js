import { Enemy } from '../components/enemy.js';
import { eventManager } from '../managers/eventManager.js';
import { GameEvents } from '../config/eventTypes.js';

// Enemy types enum
export const EnemyTypes = {
    GRUNT: 'GRUNT',
    SPEEDER: 'SPEEDER',
    TANK: 'TANK',
    BOSS: 'BOSS'
};

// Enemy configurations
const enemyConfigs = {
    [EnemyTypes.GRUNT]: {
        health: 100,
        speed: 2,
        value: 10,
        color: 0xe74c3c,
        size: 0.3
    },
    [EnemyTypes.SPEEDER]: {
        health: 50,
        speed: 4,
        value: 15,
        color: 0x2ecc71,
        size: 0.25
    },
    [EnemyTypes.TANK]: {
        health: 200,
        speed: 1,
        value: 20,
        color: 0x3498db,
        size: 0.4
    },
    [EnemyTypes.BOSS]: {
        health: 500,
        speed: 0.8,
        value: 50,
        color: 0x9b59b6,
        size: 0.5
    }
};

export class EnemyFactory {
    constructor() {
        this.lastBossWave = 0;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Listen for enemy creation requests
        eventManager.subscribe(GameEvents.ENEMY_CREATION_REQUESTED, (data) => {
            const enemy = this.createEnemy(data.type, data.x, data.y);
            if (enemy) {
                eventManager.emit(GameEvents.ENEMY_CREATED, {
                    enemy,
                    type: data.type,
                    position: { x: data.x, y: data.y }
                });
            }
        });

        // Listen for wave start to create wave enemies
        eventManager.subscribe(GameEvents.WAVE_START_REQUESTED, (data) => {
            const enemies = this.createWaveEnemies(data.wave, data.count, data.spawnPoints);
            eventManager.emit(GameEvents.WAVE_ENEMIES_CREATED, {
                wave: data.wave,
                enemies: enemies
            });
        });
    }

    createEnemy(type, x, y) {
        const config = enemyConfigs[type];
        if (!config) {
            eventManager.emit(GameEvents.ENEMY_CREATION_FAILED, {
                reason: 'invalid_type',
                type: type
            });
            return null;
        }

        // Create base enemy
        const enemy = new Enemy(x, y, type);

        // Configure enemy through events
        eventManager.emit(GameEvents.ENEMY_CONFIGURE_HEALTH, {
            enemy,
            health: config.health
        });

        eventManager.emit(GameEvents.ENEMY_CONFIGURE_MOVEMENT, {
            enemy,
            speed: config.speed
        });

        eventManager.emit(GameEvents.ENEMY_CONFIGURE_VISUALS, {
            enemy,
            color: config.color,
            size: config.size
        });

        enemy.value = config.value;

        return enemy;
    }

    getEnemyTypeForWave(wave) {
        // Every 5th wave is a boss wave
        if (wave % 5 === 0 && wave !== this.lastBossWave) {
            this.lastBossWave = wave;
            return EnemyTypes.BOSS;
        }

        // As waves progress, introduce different enemy types
        const random = Math.random();
        if (wave < 3) {
            return EnemyTypes.GRUNT;
        } else if (wave < 5) {
            return random < 0.7 ? EnemyTypes.GRUNT : EnemyTypes.SPEEDER;
        } else {
            if (random < 0.5) return EnemyTypes.GRUNT;
            if (random < 0.8) return EnemyTypes.SPEEDER;
            return EnemyTypes.TANK;
        }
    }

    createWaveEnemies(wave, count, spawnPoints) {
        const enemies = [];
        for (let i = 0; i < count; i++) {
            const spawnPoint = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];
            const type = this.getEnemyTypeForWave(wave);
            const enemy = this.createEnemy(type, spawnPoint.x, spawnPoint.y);
            if (enemy) enemies.push(enemy);
        }
        return enemies;
    }
}