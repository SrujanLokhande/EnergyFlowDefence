import { Container } from 'pixi.js';
import { Enemy } from '../components/enemy.js';
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

        // Subscribe to relevant events
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Listen for enemy death events
        eventManager.subscribe(GameEvents.ENEMY_DIED, (data) => {
            this.removeEnemy(data.enemy);
        });

        // Listen for enemy reaching core
        eventManager.subscribe(GameEvents.ENEMY_REACHED_CORE, (data) => {
            this.handleEnemyReachedCore(data);
        });

        // Listen for game over to clear enemies
        eventManager.subscribe(GameEvents.GAME_OVER, () => {
            this.clearAllEnemies();
        });
    }

    generateSpawnPoints() {
        const points = [];
        const margin = 2; // Grid cells from edge

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

    spawnEnemy(type = 'grunt') {
        // Get random spawn point
        const spawnPoint = this.spawnPoints[Math.floor(Math.random() * this.spawnPoints.length)];
        
        // Create new enemy
        const enemy = new Enemy(spawnPoint.x, spawnPoint.y, type);
        this.enemies.add(enemy);
        this.container.addChild(enemy.container);
        
        return enemy;
    }

    handleEnemyReachedCore(data) {
        const { enemy } = data;
        this.energyCore.takeDamage(enemy.value); // Use enemy value as damage
        this.removeEnemy(enemy);
    }

    update() {
        const corePosition = {
            x: this.energyCore.container.position.x,
            y: this.energyCore.container.position.y
        };

        // Update each enemy
        for (const enemy of this.enemies) {
            if (enemy.isDead()) {
                continue; // Skip dead enemies, they'll be removed via event
            }

            // Move towards core
            enemy.moveTowards(corePosition.x, corePosition.y);
            enemy.update();

            // Check collision with core
            const enemyPos = enemy.getPosition();
            const distance = Math.sqrt(
                Math.pow(enemyPos.x - corePosition.x, 2) + 
                Math.pow(enemyPos.y - corePosition.y, 2)
            );

            // If enemy reaches core
            if (distance < GRID_CONFIG.CELL_SIZE) {
                enemy.reachedCore(); // This will emit the ENEMY_REACHED_CORE event
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

    debugSpawnEnemy() {
        const enemy = this.spawnEnemy();
        console.log('Debug: Enemy spawned at', enemy.getPosition());
        return enemy;
    }
}