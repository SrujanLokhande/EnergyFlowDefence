import { CoreBase } from './coreBase.js';
import { CoreVisuals } from './coreVisual.js';
import { CoreHealth } from './coreHealth.js';
import { eventManager } from '../../managers/eventManager.js';
import { GameEvents } from '../../config/eventTypes.js';

export class EnergyCore extends CoreBase {
    constructor() {
        super();
        
        // Initialize components
        this.visuals = new CoreVisuals(this);
        this.healthSystem = new CoreHealth(this);

        // Initialize core
        this.initialize();
    }

    initialize() {
        eventManager.emit(GameEvents.GAME_STARTED, { core: this });
    }

    update(delta, time) {
        this.visuals.update(delta, time);
    }

    // Health management delegates
    takeDamage(amount) {
        return this.healthSystem.takeDamage(amount);
    }

    heal(amount) {
        this.healthSystem.heal(amount);
    }

    getHealth() {
        return this.healthSystem.getHealth();
    }

    isDead() {
        return this.healthSystem.isDead();
    }
}