import { Container, Graphics } from 'pixi.js';
import { CORE_CONFIG, GRID_CONFIG } from '../../config/gameConfig.js';

export class CoreVisuals {
    constructor(core) {
        this.core = core;
        this.container = new Container();
        this.createVisuals();
        
        // Add to core's container
        this.core.container.addChild(this.container);
    }

    createVisuals() {
        // Core base (larger circle)
        this.coreBase = new Graphics()
            .circle(0, 0, GRID_CONFIG.CELL_SIZE * CORE_CONFIG.BASE_RADIUS)
            .fill({ color: CORE_CONFIG.BASE_COLOR });

        // Core inner (smaller, glowing circle)
        this.coreInner = new Graphics()
            .circle(0, 0, GRID_CONFIG.CELL_SIZE * CORE_CONFIG.INNER_RADIUS)
            .fill({ color: CORE_CONFIG.INNER_COLOR });

        this.container.addChild(this.coreBase, this.coreInner);
    }

    update(delta, time) {
        if (!this.core.isDead()) {
            const scale = 1 + Math.sin(time * CORE_CONFIG.PULSE_SPEED) * CORE_CONFIG.PULSE_MAGNITUDE;
            this.coreInner.scale.set(scale);
        }
    }

    setDamageEffect() {
        // Flash red when damaged
        this.coreBase.tint = 0xff0000;
        setTimeout(() => {
            this.coreBase.tint = 0xffffff;
        }, 100);
    }

    setHealEffect() {
        // Flash green when healed
        this.coreBase.tint = 0x00ff00;
        setTimeout(() => {
            this.coreBase.tint = 0xffffff;
        }, 100);
    }
}