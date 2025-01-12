import { Container } from 'pixi.js';
import { EnemyFactory, EnemyTypes } from '../factory/EnemyFactory.js';
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
        this.currentWave = 1;

        this.setupEventListeners();
    }

    setupEventListeners() {
        eventManager.subscribe(GameEvents.WAVE_STARTED, (data) => {
            this.currentWave = data.wave;
        });

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

    spawnWave() {
        const enemies = this.enemyFactory.createWaveEnemies(
            this.currentWave,
            Math.min(5 + this.currentWave, 20),
            this.spawnPoints
        );

        enemies.forEach(enemy => {
            this.enemies.add(enemy);
            this.container.addChild(enemy.container);
        });

        return enemies;
    }

    debugSpawnEnemy() {
        const spawnPoint = this.spawnPoints[Math.floor(Math.random() * this.spawnPoints.length)];
        const enemy = this.enemyFactory.createEnemy(EnemyTypes.GRUNT, spawnPoint.x, spawnPoint.y);
        
        if (enemy) {
            this.enemies.add(enemy);
            this.container.addChild(enemy.container);
            console.log('Enemy spawned at', spawnPoint);
        }
        
        return enemy;
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

            const distance = Math.sqrt(
                Math.pow(enemyPos.x - corePosition.x, 2) + 
                Math.pow(enemyPos.y - corePosition.y, 2)
            );

            if (distance < GRID_CONFIG.CELL_SIZE) {
                // First deal damage to core
                this.energyCore.takeDamage(enemy.value);
                // Then notify that enemy reached core
                enemy.reachedCore();
                // Finally remove the enemy
                this.removeEnemy(enemy);
            }
        }
    }

    removeEnemy(enemy) {
        if (this.enemies.has(enemy)) {
            this.enemies.delete(enemy);
            enemy.destroy();
        }
    }

    clearAllEnemies() {
        for (const enemy of this.enemies) {
            enemy.destroy();
        }
        this.enemies.clear();
    }

    getEnemies() {
        return Array.from(this.enemies);
    }
}