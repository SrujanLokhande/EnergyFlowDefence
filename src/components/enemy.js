import { Container, Graphics } from 'pixi.js';
import { Movement } from './movement.js';
import { GRID_CONFIG } from '../config/gameConfig.js';

export class Enemy {
    constructor(x, y, type = 'grunt') {
        this.container = new Container();
        this.type = type;
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.speed = 2;
        this.value = 10; // Score/resource value when destroyed
        
        // Initialize movement component
        this.movement = new Movement(this.container, { speed: this.speed });
        
        // Create enemy visuals
        this.createEnemy();
        
        // Set initial position
        this.container.position.set(x, y);
    }

    createEnemy() {
        // Create enemy body
        this.body = new Graphics()
            .circle(0, 0, GRID_CONFIG.CELL_SIZE * 0.3)
            .fill({ color: 0xe74c3c }); // Red color for enemy

        // Create health bar background
        this.healthBarBg = new Graphics()
            .rect(
                -GRID_CONFIG.CELL_SIZE * 0.3,
                -GRID_CONFIG.CELL_SIZE * 0.5,
                GRID_CONFIG.CELL_SIZE * 0.6,
                GRID_CONFIG.CELL_SIZE * 0.1
            )
            .fill({ color: 0x000000, alpha: 0.5 });

        // Create health bar
        this.healthBar = new Graphics();
        this.updateHealthBar();

        // Add all parts to container
        this.container.addChild(this.body, this.healthBarBg, this.healthBar);
    }

    updateHealthBar() {
        const healthPercent = this.health / this.maxHealth;
        this.healthBar.clear()
            .rect(
                -GRID_CONFIG.CELL_SIZE * 0.3,
                -GRID_CONFIG.CELL_SIZE * 0.5,
                GRID_CONFIG.CELL_SIZE * 0.6 * healthPercent,
                GRID_CONFIG.CELL_SIZE * 0.1
            )
            .fill({ color: this.getHealthColor(healthPercent) });
    }

    getHealthColor(healthPercent) {
        if (healthPercent > 0.6) return 0x2ecc71; // Green
        if (healthPercent > 0.3) return 0xf1c40f; // Yellow
        return 0xe74c3c; // Red
    }

    moveTowards(targetX, targetY) {
        this.movement.moveTowards(targetX, targetY);
    }

    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        this.updateHealthBar();
        return this.health <= 0;
    }

    update() {
        this.movement.update();
    }

    getPosition() {
        return {
            x: this.container.position.x,
            y: this.container.position.y
        };
    }

    destroy() {
        this.container.destroy();
    }
}