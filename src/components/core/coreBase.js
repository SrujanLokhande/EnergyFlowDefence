import { Container } from 'pixi.js';
import { GRID_CONFIG } from '../../config/gameConfig.js';

export class CoreBase {
    constructor() {
        this.container = new Container();
        this.setupPosition();
    }

    setupPosition() {
        // Set initial position to center
        const centerX = Math.floor(GRID_CONFIG.WIDTH / 2) * GRID_CONFIG.CELL_SIZE;
        const centerY = Math.floor(GRID_CONFIG.HEIGHT / 2) * GRID_CONFIG.CELL_SIZE;
        this.container.position.set(centerX, centerY);
    }

    getPosition() {
        return {
            x: this.container.position.x,
            y: this.container.position.y
        };
    }

    getGridPosition() {
        return {
            x: Math.floor(this.container.position.x / GRID_CONFIG.CELL_SIZE),
            y: Math.floor(this.container.position.y / GRID_CONFIG.CELL_SIZE)
        };
    }
}