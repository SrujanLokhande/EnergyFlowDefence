import { Container, Graphics } from 'pixi.js';
import { GRID_CONFIG } from '../config/gameConfig.js';

export class Health {
    constructor(options = {}) {
        this.container = new Container();
        this.maxHealth = options.maxHealth || 100;
        this.health = this.maxHealth;
        this.showHealthBar = options.showHealthBar ?? true;
        this.healthBarOffset = options.healthBarOffset || { x: 0, y: -GRID_CONFIG.CELL_SIZE * 0.5 };
        this.healthBarSize = options.healthBarSize || {
            width: GRID_CONFIG.CELL_SIZE * 0.6,
            height: GRID_CONFIG.CELL_SIZE * 0.1
        };
        this.onZeroHealth = options.onZeroHealth || (() => {});
        
        if (this.showHealthBar) {
            this.createHealthBar();
        }
    }

    createHealthBar() {
        // Create health bar background
        this.healthBarBg = new Graphics()
            .rect(
                -this.healthBarSize.width / 2 + this.healthBarOffset.x,
                this.healthBarOffset.y,
                this.healthBarSize.width,
                this.healthBarSize.height
            )
            .fill({ color: 0x000000, alpha: 0.5 });

        // Create health bar
        this.healthBar = new Graphics();
        this.updateHealthBar();

        // Add to container
        this.container.addChild(this.healthBarBg, this.healthBar);
    }

    updateHealthBar() {
        if (!this.showHealthBar) return;

        const healthPercent = this.health / this.maxHealth;
        this.healthBar.clear()
            .rect(
                -this.healthBarSize.width / 2 + this.healthBarOffset.x,
                this.healthBarOffset.y,
                this.healthBarSize.width * healthPercent,
                this.healthBarSize.height
            )
            .fill({ color: this.getHealthColor(healthPercent) });
    }

    getHealthColor(healthPercent) {
        if (healthPercent > 0.6) return 0x2ecc71; // Green
        if (healthPercent > 0.3) return 0xf1c40f; // Yellow
        return 0xe74c3c; // Red
    }

    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        this.updateHealthBar();
        
        if (this.health <= 0) {
            this.onZeroHealth();
        }
        
        return this.health <= 0;
    }

    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
        this.updateHealthBar();
    }

    setHealth(amount) {
        this.health = Math.min(this.maxHealth, Math.max(0, amount));
        this.updateHealthBar();
    }

    getHealth() {
        return this.health;
    }

    getMaxHealth() {
        return this.maxHealth;
    }

    getHealthPercentage() {
        return this.health / this.maxHealth;
    }

    isDead() {
        return this.health <= 0;
    }
}