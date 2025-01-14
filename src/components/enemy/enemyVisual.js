import { Graphics } from 'pixi.js';
import { GRID_CONFIG } from '../../config/gameConfig.js';

export class EnemyVisuals {
    constructor(container) {
        this.container = container;
        this.size = 0.3;
        this.color = 0xe74c3c;
        this.createVisuals();
    }

    createVisuals() {
        this.body = new Graphics()
            .circle(0, 0, GRID_CONFIG.CELL_SIZE * this.size)
            .fill({ color: this.color });
        this.container.addChild(this.body);
    }

    setColor(color) {
        this.color = color;
        this.updateVisuals();
    }

    setSize(size) {
        this.size = size;
        this.updateVisuals();
    }

    updateVisuals() {
        if (this.body) {
            this.body.clear()
                .circle(0, 0, GRID_CONFIG.CELL_SIZE * this.size)
                .fill({ color: this.color });
        }
    }

    update() {
        // For future animations
    }
}
