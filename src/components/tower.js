import { Container, Graphics } from 'pixi.js';
import { GRID_CONFIG } from '../config/gameConfig.js';

export class Tower {
    constructor(gridX, gridY) {
        this.container = new Container();
        this.gridPosition = { x: gridX, y: gridY };
        this.isConnected = false; // Connection status to energy network
        this.range = 3; // Range in grid cells
        this.damage = 10;
        this.attackSpeed = 1; // Attacks per second
        this.lastAttackTime = 0;
        
        this.createTower();
        this.updatePosition();
    }

    createTower() {
        // Create tower base (square)
        this.base = new Graphics()
            .rect(
                -GRID_CONFIG.CELL_SIZE * 0.4,
                -GRID_CONFIG.CELL_SIZE * 0.4,
                GRID_CONFIG.CELL_SIZE * 0.8,
                GRID_CONFIG.CELL_SIZE * 0.8
            )
            .fill({ color: 0x95a5a6 }); // Gray color

        // Create tower turret (circle)
        this.turret = new Graphics()
            .circle(0, 0, GRID_CONFIG.CELL_SIZE * 0.25)
            .fill({ color: 0x3498db }); // Blue color

        // Create range indicator (initially invisible)
        this.rangeIndicator = new Graphics()
            .circle(0, 0, this.range * GRID_CONFIG.CELL_SIZE)
            .fill({ color: 0x3498db, alpha: 0.1 })
            .setStrokeStyle({
                width: 2,
                color: 0x3498db,
                alpha: 0.3
            })
            .stroke();
        this.rangeIndicator.visible = false;

        // Add all parts to container
        this.container.addChild(this.rangeIndicator, this.base, this.turret);
    }

    updatePosition() {
        const pixelPos = this.gridToPixel(this.gridPosition.x, this.gridPosition.y);
        this.container.position.set(pixelPos.x, pixelPos.y);
    }

    gridToPixel(gridX, gridY) {
        return {
            x: gridX * GRID_CONFIG.CELL_SIZE + GRID_CONFIG.CELL_SIZE / 2,
            y: gridY * GRID_CONFIG.CELL_SIZE + GRID_CONFIG.CELL_SIZE / 2
        };
    }

    setConnected(connected) {
        this.isConnected = connected;
        // Visual feedback for connection status
        const color = connected ? 0x3498db : 0x95a5a6;
        this.turret.clear()
            .circle(0, 0, GRID_CONFIG.CELL_SIZE * 0.25)
            .fill({ color });
    }

    showRange(show = true) {
        this.rangeIndicator.visible = show;
    }

    getGridPosition() {
        return { ...this.gridPosition };
    }

    getPosition() {
        return {
            x: this.container.position.x,
            y: this.container.position.y
        };
    }

    // To be implemented: attack and targeting methods
    update(time, enemies) {
        if (!this.isConnected) return; // Don't attack if not connected to energy network

        // Attack logic will be implemented here
    }
}