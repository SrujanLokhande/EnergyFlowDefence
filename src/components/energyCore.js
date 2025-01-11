import { Container, Graphics } from 'pixi.js';
import { CORE_CONFIG, GRID_CONFIG } from '../config/gameConfig.js';
import { Health } from './health.js';
import { eventManager } from '../managers/eventManager.js';
import { GameEvents } from '../config/eventTypes.js';

export class EnergyCore {
    constructor() {
        this.container = new Container();
        
        // Initialize health component
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
        
        this.createCore();

        // Emit core created event
        eventManager.emit(GameEvents.GAME_STARTED, { core: this });
    }

    createCore() {
        // Core base (larger circle)
        this.coreBase = new Graphics()
            .circle(0, 0, GRID_CONFIG.CELL_SIZE * CORE_CONFIG.BASE_RADIUS)
            .fill({ color: CORE_CONFIG.BASE_COLOR });

        // Core inner (smaller, glowing circle)
        this.coreInner = new Graphics()
            .circle(0, 0, GRID_CONFIG.CELL_SIZE * CORE_CONFIG.INNER_RADIUS)
            .fill({ color: CORE_CONFIG.INNER_COLOR });

        // Add to container
        this.container.addChild(this.coreBase, this.coreInner);
        this.container.addChild(this.health.container);

        // Set initial position to center
        const centerX = Math.floor(GRID_CONFIG.WIDTH / 2) * GRID_CONFIG.CELL_SIZE;
        const centerY = Math.floor(GRID_CONFIG.HEIGHT / 2) * GRID_CONFIG.CELL_SIZE;
        this.container.position.set(centerX, centerY);
    }

    onCoreDestroyed() {
        eventManager.emit(GameEvents.CORE_DESTROYED, {
            position: {
                x: this.container.position.x,
                y: this.container.position.y
            }
        });
    }

    update(delta, time) {
        if (!this.isDead()) {
            const scale = 1 + Math.sin(time * CORE_CONFIG.PULSE_SPEED) * CORE_CONFIG.PULSE_MAGNITUDE;
            this.coreInner.scale.set(scale);
        }
    }

    takeDamage(amount) {
        const isDead = this.health.takeDamage(amount);
        eventManager.emit(GameEvents.CORE_DAMAGED, {
            amount: amount,
            currentHealth: this.health.getHealth(),
            isDead: isDead
        });
        return isDead;
    }

    heal(amount) {
        this.health.heal(amount);
        eventManager.emit(GameEvents.CORE_HEALED, {
            amount: amount,
            currentHealth: this.health.getHealth()
        });
    }

    getHealth() {
        return this.health.getHealth();
    }

    isDead() {
        return this.health.isDead();
    }

    getPosition() {
        return {
            x: this.container.position.x,
            y: this.container.position.y
        };
    }
}