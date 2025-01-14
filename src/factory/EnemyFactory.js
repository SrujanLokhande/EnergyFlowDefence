import { EnemyBase } from '../components/enemy/enemy.js';
import { ENEMY_CONFIG, ENEMY_TYPES } from '../config/enemyConfig.js';
import { eventManager } from '../managers/eventManager.js';
import { GameEvents } from '../config/eventTypes.js';

export class EnemyFactory {
    constructor() {
        this.setupEventListeners();
    }

    setupEventListeners() {
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
    }

    createEnemy(type, x, y) {
        const config = ENEMY_CONFIG[type];
        if (!config) {
            eventManager.emit(GameEvents.ENEMY_CREATION_FAILED, {
                reason: 'invalid_type',
                type: type
            });
            return null;
        }

        const enemy = new EnemyBase(x, y, type);
        enemy.configure(config);
        return enemy;
    }

    getEnemyTypeForWave(wave) {
        if (wave % 5 === 0) {
            return ENEMY_TYPES.BOSS;
        }

        const random = Math.random();
        if (wave < 3) return ENEMY_TYPES.GRUNT;
        if (wave < 5) return random < 0.7 ? ENEMY_TYPES.GRUNT : ENEMY_TYPES.SPEEDER;
        
        if (random < 0.5) return ENEMY_TYPES.GRUNT;
        if (random < 0.8) return ENEMY_TYPES.SPEEDER;
        return ENEMY_TYPES.TANK;
    }
}