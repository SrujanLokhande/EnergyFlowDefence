import { Container } from 'pixi.js';
import { EnemyFactory } from '../factory/enemyFactory.js';
import { GRID_CONFIG } from '../config/gameConfig.js';
import { eventManager } from '../managers/eventManager.js';
import { GameEvents } from '../config/eventTypes.js';

export class EnemySystem {
    constructor(gridSystem, energyCore) {
        this.container = new Container();
        this.gridSystem = gridSystem;
        this.energyCore = energyCore;
        this.enemies = new Set();
        this.spawnPoints = this.generateSpawnPoints();
        this.enemyFactory = new EnemyFactory();

        this.setupEventListeners();
    }

    setupEventListeners() {
        eventManager.subscribe(GameEvents.ENEMY_DIED, (data) => {
            this.removeEnemy(data.enemy);
        });

        eventManager.subscribe(GameEvents.GAME_OVER, () => {
            this.clearAllEnemies();
        });
    }

    generateSpawnPoints() {
        const points = [];
        const margin = 2;
        
        // Top edge
        for (let x = margin; x < GRID_CONFIG.WIDTH - margin; x += 5) {
            points.push({ x: x * GRID_CONFIG.CELL_SIZE, y: margin * GRID_CONFIG.CELL_SIZE });
        }
        // Bottom edge
        for (let x = margin; x < GRID_CONFIG.WIDTH - margin; x += 5) {
            points.push({ x: x * GRID_CONFIG.CELL_SIZE, y: (GRID_CONFIG.HEIGHT - margin) * GRID_CONFIG.CELL_SIZE });
        }
        // Left edge
        for (let y = margin; y < GRID_CONFIG.HEIGHT - margin; y += 5) {
            points.push({ x: margin * GRID_CONFIG.CELL_SIZE, y: y * GRID_CONFIG.CELL_SIZE });
        }
        // Right edge
        for (let y = margin; y < GRID_CONFIG.HEIGHT - margin; y += 5) {
            points.push({ x: (GRID_CONFIG.WIDTH - margin) * GRID_CONFIG.CELL_SIZE, y: y * GRID_CONFIG.CELL_SIZE });
        }
        
        return points;
    }

    spawnEnemy(type) {
        const spawnPoint = this.getRandomSpawnPoint();
        const enemy = this.enemyFactory.createEnemy(type, spawnPoint.x, spawnPoint.y);

        if (enemy) {
            this.enemies.add(enemy);
            this.container.addChild(enemy.container);
            eventManager.emit(GameEvents.WAVE_ENEMY_SPAWNED, {
                type: type,
                position: spawnPoint
            });
        }
        return enemy;
    }

    getRandomSpawnPoint() {
        if (!this.spawnPoints || this.spawnPoints.length === 0) {
            return { x: 0, y: 0 }; // fallback
        }
        const index = Math.floor(Math.random() * this.spawnPoints.length);
        return this.spawnPoints[index];
    }

    /**
     * Debug method if you need to manually spawn enemies from console
     */
    debugSpawnEnemy(type) {
        return this.spawnEnemy(type);
    }

    update() {
        const corePosition = {
            x: this.energyCore.container.position.x,
            y: this.energyCore.container.position.y
        };

        for (const enemy of this.enemies) {
            if (enemy.isDead()) continue;

            enemy.moveTowards(corePosition.x, corePosition.y);
            enemy.update();

            const enemyPos = enemy.getPosition();
            if (!enemyPos) continue;

            // If close enough to core, damage it
            const distance = Math.hypot(
                enemyPos.x - corePosition.x, 
                enemyPos.y - corePosition.y
            );
            
            if (distance < GRID_CONFIG.CELL_SIZE) {
                this.energyCore.takeDamage(enemy.value);
                enemy.destroy();
                this.removeEnemy(enemy);
            }
        }
    }

    removeEnemy(enemy) {
        if (this.enemies.has(enemy)) {
            this.enemies.delete(enemy);
            this.container.removeChild(enemy.container);
            enemy.destroy();
        }
    }

    clearAllEnemies() {
        for (const enemy of this.enemies) {
            enemy.destroy();
        }
        this.enemies.clear();
        this.container.removeChildren();
    }

    getEnemies() {
        return Array.from(this.enemies);
    }
}