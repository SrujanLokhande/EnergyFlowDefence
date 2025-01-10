import { Container } from 'pixi.js';
import { Enemy } from '../components/enemy.js';
import { GRID_CONFIG } from '../config/gameConfig.js';

export class EnemySystem {
    constructor(gridSystem, energyCore) {
        this.container = new Container();
        this.gridSystem = gridSystem;
        this.energyCore = energyCore;
        this.enemies = new Set();
        this.spawnPoints = this.generateSpawnPoints();
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

    update() {
        const corePosition = {
            x: this.energyCore.container.position.x,
            y: this.energyCore.container.position.y
        };

        // Update each enemy
        for (const enemy of this.enemies) {
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
                this.energyCore.takeDamage(10);
                this.removeEnemy(enemy);
            }
        }
    }

    removeEnemy(enemy) {
        this.enemies.delete(enemy);
        enemy.destroy();
    }

    getEnemies() {
        return Array.from(this.enemies);
    }

    // Debug method to spawn enemies manually
    debugSpawnEnemy() {
        this.spawnEnemy();
    }
}