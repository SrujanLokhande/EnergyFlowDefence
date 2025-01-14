import { TowerBase } from './towerBase.js';
import { TowerVisuals } from './towerVisual.js';
import { TowerCombat } from './towerCombat.js';

export class Tower extends TowerBase {
    constructor(gridX, gridY) {
        super(gridX, gridY);
        
        // Initialize components
        this.visuals = new TowerVisuals(this);
        this.combat = new TowerCombat(this);
    }

    setConnected(connected) {
        super.setConnected(connected);
        this.visuals.updateConnectionStatus(connected);
    }

    showRange(show = true) {
        this.visuals.showRange(show);
    }

    update(time, enemies) {
        this.combat.update(time, enemies);
    }

    destroy() {
        this.combat.destroy();
        this.visuals.destroy();
        super.destroy();
    }
}