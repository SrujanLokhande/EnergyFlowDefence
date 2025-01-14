import { Health } from '../health.js';
import { CORE_CONFIG, GRID_CONFIG } from '../../config/gameConfig.js';
import { eventManager } from '../../managers/eventManager.js';
import { GameEvents } from '../../config/eventTypes.js';

export class CoreHealth {
    constructor(core) {
        this.core = core;
        this.setupHealth();
        this.setupEventListeners();
    }

    setupHealth() {
        this.health = new Health({
            maxHealth: CORE_CONFIG.MAX_HEALTH,
            showHealthBar: true,
            healthBarOffset: { x: 0, y: -GRID_CONFIG.CELL_SIZE },
            healthBarSize: {
                width: GRID_CONFIG.CELL_SIZE * 1.2,
                height: GRID_CONFIG.CELL_SIZE * 0.15
            },
            onZeroHealth: () => this.onCoreDestroyed()
        });

        this.core.container.addChild(this.health.container);
    }

    setupEventListeners() {
        // Listen for enemy reaching core
        eventManager.subscribe(GameEvents.ENEMY_REACHED_CORE, (data) => {
            console.log("Enemy reached core", data);
            console.log("Core health before damage", this.health.getHealth());
            this.takeDamage(data.damage);
        });
    }

    onCoreDestroyed() {
        eventManager.emit(GameEvents.CORE_DESTROYED, {
            position: this.core.getPosition()
        });
    }

    takeDamage(amount) {
        const isDead = this.health.takeDamage(amount);
        eventManager.emit(GameEvents.CORE_DAMAGED, {
            amount: amount,
            currentHealth: this.health.getHealth(),
            isDead: isDead
        });

        // Trigger visual effect
        if (this.core.visuals) {
            this.core.visuals.setDamageEffect();
        }

        return isDead;
    }

    heal(amount) {
        this.health.heal(amount);
        eventManager.emit(GameEvents.CORE_HEALED, {
            amount: amount,
            currentHealth: this.health.getHealth()
        });

        // Trigger visual effect
        if (this.core.visuals) {
            this.core.visuals.setHealEffect();
        }
    }

    getHealth() {
        return this.health.getHealth();
    }

    isDead() {
        return this.health.isDead();
    }
}