import { Container } from 'pixi.js';
import { GRID_CONFIG } from '../../config/gameConfig.js';
import { eventManager } from '../../managers/eventManager.js';
import { GameEvents } from '../../config/eventTypes.js';

export class TowerBase {
    constructor(gridX, gridY) {
        this.container = new Container();
        this.gridPosition = { x: gridX, y: gridY };
        this.id = `tower-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Core properties
        this.isConnected = false;
        this.type = 'BASIC';
        this.level = 1;
        
        // Stats (will be configured by factory)
        this.stats = {
            range: 3,
            damage: 20,
            attackSpeed: 1
        };

        this.updatePosition();
    }

    setStats(stats) {
        this.stats = { ...this.stats, ...stats };
    }

    setConnected(connected) {
        if (this.isConnected === connected) return;
        this.isConnected = connected;
        
        eventManager.emit(GameEvents.TOWER_NETWORK_UPDATED, {
            connectedCount: this.isConnected ? 1 : 0,
            totalTowers: 1
        });
    }

    getPosition() {
        return {
            x: this.container.position.x,
            y: this.container.position.y
        };
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

    destroy() {
        this.container.destroy();
    }
}