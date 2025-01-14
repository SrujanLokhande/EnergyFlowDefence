// src/components/enemy/enemyHealth.js
import { Container, Graphics } from 'pixi.js';
import { GRID_CONFIG } from '../../config/gameConfig.js';
import { eventManager } from '../../managers/eventManager.js';
import { GameEvents } from '../../config/eventTypes.js';

export class EnemyHealth {
    constructor(parentContainer, options = {}) {
        this.container = new Container();
        this.parentContainer = parentContainer;
        this.onZeroHealth = options.onZeroHealth;
        this.entityId = options.entityId;
        
        this.maxHealth = 100;
        this.currentHealth = this.maxHealth;
        
        this.createHealthBar();
        this.parentContainer.addChild(this.container);
        this.container.position.set(0, -GRID_CONFIG.CELL_SIZE * 0.5);
    }

    createHealthBar() {
        this.healthBarBackground = new Graphics()
            .rect(-20, -2, 40, 4)
            .fill({ color: 0x000000 });

        this.healthBarFill = new Graphics()
            .rect(-20, -2, 40, 4)
            .fill({ color: 0x00ff00 });

        this.container.addChild(this.healthBarBackground, this.healthBarFill);
        this.updateHealthBar();
    }

    updateHealthBar() {
        const healthPercent = this.currentHealth / this.maxHealth;
        this.healthBarFill.clear()
            .rect(-20, -2, 40 * healthPercent, 4)
            .fill({ color: this.getHealthColor(healthPercent) });
    }

    getHealthColor(percent) {
        if (percent > 0.6) return 0x00ff00;
        if (percent > 0.3) return 0xffff00;
        return 0xff0000;
    }

    setMaxHealth(value) {
        this.maxHealth = value;
        this.currentHealth = value;
        this.updateHealthBar();
    }

    takeDamage(amount) {
        this.currentHealth = Math.max(0, this.currentHealth - amount);
        this.updateHealthBar();
        
        eventManager.emit(GameEvents.HEALTH_CHANGED, {
            entityId: this.entityId,
            currentHealth: this.currentHealth,
            maxHealth: this.maxHealth
        });

        if (this.currentHealth <= 0 && this.onZeroHealth) {
            this.onZeroHealth();
            return true;
        }
        return false;
    }

    isDead() {
        return this.currentHealth <= 0;
    }

    getHealth() {
        return this.currentHealth;
    }
}