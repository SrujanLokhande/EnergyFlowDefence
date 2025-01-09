import { Container, Graphics } from 'pixi.js';
import { CORE_CONFIG, GRID_CONFIG } from '../config/gameConfig.js';

export class EnergyCore {
    constructor() {
        this.container = new Container();
        this.health = CORE_CONFIG.MAX_HEALTH;
        this.createCore();
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

        // Set initial position to center
        const centerX = Math.floor(GRID_CONFIG.WIDTH / 2) * GRID_CONFIG.CELL_SIZE;
        const centerY = Math.floor(GRID_CONFIG.HEIGHT / 2) * GRID_CONFIG.CELL_SIZE;
        this.container.position.set(centerX, centerY);
    }

    update(delta, time) {
        // Pulsing animation
        const scale = 1 + Math.sin(time * CORE_CONFIG.PULSE_SPEED) * CORE_CONFIG.PULSE_MAGNITUDE;
        this.coreInner.scale.set(scale);
    }

    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        // TODO: Add visual feedback for damage
        return this.health <= 0;
    }

    getHealth() {
        return this.health;
    }
}