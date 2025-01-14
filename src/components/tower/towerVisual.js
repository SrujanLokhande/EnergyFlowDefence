import { Container, Graphics } from 'pixi.js';
import { GRID_CONFIG } from '../../config/gameConfig.js';

export class TowerVisuals {
    constructor(tower) {
        this.tower = tower;
        this.container = new Container();
        
        // Create visual components
        this.createBase();
        this.createTurret();
        this.createRangeIndicator();
        
        // Add to tower's container
        this.tower.container.addChild(this.container);
    }

    createBase() {
        this.base = new Graphics()
            .rect(
                -GRID_CONFIG.CELL_SIZE * 0.4,
                -GRID_CONFIG.CELL_SIZE * 0.4,
                GRID_CONFIG.CELL_SIZE * 0.8,
                GRID_CONFIG.CELL_SIZE * 0.8
            )
            .fill({ color: 0x95a5a6 });
        
        this.container.addChild(this.base);
    }

    createTurret() {
        this.turret = new Graphics()
            .circle(0, 0, GRID_CONFIG.CELL_SIZE * 0.25)
            .fill({ color: 0x3498db });
            
        this.container.addChild(this.turret);
    }

    createRangeIndicator() {
        this.rangeIndicator = new Graphics();
        this.updateRangeIndicator();
        this.rangeIndicator.visible = false;
        this.container.addChild(this.rangeIndicator);
    }

    updateRangeIndicator() {
        const range = this.tower.stats.range;
        this.rangeIndicator.clear()
            .circle(0, 0, range * GRID_CONFIG.CELL_SIZE)
            .fill({ color: 0x3498db, alpha: 0.1 })
            .setStrokeStyle({
                width: 2,
                color: 0x3498db,
                alpha: 0.3
            })
            .stroke();
    }

    showRange(show = true) {
        this.rangeIndicator.visible = show;
    }

    updateConnectionStatus(connected) {
        if (this.turret) {
            this.turret.alpha = connected ? 1 : 0.5;
        }
    }

    setTurretRotation(rotation) {
        if (this.turret) {
            this.turret.rotation = rotation;
        }
    }

    setColor(color) {
        if (this.turret) {
            this.turret.clear()
                .circle(0, 0, GRID_CONFIG.CELL_SIZE * 0.25)
                .fill({ color });
        }
    }

    destroy() {
        this.container.destroy();
    }
}