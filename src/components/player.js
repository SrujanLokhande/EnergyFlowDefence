import { Container, Graphics } from 'pixi.js';
import { GRID_CONFIG } from '../config/gameConfig.js';
import { Movement } from './movement.js';

export class Player {
    constructor() {
        this.container = new Container();
        this.createPlayer();
        
        // Initialize movement component
        this.movement = new Movement(this.container, { speed: 5 });
        this.movement.setRotationEnabled(true);
        
        this.setupControls();
    }

    createPlayer() {
        // Create player body (circle)
        const body = new Graphics()
            .circle(0, 0, GRID_CONFIG.CELL_SIZE * 0.3)
            .fill({ color: 0x3498db }); // Blue color

        // Create player direction indicator (triangle)
        const direction = new Graphics()
            .moveTo(GRID_CONFIG.CELL_SIZE * 0.4, 0)
            .lineTo(GRID_CONFIG.CELL_SIZE * 0.2, -GRID_CONFIG.CELL_SIZE * 0.2)
            .lineTo(GRID_CONFIG.CELL_SIZE * 0.2, GRID_CONFIG.CELL_SIZE * 0.2)
            .closePath()
            .fill({ color: 0x2ecc71 }); // Green color

        this.container.addChild(body, direction);
        
        // Set initial position
        this.container.position.set(
            GRID_CONFIG.WIDTH * GRID_CONFIG.CELL_SIZE / 2,
            GRID_CONFIG.HEIGHT * GRID_CONFIG.CELL_SIZE / 2
        );
    }

    setupControls() {
        this.keys = {
            w: false,
            a: false,
            s: false,
            d: false
        };

        // Setup key listeners
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }

    handleKeyDown(e) {
        if (this.keys.hasOwnProperty(e.key.toLowerCase())) {
            this.keys[e.key.toLowerCase()] = true;
            this.updateMovementFromKeys();
        }
    }

    handleKeyUp(e) {
        if (this.keys.hasOwnProperty(e.key.toLowerCase())) {
            this.keys[e.key.toLowerCase()] = false;
            this.updateMovementFromKeys();
        }
    }

    updateMovementFromKeys() {
        let dx = 0;
        let dy = 0;

        // Calculate movement based on pressed keys
        if (this.keys.w) dy -= 1;
        if (this.keys.s) dy += 1;
        if (this.keys.a) dx -= 1;
        if (this.keys.d) dx += 1;

        // Update movement component velocity
        this.movement.setVelocity(dx, dy);
    }

    update() {
        this.movement.update();
    }

    getPosition() {
        return this.movement.getPosition();
    }
}